import { google } from "googleapis";

const SCOPES = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/userinfo.email",
];

export function isGoogleConfigured() {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_REDIRECT_URI,
  );
}

export function createOAuthClient() {
  if (!isGoogleConfigured()) {
    throw new Error(
      "Google Calendar not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI.",
    );
  }
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  );
}

export function getAuthUrl(state) {
  const client = createOAuthClient();
  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
    state,
  });
}

export async function exchangeCode(code) {
  const client = createOAuthClient();
  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);
  return { client, tokens };
}

export function clientFromUserTokens(googleCal) {
  const client = createOAuthClient();
  client.setCredentials({
    access_token: googleCal.accessToken,
    refresh_token: googleCal.refreshToken,
    expiry_date: googleCal.expiryDate || undefined,
  });
  return client;
}

export async function refreshAndPersist(user) {
  const client = clientFromUserTokens(user.googleCalendar);
  client.on("tokens", async (tokens) => {
    if (tokens.access_token) {
      user.googleCalendar.accessToken = tokens.access_token;
    }
    if (tokens.refresh_token) {
      user.googleCalendar.refreshToken = tokens.refresh_token;
    }
    if (tokens.expiry_date) {
      user.googleCalendar.expiryDate = tokens.expiry_date;
    }
    await user.save();
  });
  return client;
}

export function calendarApi(auth) {
  return google.calendar({ version: "v3", auth });
}

/** All-day event date YYYY-MM-DD → Google date object; exclusive end = next day */
export function allDayRange(dateStr) {
  const start = dateStr.slice(0, 10);
  const d = new Date(`${start}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  const end = d.toISOString().slice(0, 10);
  return { start: { date: start }, end: { date: end } };
}

export function buildLeadEvent({ summary, description, dateStr, colorId }) {
  const range = allDayRange(dateStr);
  return {
    summary,
    description,
    ...range,
    colorId: colorId || "9",
  };
}

/** Timed slot (IST) — better for Google Meet than all-day events */
export function timedMeetingRange(dateStr, startHour = 11, durationHours = 1) {
  const day = String(dateStr).slice(0, 10);
  const start = new Date(
    `${day}T${String(startHour).padStart(2, "0")}:00:00+05:30`,
  );
  const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);
  return {
    start: { dateTime: start.toISOString(), timeZone: "Asia/Kolkata" },
    end: { dateTime: end.toISOString(), timeZone: "Asia/Kolkata" },
  };
}

export function buildOnlineMeetEvent({
  summary,
  description,
  dateStr,
  requestId,
}) {
  const range = timedMeetingRange(dateStr);
  return {
    summary,
    description,
    ...range,
    colorId: "9",
    conferenceData: {
      createRequest: {
        requestId: requestId || `tc-meet-${Date.now()}`,
        conferenceSolutionKey: { type: "hangoutsMeet" },
      },
    },
  };
}

export function extractMeetLink(event) {
  if (!event) return "";
  if (event.hangoutLink) return event.hangoutLink;
  const entry = event.conferenceData?.entryPoints?.find(
    (e) => e.entryPointType === "video",
  );
  return entry?.uri || "";
}
