import { google } from "googleapis";
import { User } from "../models/User.js";
import { Lead } from "../models/Lead.js";
import { signToken, verifyToken } from "../utils/jwt.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import {
  isGoogleConfigured,
  getAuthUrl,
  exchangeCode,
  refreshAndPersist,
  calendarApi,
  buildLeadEvent,
} from "../utils/googleCalendar.js";

const CLIENT_URL = () => process.env.CLIENT_URL || "http://localhost:3000";

export const getStatus = asyncHandler(async (req, res) => {
  const configured = isGoogleConfigured();
  const g = req.user.googleCalendar || {};
  res.json({
    configured,
    connected: Boolean(configured && g.connected && g.refreshToken),
    email: g.email || null,
    lastSyncedAt: g.lastSyncedAt || null,
  });
});

export const getConnectUrl = asyncHandler(async (req, res) => {
  if (!isGoogleConfigured()) {
    return res.status(503).json({
      message:
        "Google Calendar not configured. Add GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI to backend .env",
    });
  }
  const state = signToken({
    id: req.user._id.toString(),
    purpose: "google-cal",
  });
  const url = getAuthUrl(state);
  res.json({ url });
});

export const oauthCallback = asyncHandler(async (req, res) => {
  const { code, state, error } = req.query;
  const redirectFail = `${CLIENT_URL()}/calendar?google=error`;

  if (error || !code || !state) {
    return res.redirect(`${redirectFail}&reason=denied`);
  }

  let decoded;
  try {
    decoded = verifyToken(String(state));
    if (decoded.purpose !== "google-cal" || !decoded.id) {
      throw new Error("bad state");
    }
  } catch {
    return res.redirect(`${redirectFail}&reason=state`);
  }

  const user = await User.findById(decoded.id).select("+googleCalendar.accessToken +googleCalendar.refreshToken");
  if (!user) {
    return res.redirect(`${redirectFail}&reason=user`);
  }

  try {
    const { client, tokens } = await exchangeCode(String(code));
    const oauth2 = google.oauth2({
      version: "v2",
      auth: client,
    });
    const me = await oauth2.userinfo.get();

    user.googleCalendar = {
      connected: true,
      email: me.data.email || "",
      accessToken: tokens.access_token || "",
      refreshToken: tokens.refresh_token || user.googleCalendar?.refreshToken || "",
      expiryDate: tokens.expiry_date || null,
      lastSyncedAt: user.googleCalendar?.lastSyncedAt || null,
    };
    await user.save();

    return res.redirect(`${CLIENT_URL()}/calendar?google=connected`);
  } catch (e) {
    console.error("Google OAuth callback failed:", e.message);
    return res.redirect(`${redirectFail}&reason=token`);
  }
});

export const disconnect = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select(
    "+googleCalendar.accessToken +googleCalendar.refreshToken",
  );
  user.googleCalendar = {
    connected: false,
    email: "",
    accessToken: "",
    refreshToken: "",
    expiryDate: null,
    lastSyncedAt: null,
  };
  await user.save();

  res.json({ ok: true, connected: false });
});

