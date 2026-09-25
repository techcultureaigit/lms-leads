"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import Topbar from "@/components/layout/Topbar";
import PageHeader from "@/components/shared/PageHeader";
import { useRoles } from "@/context/RolesContext";
import { useAuth } from "@/context/AuthContext";
import { hasPermission } from "@/lib/permissions";

type Tone = "blue" | "indigo" | "amber" | "cyan" | "purple";

function RoleIcon({ tone }: { tone: Tone }) {
  return (
    <span className={`kpi-icon tone-${tone}`} aria-hidden>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 3 4 6v5c0 5 3.4 8.5 8 10 4.6-1.5 8-5 8-10V6l-8-3z" />
        <path d="M9.5 12.5 11 14l3.5-3.5" />
      </svg>
    </span>
  );
}

export default function RolesPageClient() {
  const router = useRouter();
  const { roles, deleteRole } = useRoles();
  const { user } = useAuth();
  const canManage = hasPermission(user?.permissions, "users.manage");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return roles;
    return roles.filter((r) =>
      `${r.name} ${r.description} ${r.permissions.join(" ")}`
        .toLowerCase()
        .includes(q),
    );
  }, [roles, search]);

  const systemCount = roles.filter((r) => r.isSystem).length;
  const customCount = roles.length - systemCount;
  const avgPerms =
    roles.length === 0
      ? 0
      : Math.round(
          roles.reduce((sum, r) => sum + r.permissions.length, 0) / roles.length,
        );

  const metrics: { label: string; value: number; tone: Tone; meta: string }[] = [
    {
      label: "Total Roles",
      value: roles.length,
      tone: "blue",
      meta: "All workspace roles",
    },
    {
      label: "System",
      value: systemCount,
      tone: "indigo",
      meta: "Built-in defaults",
    },
    {
      label: "Custom",
      value: customCount,
      tone: "cyan",
      meta: "Created by team",
    },
    {
      label: "Avg Permissions",
      value: avgPerms,
      tone: "purple",
      meta: "Per role",
    },
    {
      label: "Showing",
      value: filtered.length,
      tone: "amber",
      meta: "Current search",
    },
  ];

  const openRole = (id: string) => {
    router.push(`/roles/${id}/edit`);
  };

  return (
    <AppShell>
      <Topbar
        title="Roles"
        subtitle="Create roles and assign permissions"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search roles..."
      />

      <section className="content users-page">
        <PageHeader
          title="Roles"
          subtitle="Define roles and choose which permissions each role gets."
          crumbs={[{ label: "Roles" }]}
          actions={
            <>
              <Link href="/users" className="btn btn-secondary dash-cta">
                Users
              </Link>
              {canManage ? (
              <Link href="/roles/create" className="btn btn-primary dash-cta">
                Create Role
              </Link>
              ) : null}
            </>
          }
        />

        <div className="kpi-grid users-kpi-grid">
          {metrics.map((m) => (
            <div key={m.label} className="kpi-card fu-kpi-card">
              <RoleIcon tone={m.tone} />
              <div>
                <span className="kpi-label">{m.label}</span>
                <strong className="kpi-value">{m.value}</strong>
                <span className="fu-kpi-meta">{m.meta}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="fu-toolbar">
          <div>
            <h2>Role Directory</h2>
            <p>CRUD roles with full permission control · {filtered.length} showing</p>
          </div>
          <div className="list-toolbar-right">
            <input
              className="list-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search roles…"
            />
          </div>
        </div>

        {!filtered.length ? (
          <div className="fu-empty">
            <h3>No roles found</h3>
            <p>Try another search or create a new role.</p>
            {canManage ? (
            <Link href="/roles/create" className="btn btn-primary dash-cta">
              Create Role
            </Link>
            ) : null}
          </div>
        ) : (
          <div className="table-wrap users-list-wrap">
            <table className="users-list-table">
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Description</th>
                  <th>Type</th>
                  <th>Permissions</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((role) => (
                  <tr
                    key={role.id}
                    className="leads-click-row"
                    tabIndex={0}
                    role="link"
                    onClick={() => openRole(role.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openRole(role.id);
                      }
                    }}
                  >
                    <td>
                      <strong>{role.name}</strong>
                    </td>
                    <td>{role.description || "—"}</td>
                    <td>
                      <span
                        className={`chip ${role.isSystem ? "is-away" : "is-active"}`}
                      >
                        <span
                          className={`chip-dot ${role.isSystem ? "away" : ""}`}
                        />
                        {role.isSystem ? "System" : "Custom"}
                      </span>
                    </td>
                    <td>{role.permissions.length}</td>
                    <td
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      <div className="fu-list-actions">
                        {canManage && role.name !== "Admin" ? (
                          <button
                            type="button"
                            className="btn btn-secondary dash-cta"
                            onClick={() => {
                              if (confirm(`Delete role "${role.name}"?`)) {
                                deleteRole(role.id).catch((err) =>
                                  alert(err?.message || "Could not delete role"),
                                );
                              }
                            }}
                          >
                            Delete
                          </button>
                        ) : null}
                        {canManage ? (
                        <button
                          type="button"
                          className="btn btn-primary dash-cta"
                          onClick={() => openRole(role.id)}
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
