"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import Topbar from "@/components/layout/Topbar";
import PageHeader from "@/components/shared/PageHeader";
import { useLeads } from "@/context/LeadsContext";
import { useAuth } from "@/context/AuthContext";
import { hasPermission } from "@/lib/permissions";
import { api, ApiError } from "@/lib/api";
import { DEMO_TODAY } from "@/lib/demoDate";
import { formatDate } from "@/lib/format";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DEMO = new Date(`${DEMO_TODAY}T12:00:00`);
const YEAR_OPTIONS = [2024, 2025, 2026, 2027, 2028, 2029, 2030];

type CalEvent = {
  day: number;
  label: string;
  type: "meeting" | "follow" | "google";
  detail: string;
  leadId?: string;
  htmlLink?: string | null;
  dateIso: string;
};

type GoogleStatus = {
  configured: boolean;
  connected: boolean;
  email: string | null;
  lastSyncedAt: string | null;
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function monthPrefix(year: number, monthIndex: number) {
  return `${year}-${pad2(monthIndex + 1)}`;
}

function monthBounds(year: number, monthIndex: number) {
  const from = new Date(Date.UTC(year, monthIndex, 1, 0, 0, 0));
  const to = new Date(Date.UTC(year, monthIndex + 1, 1, 0, 0, 0));
  return { from: from.toISOString(), to: to.toISOString() };
}

function clampDay(year: number, monthIndex: number, day: number) {
  const max = new Date(year, monthIndex + 1, 0).getDate();
  return Math.min(Math.max(1, day), max);
}

function googleCalTemplateUrl(title: string, dateStr: string, details: string) {
  const day = dateStr.replace(/-/g, "");
  const dates = `${day}/${day}`;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates,
    details,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export default function CalendarPageClient() {
  const { leads } = useLeads();
  const { user } = useAuth();
  const canCreate = hasPermission(user?.permissions, "leads.create");
  const canFollowups = hasPermission(user?.permissions, "followups.manage");
  const searchParams = useSearchParams();

  const [year, setYear] = useState(DEMO.getFullYear());
  const [month, setMonth] = useState(DEMO.getMonth()); // 0-indexed
  const [selected, setSelected] = useState(DEMO.getDate());

  const [googleStatus, setGoogleStatus] = useState<GoogleStatus | null>(null);
  const [googleEvents, setGoogleEvents] = useState<CalEvent[]>([]);
  const [busy, setBusy] = useState<"connect" | "sync" | "disconnect" | null>(
    null,
  );
  const [flash, setFlash] = useState("");
  const [error, setError] = useState("");

  const prefix = monthPrefix(year, month);
  const monthLabel = `${MONTH_NAMES[month]} ${year}`;
  const todayIso = DEMO_TODAY;
  const isTodayMonth = todayIso.startsWith(prefix);

  const shiftMonth = (delta: number) => {
    const d = new Date(year, month + delta, 1);
    const nextY = d.getFullYear();
    const nextM = d.getMonth();
    setYear(nextY);
    setMonth(nextM);
    setSelected((prev) => clampDay(nextY, nextM, prev));
  };

  const goToday = () => {
    setYear(DEMO.getFullYear());
    setMonth(DEMO.getMonth());
    setSelected(DEMO.getDate());
  };

  const loadStatus = useCallback(async () => {
    try {
      const status = await api<GoogleStatus>("/api/google/status");
      setGoogleStatus(status);
      return status;
    } catch {
      setGoogleStatus({
        configured: false,
        connected: false,
        email: null,
        lastSyncedAt: null,
      });
      return null;
    }
  }, []);

  const loadGoogleEvents = useCallback(
    async (y: number, m: number, connected: boolean) => {
      if (!connected) {
        setGoogleEvents([]);
        return;
      }
      try {
        const { from, to } = monthBounds(y, m);
        const res = await api<{
          events: Array<{
            id: string;
            summary: string;
            day: string;
            htmlLink: string | null;
          }>;
        }>(`/api/google/events?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
        const p = monthPrefix(y, m);
        setGoogleEvents(
          res.events
            .filter((e) => e.day.startsWith(p))
            .map((e) => ({
              day: Number(e.day.split("-")[2]),
              label: e.summary,
              type: "google" as const,
              detail: "Google Calendar",
              htmlLink: e.htmlLink,
              dateIso: e.day,
            })),
        );
      } catch {
        setGoogleEvents([]);
      }
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const status = await loadStatus();
      if (cancelled) return;
      await loadGoogleEvents(year, month, Boolean(status?.connected));
    })();
    return () => {
      cancelled = true;
    };
  }, [year, month, loadStatus, loadGoogleEvents]);

  useEffect(() => {
    const g = searchParams.get("google");
    if (g === "connected") {
      setFlash("Google Calendar connected.");
      loadStatus().then((s) =>
        loadGoogleEvents(year, month, Boolean(s?.connected)),
      );
      window.history.replaceState({}, "", "/calendar");
    } else if (g === "error") {
      setError("Google connect failed. Try again.");
      window.history.replaceState({}, "", "/calendar");
    }
  }, [searchParams, loadStatus, loadGoogleEvents, year, month]);

  const events: CalEvent[] = useMemo(() => {
    const list: CalEvent[] = [];
    leads.forEach((l) => {
      if (l.meetingDate?.startsWith(prefix)) {
        list.push({
          day: Number(l.meetingDate.split("-")[2]),
          label: l.entity,
          type: "meeting",
          detail: `${l.meetingType || "Meeting"} · ${l.owner}`,
          leadId: l.id,
          dateIso: l.meetingDate.slice(0, 10),
        });
      }
      if (l.followup?.startsWith(prefix)) {
        list.push({
          day: Number(l.followup.split("-")[2]),
          label: l.entity,
          type: "follow",
          detail: `${l.contact} · ${l.owner}`,
          leadId: l.id,
          dateIso: l.followup.slice(0, 10),
        });
      }
    });
    return [...list, ...googleEvents];
  }, [leads, googleEvents, prefix]);

  const cells = useMemo(() => {
    const firstDow = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const total = Math.ceil((firstDow + daysInMonth) / 7) * 7;
    return Array.from({ length: total }, (_, idx) => {
      const day = idx - firstDow + 1;
      if (day < 1 || day > daysInMonth) return { day: null as number | null };
      return { day };
    });
  }, [year, month]);

  const dayEvents = events.filter((e) => e.day === selected);
  const selectedIso = `${prefix}-${pad2(selected)}`;
  const selectedLabel = formatDate(selectedIso);
  const eventCount = events.length;

  const handleConnect = async () => {
    setBusy("connect");
    setError("");
    try {
      const { url } = await api<{ url: string }>("/api/google/connect");
      window.location.href = url;
    } catch (e) {
      setError(
        e instanceof ApiError
          ? e.message
          : "Could not start Google connect",
      );
      setBusy(null);
    }
  };

  const handleSync = async () => {
    setBusy("sync");
    setError("");
    setFlash("");
    try {
      const res = await api<{
        created: number;
        updated: number;
        lastSyncedAt: string;
      }>("/api/google/sync", { method: "POST" });
      setFlash(
        `Synced to Google — ${res.created} created, ${res.updated} updated.`,
      );
      const status = await loadStatus();
      await loadGoogleEvents(year, month, Boolean(status?.connected));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Sync failed");
    } finally {
      setBusy(null);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm("Disconnect Google Calendar from this account?")) return;
    setBusy("disconnect");
    setError("");
    try {
      await api("/api/google/disconnect", { method: "DELETE" });
      setFlash("Google Calendar disconnected.");
      await loadStatus();
      setGoogleEvents([]);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Disconnect failed");
    } finally {
      setBusy(null);
    }
  };

  return (
    <AppShell>
      <Topbar
        title="Calendar"
        subtitle={`Meetings and follow-ups for ${monthLabel}`}
        showSearch={false}
      />

      <section className="content cal-page">
        <PageHeader
          title="Calendar"
          subtitle="Jump months anytime — pick from the dropdown or use next / previous."
          crumbs={[{ label: "Calendar" }]}
          actions={
            <>
              {canFollowups ? (
              <Link href="/follow-ups" className="btn btn-secondary dash-cta">
                Follow-ups
              </Link>
              ) : null}
              {canCreate ? (
              <Link href="/leads/create" className="btn btn-primary dash-cta">
                Create Lead
              </Link>
              ) : null}
            </>
          }
        />

        <div className="cal-google-bar">
          <div className="cal-google-brand">
            <span className="cal-google-icon" aria-hidden>
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path
                  fill="#4285F4"
                  d="M19.5 4.5h-3v-1.2c0-.7-.6-1.3-1.3-1.3h-6.4c-.7 0-1.3.6-1.3 1.3v1.2h-3C3.7 4.5 3 5.2 3 6v13.5c0 .8.7 1.5 1.5 1.5h15c.8 0 1.5-.7 1.5-1.5V6c0-.8-.7-1.5-1.5-1.5zm-10.7-1.2h6.4v1.2H8.8V3.3zM19.5 19.5h-15V9h15v10.5z"
                />
                <path fill="#EA4335" d="M8 12h2.5v2.5H8z" />
                <path fill="#FBBC05" d="M11.25 12h2.5v2.5h-2.5z" />
                <path fill="#34A853" d="M14.5 12H17v2.5h-2.5z" />
              </svg>
            </span>
            <div>
              <strong>Google Calendar</strong>
              {!googleStatus?.configured ? (
                <p>Add Google API keys in backend .env to enable sync.</p>
              ) : googleStatus.connected ? (
                <p>
                  Connected as {googleStatus.email || "Google account"}
                  {googleStatus.lastSyncedAt
                    ? ` · Last sync ${formatDate(googleStatus.lastSyncedAt.slice(0, 10))}`
                    : ""}
                </p>
              ) : (
                <p>Connect to push meetings &amp; follow-ups to Google.</p>
              )}
            </div>
          </div>
          <div className="cal-google-actions">
            {!googleStatus?.configured ? (
              <a
                className="btn btn-secondary dash-cta"
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noreferrer"
              >
                Google Console
              </a>
            ) : !googleStatus.connected ? (
              <button
                type="button"
                className="btn btn-primary dash-cta"
                disabled={busy === "connect"}
                onClick={handleConnect}
              >
                {busy === "connect" ? "Opening…" : "Connect Google"}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="btn btn-primary dash-cta"
                  disabled={busy === "sync"}
                  onClick={handleSync}
                >
                  {busy === "sync" ? "Syncing…" : "Sync to Google"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary dash-cta"
                  disabled={busy === "disconnect"}
                  onClick={handleDisconnect}
                >
                  Disconnect
                </button>
              </>
            )}
          </div>
        </div>

        {flash ? <div className="cal-flash ok">{flash}</div> : null}
        {error ? <div className="cal-flash err">{error}</div> : null}

        <div className="cal-nav">
          <div className="cal-nav-left">
            <button
              type="button"
              className="cal-nav-arrow"
              aria-label="Previous month"
              onClick={() => shiftMonth(-1)}
            >
              ‹
            </button>

            <label className="cal-nav-select-wrap">
              <span className="sr-only">Month</span>
              <select
                className="cal-nav-select"
                value={month}
                onChange={(e) => {
                  const nextM = Number(e.target.value);
                  setMonth(nextM);
                  setSelected((prev) => clampDay(year, nextM, prev));
                }}
              >
                {MONTH_NAMES.map((name, i) => (
                  <option key={name} value={i}>
                    {name}
                  </option>
                ))}
              </select>
            </label>

            <label className="cal-nav-select-wrap">
              <span className="sr-only">Year</span>
              <select
                className="cal-nav-select year"
                value={year}
                onChange={(e) => {
                  const nextY = Number(e.target.value);
                  setYear(nextY);
                  setSelected((prev) => clampDay(nextY, month, prev));
                }}
              >
                {[...new Set([...YEAR_OPTIONS, year])]
                  .sort((a, b) => a - b)
                  .map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
              </select>
            </label>

            <button
              type="button"
              className="cal-nav-arrow"
              aria-label="Next month"
              onClick={() => shiftMonth(1)}
            >
              ›
            </button>
          </div>

          <div className="cal-nav-right">
            <span className="cal-nav-meta">
              {eventCount} event{eventCount === 1 ? "" : "s"} this month
            </span>
            <button type="button" className="cal-nav-today" onClick={goToday}>
              Today
            </button>
          </div>
        </div>

        <div className="cal-layout">
          <div className="cal-board">
            <div className="cal-board-head">
              <div>
                <h2>{monthLabel}</h2>
                <p>Click a day to inspect schedule</p>
              </div>
              <div className="cal-legend">
                <span className="cal-legend-item meeting">Meeting</span>
                <span className="cal-legend-item follow">Follow-up</span>
                <span className="cal-legend-item google">Google</span>
              </div>
            </div>

            <div className="cal-weekdays" aria-hidden>
              {WEEKDAYS.map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>

            <div className="cal-grid" role="grid" aria-label={monthLabel}>
              {cells.map((cell, idx) => {
                if (!cell.day) {
                  return (
                    <div
                      className="cal-cell is-empty"
                      key={`empty-${idx}`}
                      aria-hidden
                    />
                  );
                }

                const dayEv = events.filter((e) => e.day === cell.day);
                const cellIso = `${prefix}-${pad2(cell.day)}`;
                const isToday = cellIso === todayIso;
                const isSelected = cell.day === selected;
                const extra = Math.max(dayEv.length - 2, 0);

                return (
                  <button
                    type="button"
                    key={cellIso}
                    className={[
                      "cal-cell",
                      isToday ? "is-today" : "",
                      isSelected ? "is-selected" : "",
                      dayEv.length ? "has-events" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => setSelected(cell.day!)}
                  >
                    <span className="cal-cell-num">{cell.day}</span>
                    <div className="cal-cell-events">
                      {dayEv.slice(0, 2).map((ev, i) => (
                        <span
                          key={`${ev.leadId || ev.label}-${ev.type}-${i}`}
                          className={`cal-pill ${ev.type}`}
                          title={ev.label}
                        >
                          {ev.type === "follow"
                            ? "FU · "
                            : ev.type === "google"
                              ? "G · "
                              : ""}
                          {ev.label}
                        </span>
                      ))}
                      {extra > 0 ? (
                        <span className="cal-pill more">+{extra} more</span>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <aside className="cal-side">
            <div className="cal-side-head">
              <h2>Schedule</h2>
              <p>{selectedLabel}</p>
            </div>

            {!dayEvents.length ? (
              <div className="cal-side-empty">
                <div className="cal-side-empty-icon" aria-hidden>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  >
                    <rect x="3" y="5" width="18" height="16" rx="2" />
                    <path d="M16 3v4M8 3v4M3 11h18" strokeLinecap="round" />
                  </svg>
                </div>
                <h3>Nothing planned</h3>
                <p>No meetings or follow-ups on this day.</p>
                {isTodayMonth ? null : (
                  <button
                    type="button"
                    className="btn btn-secondary dash-cta"
                    onClick={goToday}
                  >
                    Jump to today
                  </button>
                )}
                {canCreate ? (
                <Link href="/leads/create" className="btn btn-primary dash-cta">
                  Add Lead
                </Link>
                ) : null}
              </div>
            ) : (
              <div className="cal-side-list">
                {dayEvents.map((ev, i) => (
                  <div
                    className={`cal-side-item ${ev.type}`}
                    key={`${ev.leadId || ev.label}-${i}`}
                  >
                    <div className="cal-side-badge">
                      {ev.type === "meeting"
                        ? "Meeting"
                        : ev.type === "follow"
                          ? "Follow-up"
                          : "Google"}
                    </div>
                    <h4>{ev.label}</h4>
                    <p>{ev.detail}</p>
                    <div className="cal-side-links">
                      {ev.leadId ? (
                        <Link
                          href={`/leads/${ev.leadId}/edit`}
                          className="text-link"
                        >
                          Open lead
                        </Link>
                      ) : null}
                      {ev.htmlLink ? (
                        <a
                          href={ev.htmlLink}
                          className="text-link"
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open in Google
                        </a>
                      ) : ev.type !== "google" ? (
                        <a
                          href={googleCalTemplateUrl(
                            `${ev.type === "meeting" ? "Meeting" : "Follow-up"} · ${ev.label}`,
                            selectedIso,
                            ev.detail,
                          )}
                          className="text-link"
                          target="_blank"
                          rel="noreferrer"
                        >
                          Add to Google
                        </a>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </aside>
        </div>
      </section>
    </AppShell>
  );
}
