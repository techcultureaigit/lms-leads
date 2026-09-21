"use client";

import { useState } from "react";
import { formatDate } from "@/lib/format";
import type { LeadActivity, LeadActivityType } from "@/types/activity";

type LeadActivityTimelineProps = {
  activities: LeadActivity[];
  onAddNote?: (message: string) => void;
  compact?: boolean;
  title?: string;
};

function toneClass(type: LeadActivityType): string {
  if (type === "status_change" || type === "created") return "won";
  if (type === "followup" || type === "meeting") return "warn";
  if (type === "system") return "lost";
  return "";
}

function typeLabel(type: LeadActivityType): string {
  switch (type) {
    case "created":
      return "Created";
    case "note":
      return "Note";
    case "status_change":
      return "Status";
    case "followup":
      return "Follow-up";
    case "meeting":
      return "Meeting";
    case "assignment":
      return "Assignment";
    default:
      return "System";
  }
}

function formatWhen(iso: string): string {
  const [date, time] = iso.split("T");
  const niceDate = formatDate(date);
  if (!time) return niceDate;
  const hhmm = time.slice(0, 5);
  return `${niceDate} · ${hhmm}`;
}

function describe(activity: LeadActivity): string {
  if (activity.type === "status_change" && activity.meta?.from && activity.meta?.to) {
    return `${activity.message}: ${activity.meta.from} → ${activity.meta.to}`;
  }
  if (activity.type === "assignment" && activity.meta?.to) {
    const from = activity.meta.from ? `${activity.meta.from} → ` : "";
    return `${activity.message}: ${from}${activity.meta.to}`;
  }
  if (activity.type === "followup") {
    if (activity.meta?.to) {
      return `${activity.message} for ${formatDate(activity.meta.to)}`;
    }
    return activity.message;
  }
  if (activity.type === "meeting" && activity.meta?.to) {
    return `${activity.message} · ${formatDate(activity.meta.to)}`;
  }
  return activity.message;
}

export default function LeadActivityTimeline({
  activities,
  onAddNote,
  compact = false,
  title = "Activity Timeline",
}: LeadActivityTimelineProps) {
  const [note, setNote] = useState("");

  return (
    <div className={`activity-panel ${compact ? "compact" : ""}`}>
      <div className="activity-panel-head">
        <h3>{title}</h3>
        <span className="activity-count">{activities.length}</span>
      </div>

      {onAddNote ? (
        <form
          className="activity-note-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (!note.trim()) return;
            onAddNote(note.trim());
            setNote("");
          }}
        >
          <textarea
            className="input"
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note to the timeline…"
          />
          <button type="submit" className="btn btn-primary dash-cta">
            Add Note
          </button>
        </form>
      ) : null}

      {!activities.length ? (
        <div className="activity-empty">
          <p>No activity yet</p>
          <small>Notes, status changes and follow-ups will appear here.</small>
        </div>
      ) : (
        <ul className="dash-timeline lead-timeline">
          {activities.map((a) => (
            <li key={a.id} className={toneClass(a.type)}>
              <div className="timeline-badge">{typeLabel(a.type)}</div>
              <p>{describe(a)}</p>
              <small>
                {a.actor} · {formatWhen(a.createdAt)}
              </small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
