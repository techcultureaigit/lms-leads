"use client";

import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import Topbar from "@/components/layout/Topbar";
import PageHeader from "@/components/shared/PageHeader";
import { TEAM_USERS } from "@/lib/constants";
import { useAuth } from "@/context/AuthContext";
import { useLeads } from "@/context/LeadsContext";
import type { LeadStatus } from "@/types/lead";

type Tone = "blue" | "orange" | "purple" | "cyan" | "indigo" | "amber" | "rose" | "sky";

const MONTHS = ["Apr", "May", "Jun", "Jul", "Aug", "Sep"];
const MONTH_VALUES = [8, 11, 9, 14, 12, 7];
const STATUS_ORDER: LeadStatus[] = [
  "New",
  "In Process",
  "Meeting",
  "Completed",
  "Lost",
];
const STATUS_COLOR: Record<LeadStatus, string> = {
  New: "#3b82f6",
  "In Process": "#f59e0b",
  Meeting: "#8b5cf6",
  Completed: "#0ea5e9",
  Lost: "#ef4444",
};

function ReportIcon({ tone }: { tone: Tone }) {
  return (
    <span className={`kpi-icon tone-${tone}`} aria-hidden>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 19V5M4 19h16" strokeLinecap="round" />
        <path d="M8 15v-4M12 15V8M16 15v-6" strokeLinecap="round" />
      </svg>
    </span>
  );
}

