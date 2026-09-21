"use client";

import Link from "next/link";
import { formatDate, statusClass } from "@/lib/format";
import type { AgendaItem } from "@/lib/agenda";
import { DEMO_TODAY } from "@/lib/demoDate";

type TodayAgendaProps = {
  items: AgendaItem[];
  date?: string;
  title?: string;
  limit?: number;
  onOpen?: (id: string) => void;
};

export default function TodayAgenda({
  items,
  date = DEMO_TODAY,
  title = "Today's Agenda",
  limit = 8,
  onOpen,
}: TodayAgendaProps) {
  const shown = items.slice(0, limit);

  return (
    <div className="chart-card">
      <div className="chart-card-head">
        <div>
          <h2>{title}</h2>
          <p className="agenda-date-hint">{formatDate(date)}</p>
        </div>
        <Link href="/calendar" className="text-link">
          Calendar
        </Link>
      </div>
      {!shown.length ? (
        <div className="dash-empty">
          <h3>No items today</h3>
          <p>Follow-ups and meetings for {formatDate(date)} will show here.</p>
        </div>
      ) : (
        <ul className="agenda-list">
          {shown.map((item, i) => {
            const href = `/leads/${item.id}/edit`;
            const content = (
              <>
                <span className={`agenda-type ${item.kind}`}>{item.type}</span>
                <div>
                  <strong>{item.entity}</strong>
                  <small>
                    {item.contact} · {item.owner}
                  </small>
                </div>
                <span className={`status ${statusClass(item.status)}`}>
                  {item.status}
                </span>
              </>
            );
            return (
              <li key={`${item.id}-${item.kind}-${i}`}>
                {onOpen ? (
                  <button
                    type="button"
                    className="agenda-item"
                    onClick={() => onOpen(item.id)}
                  >
                    {content}
                  </button>
                ) : (
                  <Link href={href} className="agenda-item">
                    {content}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {items.length > limit ? (
        <div className="agenda-more">
          <Link href="/follow-ups" className="text-link">
            +{items.length - limit} more in follow-ups
          </Link>
        </div>
      ) : null}
    </div>
  );
}
