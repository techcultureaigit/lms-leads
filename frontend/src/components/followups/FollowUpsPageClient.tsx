"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import Topbar from "@/components/layout/Topbar";
import TodayAgenda from "@/components/shared/TodayAgenda";
import PageHeader from "@/components/shared/PageHeader";
import { useLeads } from "@/context/LeadsContext";
import { getAgendaForDate } from "@/lib/agenda";
import { DEMO_TODAY } from "@/lib/demoDate";
import { formatDate, statusClass } from "@/lib/format";

type Filter = "all" | "today" | "upcoming" | "overdue";
type Tone =
  | "blue"
  | "orange"
  | "amber"
  | "rose"
  | "purple"
  | "sky"
  | "indigo"
  | "cyan";

function urgency(date: string): "today" | "upcoming" | "overdue" {
  if (date === DEMO_TODAY) return "today";
  if (date < DEMO_TODAY) return "overdue";
  return "upcoming";
}

function FuIcon({ tone }: { tone: Tone }) {
  return (
    <span className={`kpi-icon tone-${tone}`} aria-hidden>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M21 12a9 9 0 1 1-3-6.7" strokeLinecap="round" />
        <path d="M21 3v6h-6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export default function FollowUpsPageClient() {
  const router = useRouter();
  const { leads, patchLead } = useLeads();
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [doneCount, setDoneCount] = useState(0);

  const agenda = useMemo(
    () => getAgendaForDate(leads, DEMO_TODAY),
    [leads],
  );

  const openLeads = useMemo(
    () => leads.filter((l) => l.followup),
    [leads],
  );

  const counts = useMemo(() => {
    const withUrgency = openLeads.map((l) => ({
      ...l,
      urgency: urgency(l.followup),
    }));
    return {
      today: withUrgency.filter((l) => l.urgency === "today").length,
      upcoming: withUrgency.filter((l) => l.urgency === "upcoming").length,
      overdue: withUrgency.filter((l) => l.urgency === "overdue").length,
      total: withUrgency.length,
      done: doneCount,
    };
  }, [openLeads, doneCount]);

  const items = useMemo(() => {
    return openLeads
      .map((l) => ({ ...l, urgency: urgency(l.followup) }))
      .filter((l) => (filter === "all" ? true : l.urgency === filter))
      .filter((l) => {
        const q = search.trim().toLowerCase();
        if (!q) return true;
        return [
          l.entity,
          l.contact,
          l.owner,
          l.assigned,
          l.mobile,
          l.email,
          l.status,
          l.location,
          l.followup,
          ...(l.products || []),
        ]
          .join(" ")
          .toLowerCase()
          .includes(q);
      })
      .sort((a, b) => a.followup.localeCompare(b.followup));
  }, [openLeads, filter, search]);

  const metrics: {
    label: string;
    value: number;
    tone: Tone;
    meta: string;
    filter: Filter | null;
  }[] = [
    {
      label: "Due Today",
      value: counts.today,
      tone: "amber",
      meta: "Call or email now",
      filter: "today",
    },
    {
      label: "Upcoming",
      value: counts.upcoming,
      tone: "blue",
      meta: "Scheduled next",
      filter: "upcoming",
    },
    {
      label: "Overdue",
      value: counts.overdue,
      tone: "rose",
      meta: "Needs attention",
      filter: "overdue",
    },
    {
      label: "Open Queue",
      value: counts.total,
      tone: "indigo",
      meta: "Still pending",
      filter: "all",
    },
    {
      label: "Completed Today",
      value: counts.done,
      tone: "cyan",
      meta: "Marked done",
      filter: null,
    },
  ];

  const markDone = (id: string) => {
    patchLead(id, { followup: "" });
    setDoneCount((n) => n + 1);
  };

  const openLead = (id: string) => {
    router.push(`/leads/${id}`);
  };

  return (
    <AppShell>
      <Topbar
        title="Follow-ups"
        subtitle="Never miss the next conversation"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search follow-ups..."
      />

      <section className="content fu-page">
        <PageHeader
          title="Follow-ups"
          subtitle="Prioritize overdue tasks and clear today's queue fast."
          crumbs={[{ label: "Follow-ups" }]}
          actions={
            <>
              <Link href="/leads" className="btn btn-secondary dash-cta">
                View Leads
              </Link>
              <Link href="/calendar" className="btn btn-primary dash-cta">
                Open Calendar
              </Link>
            </>
          }
        />

        <div className="kpi-grid fu-kpi-grid">
          {metrics.map((m) => (
            <button
              type="button"
              key={m.label}
              className={`kpi-card kpi-card-link fu-kpi-card ${
                m.filter !== null && filter === m.filter ? "is-active" : ""
              }`}
              onClick={() => setFilter(m.filter ?? "all")}
              title={`Show ${m.label.toLowerCase()}`}
            >
              <FuIcon tone={m.tone} />
              <div>
                <span className="kpi-label">{m.label}</span>
                <strong className="kpi-value">{m.value}</strong>
                <span className="fu-kpi-meta">{m.meta}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="fu-agenda-wrap">
          <TodayAgenda items={agenda} title="Today's Agenda" />
        </div>

        <div className="fu-toolbar">
          <div>
            <h2>Follow-up Queue</h2>
            <p>Sorted by due date · {items.length} showing</p>
          </div>
          <div className="list-toolbar-right">
            <input
              className="list-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search follow-ups…"
            />
            <div className="follow-filters">
              {(
                [
                  ["all", "All"],
                  ["today", "Today"],
                  ["upcoming", "Upcoming"],
                  ["overdue", "Overdue"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className={`filter-chip ${filter === key ? "active" : ""}`}
                  onClick={() => setFilter(key)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {!items.length ? (
          <div className="fu-empty">
            <h3>No follow-ups in this view</h3>
            <p>Try another filter or create a lead with a follow-up date.</p>
            <Link href="/leads/create" className="btn btn-primary dash-cta">
              Create Lead
            </Link>
          </div>
        ) : (
          <div className="table-wrap fu-list-wrap">
            <table className="fu-list-table">
              <thead>
                <tr>
                  <th>Entity</th>
                  <th>Contact</th>
                  <th>Due date</th>
                  <th>Urgency</th>
                  <th>Status</th>
                  <th>Owner</th>
                  <th>Mobile</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className={`fu-list-row urgency-${item.urgency} leads-click-row`}
                    tabIndex={0}
                    role="link"
                    onClick={() => openLead(item.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openLead(item.id);
                      }
                    }}
                  >
                    <td>
                      <strong className="fu-list-entity">{item.entity}</strong>
                    </td>
                    <td>{item.contact}</td>
                    <td>{formatDate(item.followup)}</td>
                    <td>
                      <span className={`urgency ${item.urgency}`}>
                        {item.urgency === "today"
                          ? "Today"
                          : item.urgency === "overdue"
                            ? "Overdue"
                            : "Upcoming"}
                      </span>
                    </td>
                    <td>
                      <span className={`status ${statusClass(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>{item.owner}</td>
                    <td>+91 {item.mobile}</td>
                    <td
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      <div className="fu-list-actions">
                        <Link
                          href={`/leads/${item.id}/edit`}
                          className="btn btn-secondary dash-cta"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          className="btn btn-primary dash-cta"
                          onClick={() => markDone(item.id)}
                        >
                          Done
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AppShell>
  );
}