export const syncLeads = asyncHandler(async (req, res) => {
  if (!isGoogleConfigured()) {
    return res.status(503).json({ message: "Google Calendar not configured" });
  }

  const user = await User.findById(req.user._id).select(
    "+googleCalendar.accessToken +googleCalendar.refreshToken",
  );
  if (!user?.googleCalendar?.connected || !user.googleCalendar.refreshToken) {
    return res.status(400).json({ message: "Connect Google Calendar first" });
  }

  const auth = await refreshAndPersist(user);
  const cal = calendarApi(auth);
  const leads = await Lead.find({});

  let created = 0;
  let updated = 0;
  const errors = [];

  for (const lead of leads) {
    const baseDesc = [
      `Lead: ${lead.entity}`,
      `Contact: ${lead.contact}`,
      lead.mobile ? `Mobile: ${lead.mobile}` : "",
      lead.email ? `Email: ${lead.email}` : "",
      `Owner: ${lead.owner}`,
      `Status: ${lead.status}`,
      lead.notes ? `Notes: ${lead.notes}` : "",
      "",
      "Synced from TechCulture Lead Management",
    ]
      .filter(Boolean)
      .join("\n");

    if (lead.meetingDate) {
      const body = buildLeadEvent({
        summary: `Meeting · ${lead.entity}`,
        description: `${baseDesc}\nType: ${lead.meetingType || "Meeting"}`,
        dateStr: lead.meetingDate,
        colorId: "9", // blue
      });
      try {
        if (lead.googleMeetingEventId) {
          await cal.events.update({
            calendarId: "primary",
            eventId: lead.googleMeetingEventId,
            requestBody: body,
          });
          updated += 1;
        } else {
          const { data } = await cal.events.insert({
            calendarId: "primary",
            requestBody: body,
          });
          lead.googleMeetingEventId = data.id;
          await lead.save();
          created += 1;
        }
      } catch (e) {
        // stale id — recreate
        if (lead.googleMeetingEventId) {
          try {
            const { data } = await cal.events.insert({
              calendarId: "primary",
              requestBody: body,
            });
            lead.googleMeetingEventId = data.id;
            await lead.save();
            created += 1;
          } catch (e2) {
            errors.push({ lead: lead.entity, type: "meeting", error: e2.message });
          }
        } else {
          errors.push({ lead: lead.entity, type: "meeting", error: e.message });
        }
      }
    }

    if (lead.followup) {
      const body = buildLeadEvent({
        summary: `Follow-up · ${lead.entity}`,
        description: baseDesc,
        dateStr: lead.followup,
        colorId: "6", // orange
      });
      try {
        if (lead.googleFollowupEventId) {
          await cal.events.update({
            calendarId: "primary",
            eventId: lead.googleFollowupEventId,
            requestBody: body,
          });
          updated += 1;
        } else {
          const { data } = await cal.events.insert({
            calendarId: "primary",
            requestBody: body,
          });
          lead.googleFollowupEventId = data.id;
          await lead.save();
          created += 1;
        }
      } catch (e) {
        if (lead.googleFollowupEventId) {
          try {
            const { data } = await cal.events.insert({
              calendarId: "primary",
              requestBody: body,
            });
            lead.googleFollowupEventId = data.id;
            await lead.save();
            created += 1;
          } catch (e2) {
            errors.push({ lead: lead.entity, type: "followup", error: e2.message });
          }
        } else {
          errors.push({ lead: lead.entity, type: "followup", error: e.message });
        }
      }
    }
  }

  user.googleCalendar.lastSyncedAt = new Date();
  await user.save();

  res.json({
    ok: true,
    created,
    updated,
    errors: errors.slice(0, 10),
    lastSyncedAt: user.googleCalendar.lastSyncedAt,
  });
});

export const listEvents = asyncHandler(async (req, res) => {
  if (!isGoogleConfigured()) {
    return res.json({ events: [], connected: false });
  }

  const user = await User.findById(req.user._id).select(
    "+googleCalendar.accessToken +googleCalendar.refreshToken",
  );
  if (!user?.googleCalendar?.connected || !user.googleCalendar.refreshToken) {
    return res.json({ events: [], connected: false });
  }

  const timeMin = req.query.from || "2026-09-01T00:00:00.000Z";
  const timeMax = req.query.to || "2026-10-01T00:00:00.000Z";

  const auth = await refreshAndPersist(user);
  const cal = calendarApi(auth);

  const { data } = await cal.events.list({
    calendarId: "primary",
    timeMin,
    timeMax,
    singleEvents: true,
    orderBy: "startTime",
    maxResults: 250,
  });

  const events = (data.items || [])
    .filter((ev) => {
      const desc = ev.description || "";
      // Hide events we pushed from CRM so calendar doesn't double-count
      return !desc.includes("Synced from TechCulture Lead Management");
    })
    .map((ev) => {
      const start = ev.start?.date || ev.start?.dateTime || "";
      const day = start.slice(0, 10);
      return {
        id: ev.id,
        summary: ev.summary || "(No title)",
        day,
        htmlLink: ev.htmlLink || null,
        allDay: Boolean(ev.start?.date),
        source: "google",
      };
    });

  res.json({ events, connected: true });
});
