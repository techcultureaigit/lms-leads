"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import Topbar from "@/components/layout/Topbar";
import PageHeader from "@/components/shared/PageHeader";
import { useLeads } from "@/context/LeadsContext";
import { useUsers } from "@/context/UsersContext";
import { useAuth } from "@/context/AuthContext";
import { hasPermission } from "@/lib/permissions";

type Tone = "blue" | "indigo" | "amber" | "cyan" | "purple" | "rose" | "sky" | "orange";
type Filter = "all" | "Active" | "Away" | "Inactive";

function UsersIcon({ tone }: { tone: Tone }) {
  return (
    <span className={`kpi-icon tone-${tone}`} aria-hidden>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="9" cy="8" r="3.5" />
        <path d="M2.5 19a6.5 6.5 0 0 1 13 0" />
        <circle cx="17" cy="9" r="2.5" />
        <path d="M16 19c.4-2.2 1.9-4 4.5-4.5" />
      </svg>
    </span>
  );
}

const AVATAR_TONES = ["blue", "purple", "orange", "cyan"] as const;

export default function UsersPageClient() {
  const router = useRouter();
  const { leads } = useLeads();
  const { users, deleteUser } = useUsers();
  const { user: me } = useAuth();
  const canManage = hasPermission(me?.permissions, "users.manage");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const enriched = useMemo(() => {
    return users.map((u, idx) => ({
      ...u,
      owned: leads.filter((l) => l.owner === u.name).length,
      assigned: leads.filter((l) => l.assigned === u.name).length,
      tone: AVATAR_TONES[idx % AVATAR_TONES.length],
    }));
  }, [users, leads]);

  const filtered = useMemo(() => {
    return enriched
      .filter((u) => (filter === "all" ? true : u.status === filter))
      .filter((u) => {
        const q = search.trim().toLowerCase();
        if (!q) return true;
        return `${u.name} ${u.role} ${u.email} ${u.phone} ${u.status}`
          .toLowerCase()
          .includes(q);
      });
  }, [enriched, filter, search]);

  const activeCount = users.filter((u) => u.status === "Active").length;
  const awayCount = users.filter((u) => u.status === "Away").length;
  const totalOwned = enriched.reduce((sum, u) => sum + u.owned, 0);

  const metrics: {
    label: string;
    value: number;
    tone: Tone;
    meta: string;
    filter: Filter | null;
  }[] = [
    {
      label: "Team Size",
      value: users.length,
      tone: "blue",
      meta: "All workspace users",
      filter: "all",
    },
    {
      label: "Active Now",
      value: activeCount,
      tone: "cyan",
      meta: "Ready for assignment",
      filter: "Active",
    },
    {
      label: "Away",
      value: awayCount,
      tone: "amber",
      meta: "Temporarily unavailable",
      filter: "Away",
    },
    {
      label: "Owned Leads",
      value: totalOwned,
      tone: "indigo",
      meta: "Live from pipeline",
      filter: null,
    },
    {
      label: "Showing",
      value: filtered.length,
      tone: "purple",
      meta: "Current filter result",
      filter: null,
    },
  ];

  const openUser = (id: string) => {
    router.push(`/users/${id}/edit`);
  };

  return (
    <AppShell>
      <Topbar
        title="Users"
        subtitle="Role-based team and access manager"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search users..."
      />

      <section className="content users-page">
        <PageHeader
          title="Users"
          subtitle="Create users, assign roles, and control permissions."
          crumbs={[{ label: "Users" }]}
          actions={
            <>
              <Link href="/roles" className="btn btn-secondary dash-cta">
                Roles
              </Link>
              <Link href="/leads" className="btn btn-secondary dash-cta">
                View Leads
              </Link>
              {canManage ? (
              <Link href="/users/create" className="btn btn-primary dash-cta">
                Create User
              </Link>
              ) : null}
            </>
          }
        />

        <div className="kpi-grid users-kpi-grid">
          {metrics.map((m) => (
            <button
              type="button"
              key={m.label}
              className={`kpi-card kpi-card-link fu-kpi-card ${
                m.filter !== null && filter === m.filter ? "is-active" : ""
              }`}
              onClick={() => {
                if (m.filter !== null) setFilter(m.filter);
              }}
              disabled={m.filter === null}
              title={
                m.filter === null
                  ? m.label
                  : `Show ${m.label.toLowerCase()}`
              }
            >
              <UsersIcon tone={m.tone} />
              <div>
                <span className="kpi-label">{m.label}</span>
                <strong className="kpi-value">{m.value}</strong>
                <span className="fu-kpi-meta">{m.meta}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="fu-toolbar">
          <div>
            <h2>Team Directory</h2>
            <p>Role-based access for owners and assignees · {filtered.length} showing</p>
          </div>
          <div className="list-toolbar-right">
            <input
              className="list-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users…"
            />
            <div className="follow-filters">
              {(
                [
                  ["all", "All"],
                  ["Active", "Active"],
                  ["Away", "Away"],
                  ["Inactive", "Inactive"],
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

        {!filtered.length ? (
          <div className="fu-empty">
            <h3>No users found</h3>
            <p>Try another search or create a new user.</p>
            {canManage ? (
            <Link href="/users/create" className="btn btn-primary dash-cta">
              Create User
            </Link>
            ) : null}
          </div>
        ) : (
          <div className="table-wrap users-list-wrap">
            <table className="users-list-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>Status</th>
                  <th>Owned</th>
                  <th>Assigned</th>
                  <th>Permissions</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr
                    key={user.id}
                    className="leads-click-row"
                    tabIndex={0}
                    role="link"
                    onClick={() => openUser(user.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openUser(user.id);
                      }
                    }}
                  >
                    <td>
                      <div className="users-list-user">
                        <div className={`user-avatar tone-${user.tone}`}>
                          {user.initials}
                        </div>
                        <strong>{user.name}</strong>
                      </div>
                    </td>
                    <td>{user.role}</td>
                    <td>{user.email}</td>
                    <td>+91 {user.phone}</td>
                    <td>
                      <span
                        className={`chip ${
                          user.status === "Away" || user.status === "Inactive"
                            ? "is-away"
                            : "is-active"
                        }`}
                      >
                        <span
                          className={`chip-dot ${user.status !== "Active" ? "away" : ""}`}
                        />
                        {user.status}
                      </span>
                    </td>
                    <td>{user.owned}</td>
                    <td>{user.assigned}</td>
                    <td>{user.permissions.length}</td>
                    <td
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      <div className="fu-list-actions">
                        {canManage ? (
                        <button
                          type="button"
                          className="btn btn-secondary dash-cta"
                          onClick={() => {
                            if (confirm(`Delete ${user.name}?`)) deleteUser(user.id);
                          }}
                        >
                          Delete
                        </button>
                        ) : null}
                        {canManage ? (
                        <button
                          type="button"
                          className="btn btn-primary dash-cta"
                          onClick={() => openUser(user.id)}
                        >
                          Edit
                        </button>
                        ) : (
                          <span className="muted">View only</span>
                        )}
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
