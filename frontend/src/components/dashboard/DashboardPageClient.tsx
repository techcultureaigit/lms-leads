"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import Topbar from "@/components/layout/Topbar";
import PageHeader from "@/components/shared/PageHeader";
import TodayAgenda from "@/components/shared/TodayAgenda";
import { api, ApiError } from "@/lib/api";
import { formatDate, statusClass } from "@/lib/format";
import type { AgendaItem } from "@/lib/agenda";
import type { LeadStatus } from "@/types/lead";

type Tone =
  | "blue"
  | "orange"
  | "purple"
  | "pink"
  | "cyan"
  | "indigo"
  | "amber"
  | "rose"
  | "sky"
  | "violet";

type DateRange = "today" | "week" | "month" | "all";

type DashboardPayload = {
  range: DateRange;
  today: string;
  metrics: {
    totalLeads: number;
    activePipeline: number;
    newLeads: number;
    inProcess: number;
    meetings: number;
    followupsOpen: number;
    overdueFollowups: number;
    wonDeals: number;
    lostLeads: number;
    winRate: number;
    teamMembers: number;
    productsCatalog: number;
    leadsWithEmail: number;
    leadsWithWebsite: number;
    onlineMeetings: number;
    offlineMeetings: number;
    assignedOwners: number;
    thisWeekVolume: number;
    priorityQueue: number;
    conversionFocus: number;
  };
  charts: {
    weekActivity: { labels: string[]; values: number[]; total: number };
    monthGrowth: { labels: string[]; values: number[] };
  };
  agenda: AgendaItem[];
  funnel: { status: LeadStatus; count: number }[];
  recentLeads: {
    id: string;
    entity: string;
    contact: string;
    status: LeadStatus;
    owner: string;
    followup: string;
  }[];
  teamPerformance: {
    id: string;
    name: string;
    role: string;
    initials: string;
    count: number;
    pct: number;
  }[];
};

function MetricIcon({ tone }: { tone: Tone }) {
  return (
    <span className={`kpi-icon tone-${tone}`} aria-hidden>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 19V5M4 19h16" strokeLinecap="round" />
        <path d="M8 15v-5M12 15V8M16 15v-3" strokeLinecap="round" />
      </svg>
    </span>
  );
}

