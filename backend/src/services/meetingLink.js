import { randomUUID } from "crypto";
import { User } from "../models/User.js";
import {
  isGoogleConfigured,
  refreshAndPersist,
  calendarApi,
  buildOnlineMeetEvent,
  extractMeetLink,
} from "../utils/googleCalendar.js";

/**
 * When lead is Meeting + Online, create/update a Google Calendar event
 * with a Meet conference link and persist it on the lead.
 */
export async function syncOnlineMeetingLink(reqUserId, lead) {
  const needsMeet =
    lead.status === "Meeting" &&
    lead.meetingType === "Online" &&
    Boolean(lead.meetingDate);

  if (!needsMeet) {
    if (lead.meetingType === "Offline" && lead.meetingLink) {
      lead.meetingLink = "";
      await lead.save();
    }
    return { lead, meetWarning: null };
  }

  if (!isGoogleConfigured()) {
    return {
      lead,
      meetWarning:
        "Google Calendar is not configured. Meeting saved without Meet link.",
    };
  }

  const user = await User.findById(reqUserId).select(
    "+googleCalendar.accessToken +googleCalendar.refreshToken",
  );

  if (!user?.googleCalendar?.connected || !user.googleCalendar.refreshToken) {
    return {
      lead,
      meetWarning:
        "Connect Google Calendar (Calendar page) to auto-create Meet links.",
    };
  }

  const auth = await refreshAndPersist(user);
  const cal = calendarApi(auth);

  const description = [
    `Lead: ${lead.entity}`,
    `Contact: ${lead.contact}`,
    lead.mobile ? `Mobile: ${lead.mobile}` : "",
    lead.email ? `Email: ${lead.email}` : "",
    `Owner: ${lead.owner}`,
    `Assigned: ${lead.assigned}`,
    lead.notes ? `Notes: ${lead.notes}` : "",
    "",
    "Created from TechCulture Lead Management",
  ]
    .filter(Boolean)
    .join("\n");

  const body = buildOnlineMeetEvent({
    summary: `Meeting · ${lead.entity}`,
    description,
    dateStr: lead.meetingDate,
    requestId: `tc-${lead._id}-${lead.meetingDate}`,
  });

  try {
    let event;
    if (lead.googleMeetingEventId) {
      try {
        const { data } = await cal.events.patch({
          calendarId: "primary",
          eventId: lead.googleMeetingEventId,
          conferenceDataVersion: 1,
          requestBody: {
            summary: body.summary,
            description: body.description,
            start: body.start,
            end: body.end,
            colorId: body.colorId,
            // Only create conference if event has no meet link yet
            ...(lead.meetingLink
              ? {}
              : { conferenceData: body.conferenceData }),
          },
        });
        event = data;
      } catch {
        const { data } = await cal.events.insert({
          calendarId: "primary",
          conferenceDataVersion: 1,
          requestBody: body,
        });
        event = data;
      }
    } else {
      const { data } = await cal.events.insert({
        calendarId: "primary",
        conferenceDataVersion: 1,
        requestBody: {
          ...body,
          conferenceData: {
            createRequest: {
              requestId: randomUUID(),
              conferenceSolutionKey: { type: "hangoutsMeet" },
            },
          },
        },
      });
      event = data;
    }

    lead.googleMeetingEventId = event.id || lead.googleMeetingEventId || "";
    const link = extractMeetLink(event) || lead.meetingLink || "";
    lead.meetingLink = link;
    await lead.save();

    if (!link) {
      return {
        lead,
        meetWarning:
          "Calendar event created, but Meet link was not returned yet. Check Google Calendar.",
      };
    }

    return { lead, meetWarning: null };
  } catch (e) {
    console.error("Meet link create failed:", e.message);
    return {
      lead,
      meetWarning: e.message || "Failed to create Google Meet link",
    };
  }
}