function VolumeChart({ values, labels }: { values: number[]; labels: string[] }) {
  const w = 560;
  const h = 240;
  const padX = 28;
  const padY = 24;
  const max = Math.max(...values, 1);
  const barW = ((w - padX * 2) / values.length) * 0.55;
  const gap = (w - padX * 2) / values.length;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="report-svg" role="img">
      {[0.25, 0.5, 0.75, 1].map((t) => (
        <line
          key={t}
          x1={padX}
          x2={w - padX}
          y1={padY + (h - padY * 2) * (1 - t)}
          y2={padY + (h - padY * 2) * (1 - t)}
          stroke="#e8eef6"
          strokeWidth="1"
        />
      ))}
      {values.map((v, i) => {
        const barH = (v / max) * (h - padY * 2);
        const x = padX + i * gap + (gap - barW) / 2;
        const y = h - padY - barH;
        return (
          <g key={labels[i]}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={barH}
              rx="8"
              fill="url(#barGrad)"
            />
            <text
              x={x + barW / 2}
              y={y - 8}
              textAnchor="middle"
              className="report-svg-value"
            >
              {v}
            </text>
            <text
              x={x + barW / 2}
              y={h - 8}
              textAnchor="middle"
              className="report-svg-label"
            >
              {labels[i]}
            </text>
          </g>
        );
      })}
      <defs>
        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function ReportsPageClient() {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";
  const { leads } = useLeads();
  const total = leads.length;
  const won = leads.filter((l) => l.status === "Completed").length;
  const lost = leads.filter((l) => l.status === "Lost").length;
  const meeting = leads.filter((l) => l.status === "Meeting").length;
  const inProcess = leads.filter((l) => l.status === "In Process").length;
  const neu = leads.filter((l) => l.status === "New").length;
  const followups = leads.filter((l) => l.followup).length;
  const winRate = total ? Math.round((won / total) * 100) : 0;
  const qualified = inProcess + meeting;

  const monthValues = [...MONTH_VALUES.slice(0, 5), total || MONTH_VALUES[5]];

  const statusBreak = STATUS_ORDER.map((status) => ({
    status,
    count: leads.filter((l) => l.status === status).length,
  }));

  const productMap = new Map<string, number>();
  leads.forEach((l) => {
    l.products.forEach((p) => productMap.set(p, (productMap.get(p) || 0) + 1));
  });
  const topProducts = [...productMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const ownerRows = TEAM_USERS.map((u) => ({
    ...u,
    count: leads.filter((l) => l.owner === u.name).length,
  })).sort((a, b) => b.count - a.count);

  const metrics: { label: string; value: string | number; tone: Tone; meta: string }[] = [
    { label: "Win Rate", value: `${winRate}%`, tone: "blue", meta: `${won} won · ${lost} lost` },
    {
      label: "Total Leads",
      value: total,
      tone: "indigo",
      meta: isAdmin ? "All pipeline records" : "Your assigned leads",
    },
    { label: "Meetings", value: meeting, tone: "purple", meta: "Booked this cycle" },
    { label: "Follow-ups Open", value: followups, tone: "amber", meta: "Pending actions" },
    ...(isAdmin
      ? [
          {
            label: "Active Owners",
            value: TEAM_USERS.length,
            tone: "cyan" as Tone,
            meta: "Team coverage",
          },
        ]
      : []),
  ];

  return (
    <AppShell>
      <Topbar
        title="Reports"
        subtitle="Performance insights across leads and products"
        showSearch={false}
      />

      <section className="content report-page">
        <PageHeader
          title="Reports"
          subtitle="Track conversion, volume, and product demand at a glance."
          crumbs={[{ label: "Reports" }]}
          actions={
            <>
              <Link href="/leads" className="btn btn-secondary dash-cta">
                View Leads
              </Link>
              <button type="button" className="btn btn-primary dash-cta">
                Export Report
              </button>
            </>
          }
        />

        <div className="kpi-grid report-kpi-grid">
          {metrics.map((m) => (
            <div className="kpi-card" key={m.label}>
              <ReportIcon tone={m.tone} />
              <div>
                <span className="kpi-label">{m.label}</span>
                <strong className="kpi-value">{m.value}</strong>
                <span className="fu-kpi-meta">{m.meta}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="report-grid">
          <div className="report-card">
            <div className="report-card-head">
              <div>
                <h2>Leads Created</h2>
                <p>Monthly volume trend</p>
              </div>
              <select className="dash-select sm" defaultValue="6" aria-label="Period">
                <option value="6">6 Months</option>
                <option value="12">12 Months</option>
              </select>
            </div>
            <VolumeChart values={monthValues} labels={MONTHS} />
          </div>

          <div className="report-card">
            <div className="report-card-head">
              <div>
                <h2>Conversion Snapshot</h2>
                <p>Funnel at current stage</p>
              </div>
            </div>
            <div className="report-funnel">
              <div className="report-funnel-item">
                <span>New</span>
                <strong>{neu}</strong>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${(neu / Math.max(total, 1)) * 100}%` }} />
                </div>
              </div>
              <div className="report-funnel-item">
                <span>Qualified</span>
                <strong>{qualified}</strong>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${(qualified / Math.max(total, 1)) * 100}%` }} />
                </div>
              </div>
              <div className="report-funnel-item">
                <span>Closed Won</span>
                <strong>{won}</strong>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${(won / Math.max(total, 1)) * 100}%` }} />
                </div>
              </div>
              <div className="report-funnel-item">
                <span>Closed Lost</span>
                <strong>{lost}</strong>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${(lost / Math.max(total, 1)) * 100}%`,
                      background: "linear-gradient(90deg, #fb7185, #e11d48)",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="report-grid three">
          <div className="report-card">
            <div className="report-card-head">
              <div>
                <h2>Status Breakdown</h2>
                <p>Share of total leads</p>
              </div>
            </div>
            <div className="report-status-list">
              {statusBreak.map((row) => (
                <div className="report-status-row" key={row.status}>
                  <div className="report-status-left">
                    <i style={{ background: STATUS_COLOR[row.status] }} />
                    <span>{row.status}</span>
                  </div>
                  <div className="report-status-right">
                    <strong>{row.count}</strong>
                    <em>{total ? Math.round((row.count / total) * 100) : 0}%</em>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="report-card">
            <div className="report-card-head">
              <div>
                <h2>Top Products</h2>
                <p>Most requested interests</p>
              </div>
            </div>
            <div className="report-product-list">
              {topProducts.length ? (
                topProducts.map(([name, count], idx) => (
                  <div className="report-product-row" key={name}>
                    <div className="report-product-rank">{idx + 1}</div>
                    <div className="report-product-main">
                      <strong>{name}</strong>
                      <div className="bar-track">
                        <div
                          className="bar-fill"
                          style={{
                            width: `${(count / Math.max(topProducts[0][1], 1)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    <span>{count}</span>
                  </div>
                ))
              ) : (
                <div className="empty">No product data</div>
              )}
            </div>
          </div>

          {isAdmin ? (
          <div className="report-card">
            <div className="report-card-head">
              <div>
                <h2>Owner Performance</h2>
                <p>Leads owned by team</p>
              </div>
            </div>
            <div className="team-perf-list">
              {ownerRows.map((u) => (
                <div className="team-perf-row" key={u.id}>
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
                        style={{
                          width: `${(u.count / Math.max(...ownerRows.map((o) => o.count), 1)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          ) : null}
        </div>
      </section>
    </AppShell>
  );
}