function AreaChart({
  values,
  labels,
  color = "#3b82f6",
}: {
  values: number[];
  labels: string[];
  color?: string;
}) {
  const w = 560;
  const h = 220;
  const pad = 28;
  const max = Math.max(...values, 1);
  const stepX = (w - pad * 2) / Math.max(values.length - 1, 1);
  const points = values.map((v, i) => {
    const x = pad + i * stepX;
    const y = h - pad - (v / max) * (h - pad * 2);
    return { x, y, v };
  });
  const line = points.map((p) => `${p.x},${p.y}`).join(" ");
  const area = `${pad},${h - pad} ${line} ${points[points.length - 1]?.x ?? pad},${h - pad}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="dash-chart-svg" role="img">
      <defs>
        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((t) => (
        <line
          key={t}
          x1={pad}
          x2={w - pad}
          y1={pad + (h - pad * 2) * t}
          y2={pad + (h - pad * 2) * t}
          stroke="#e8eef6"
          strokeWidth="1"
        />
      ))}
      <polygon points={area} fill="url(#areaFill)" />
      <polyline
        points={line}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {points.map((p, i) => (
        <g key={labels[i]}>
          <circle cx={p.x} cy={p.y} r="3.5" fill="#fff" stroke={color} strokeWidth="2" />
          <text x={p.x} y={h - 8} textAnchor="middle" className="chart-label">
            {labels[i]}
          </text>
        </g>
      ))}
    </svg>
  );
}

function LineChart({
  values,
  labels,
  color = "#8b5cf6",
}: {
  values: number[];
  labels: string[];
  color?: string;
}) {
  const w = 560;
  const h = 220;
  const pad = 28;
  const max = Math.max(...values, 1);
  const stepX = (w - pad * 2) / Math.max(values.length - 1, 1);
  const points = values.map((v, i) => {
    const x = pad + i * stepX;
    const y = h - pad - (v / max) * (h - pad * 2);
    return { x, y };
  });
  const line = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="dash-chart-svg" role="img">
      {[0.25, 0.5, 0.75].map((t) => (
        <line
          key={t}
          x1={pad}
          x2={w - pad}
          y1={pad + (h - pad * 2) * t}
          y2={pad + (h - pad * 2) * t}
          stroke="#e8eef6"
          strokeWidth="1"
        />
      ))}
      <polyline
        points={line}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {points.map((p, i) => (
        <g key={labels[i]}>
          <circle cx={p.x} cy={p.y} r="4" fill="#fff" stroke={color} strokeWidth="2" />
          <text x={p.x} y={h - 8} textAnchor="middle" className="chart-label">
            {labels[i]}
          </text>
        </g>
      ))}
    </svg>
  );
}

function buildMetricCards(m: DashboardPayload["metrics"]) {
  return [
    { label: "Total Leads", value: m.totalLeads, tone: "blue" as Tone, href: "/leads" },
    { label: "Active Pipeline", value: m.activePipeline, tone: "indigo" as Tone, href: "/leads" },
    { label: "New Leads", value: m.newLeads, tone: "sky" as Tone, href: "/leads?status=New" },
    {
      label: "In Process",
      value: m.inProcess,
      tone: "orange" as Tone,
      href: "/leads?status=In%20Process",
    },
    {
      label: "Meetings",
      value: m.meetings,
      tone: "violet" as Tone,
      href: "/leads?status=Meeting",
    },
    {
      label: "Follow-ups Open",
      value: m.followupsOpen,
      tone: "amber" as Tone,
      href: "/follow-ups",
    },
    {
      label: "Overdue Follow-ups",
      value: m.overdueFollowups,
      tone: "rose" as Tone,
      href: "/leads?overdue=1",
    },
    {
      label: "Won Deals",
      value: m.wonDeals,
      tone: "cyan" as Tone,
      href: "/leads?status=Completed",
    },
    {
      label: "Lost Leads",
      value: m.lostLeads,
      tone: "pink" as Tone,
      href: "/leads?status=Lost",
    },
    { label: "Win Rate", value: `${m.winRate}%`, tone: "blue" as Tone, href: "/reports" },
    { label: "Team Members", value: m.teamMembers, tone: "purple" as Tone, href: "/users" },
    {
      label: "Products Catalog",
      value: m.productsCatalog,
      tone: "indigo" as Tone,
      href: "/reports",
    },
    { label: "Leads with Email", value: m.leadsWithEmail, tone: "sky" as Tone, href: "/leads" },
    {
      label: "Leads with Website",
      value: m.leadsWithWebsite,
      tone: "orange" as Tone,
      href: "/leads",
    },
    {
      label: "Online Meetings",
      value: m.onlineMeetings,
      tone: "violet" as Tone,
      href: "/calendar",
    },
    {
      label: "Offline Meetings",
      value: m.offlineMeetings,
      tone: "amber" as Tone,
      href: "/calendar",
    },
    {
      label: "Assigned Owners",
      value: m.assignedOwners,
      tone: "blue" as Tone,
      href: "/users",
    },
    {
      label: "This Week Volume",
      value: m.thisWeekVolume,
      tone: "cyan" as Tone,
      href: "/calendar",
    },
    {
      label: "Priority Queue",
      value: m.priorityQueue,
      tone: "rose" as Tone,
      href: "/follow-ups",
    },
    {
      label: "Conversion Focus",
      value: m.conversionFocus,
      tone: "purple" as Tone,
      href: "/leads?status=In%20Process",
    },
  ];
}

export default function DashboardPageClient() {
  const router = useRouter();
  const [range, setRange] = useState<DateRange>("all");
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (nextRange: DateRange) => {
    setLoading(true);
    setError("");
    try {
      const res = await api<DashboardPayload>(
        `/api/dashboard?range=${encodeURIComponent(nextRange)}`,
      );
      setData(res);
    } catch (e) {
      setData(null);
      setError(e instanceof ApiError ? e.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(range);
  }, [range, load]);

  const metrics = data ? buildMetricCards(data.metrics) : [];
  const funnelMax = data
    ? Math.max(...data.funnel.map((f) => f.count), 1)
    : 1;

  return (
    <AppShell>
      <Topbar compact showSearch={false} />

      <section className="content dash-page">
        <PageHeader
          title="Dashboard"
          subtitle="Welcome back! Here's what's happening with your leads today."
          crumbs={[{ label: "Dashboard" }]}
          actions={
            <>
              <select
                className="dash-select"
                value={range}
                onChange={(e) => setRange(e.target.value as DateRange)}
                aria-label="Date range"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="all">All Time</option>
              </select>
              <Link href="/leads" className="btn btn-primary dash-cta">
                Manage Leads
              </Link>
            </>
          }
        />

        {error ? <div className="cal-flash err">{error}</div> : null}
        {loading && !data ? (
          <div className="dash-empty">
            <h3>Loading dashboard…</h3>
            <p>Pulling live metrics from the API.</p>
          </div>
        ) : null}

        {data ? (
          <>
            <div className="kpi-grid">
              {metrics.map((m) => (
                <Link className="kpi-card kpi-card-link" href={m.href} key={m.label}>
                  <MetricIcon tone={m.tone} />
                  <div>
                    <span className="kpi-label">{m.label}</span>
                    <strong className="kpi-value">{m.value}</strong>
                  </div>
                </Link>
              ))}
            </div>

            <div className="chart-grid">
              <div className="chart-card">
                <div className="chart-card-head">
                  <h2>Lead Activity (This Week)</h2>
                  <span className="chart-meta">
                    {data.charts.weekActivity.total} events
                  </span>
                </div>
                <AreaChart
                  values={data.charts.weekActivity.values}
                  labels={data.charts.weekActivity.labels}
                  color="#3b82f6"
                />
              </div>
              <div className="chart-card">
                <div className="chart-card-head">
                  <h2>Pipeline Activity (Last 6 Months)</h2>
                  <span className="chart-meta">From lead dates</span>
                </div>
                <LineChart
                  values={data.charts.monthGrowth.values}
                  labels={data.charts.monthGrowth.labels}
                  color="#8b5cf6"
                />
              </div>
            </div>

            <div className="dash-mid-grid">
              <TodayAgenda items={data.agenda} date={data.today} />

              <div className="chart-card">
                <div className="chart-card-head">
                  <h2>Pipeline Funnel</h2>
                  <Link href="/reports" className="text-link">
                    Reports
                  </Link>
                </div>
                <div className="funnel-list">
                  {data.funnel.map((f) => (
                    <Link
                      key={f.status}
                      href={`/leads?status=${encodeURIComponent(f.status)}`}
                      className="funnel-row"
                    >
                      <div className="funnel-row-top">
                        <span>{f.status}</span>
                        <strong>{f.count}</strong>
                      </div>
                      <div className="funnel-track">
                        <div
                          className="funnel-fill"
                          style={{ width: `${(f.count / funnelMax) * 100}%` }}
                        />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="dash-bottom-grid">
              <div className="chart-card">
                <div className="chart-card-head">
                  <h2>Recent Leads</h2>
                  <Link href="/leads" className="text-link">
                    View all
                  </Link>
                </div>
                <div className="table-wrap dash-scroll-panel">
                  {!data.recentLeads.length ? (
                    <div className="dash-empty">
                      <h3>No leads in range</h3>
                      <p>Try switching the date filter to All Time.</p>
                    </div>
                  ) : (
                    <table className="owner-table dash-mini-table">
                      <thead>
                        <tr>
                          <th>Entity</th>
                          <th>Status</th>
                          <th>Owner</th>
                          <th>Follow-up</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.recentLeads.map((l) => (
                          <tr
                            key={l.id}
                            className="dash-click-row"
                            tabIndex={0}
                            role="link"
                            onClick={() => router.push(`/leads/${l.id}/edit`)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                router.push(`/leads/${l.id}/edit`);
                              }
                            }}
                          >
                            <td>
                              <strong>{l.entity}</strong>
                              <div className="muted-line">{l.contact}</div>
                            </td>
                            <td>
                              <span className={`status ${statusClass(l.status)}`}>
                                {l.status}
                              </span>
                            </td>
                            <td>{l.owner}</td>
                            <td>{formatDate(l.followup)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              <div className="chart-card">
                <div className="chart-card-head">
                  <h2>Team Performance</h2>
                  <Link href="/users" className="text-link">
                    Manage
                  </Link>
                </div>
                <div className="team-perf-list dash-scroll-panel">
                  {!data.teamPerformance.length ? (
                    <div className="dash-empty">
                      <h3>No team data</h3>
                      <p>Add users to see ownership performance.</p>
                    </div>
                  ) : (
                    data.teamPerformance.map((u) => (
                      <button
                        type="button"
                        className="team-perf-row dash-click-row"
                        key={u.id}
                        onClick={() => router.push(`/users/${u.id}/edit`)}
                      >
                        <div className="team-perf-left">
                          <span className="team-av">{u.initials}</span>
                          <div>
                            <strong>{u.name}</strong>
                            <small>{u.role}</small>
                          </div>
                        </div>
                        <div className="team-perf-right">
                          <strong>{u.count}</strong>
                          <div className="bar-track">
                            <div
                              className="bar-fill"
                              style={{ width: `${u.pct}%` }}
                            />
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        ) : null}
      </section>
    </AppShell>
  );
}
