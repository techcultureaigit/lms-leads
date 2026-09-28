"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import Topbar from "@/components/layout/Topbar";
import PageHeader from "@/components/shared/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError } from "@/lib/api";
import { hasPermission } from "@/lib/permissions";

type TemplateRow = {
  id: string;
  name: string;
  subject: string;
  category: string;
  isActive: boolean;
  usageCount: number;
  createdAt?: string;
};

export default function EmailTemplatesPageClient() {
  const { user } = useAuth();
  const canEdit = hasPermission(user?.permissions, "email.create");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<TemplateRow[]>([]);
  const [error, setError] = useState("");

  const load = (q = search) => {
    const query = q.trim() ? `?q=${encodeURIComponent(q.trim())}` : "";
    api<{ items: TemplateRow[] }>(`/api/email-templates${query}`)
      .then((res) => setItems(res.items))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load templates"));
  };

  useEffect(() => {
    load("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = async (row: TemplateRow) => {
    await api(`/api/email-templates/${row.id}`, {
      method: "PUT",
      body: { isActive: !row.isActive },
    });
    load();
  };

  const remove = async (row: TemplateRow) => {
    if (!confirm(`Delete template "${row.name}"?`)) return;
    setError("");
    try {
      await api(`/api/email-templates/${row.id}`, { method: "DELETE" });
    } catch (err) {
      const gone = err instanceof ApiError && err.status === 404;
      if (!gone) {
        setError(err instanceof ApiError ? err.message : "Could not delete template");
        return;
      }
    }
    setItems((prev) => prev.filter((item) => item.id !== row.id));
  };

  return (
    <AppShell>
      <Topbar
        title="Email Templates"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search templates..."
        showSearch
      />
      <section className="content email-page">
        <PageHeader
          title="Email Templates"
          subtitle="Saved layouts used when sending email."
          crumbs={[{ label: "Email Templates" }]}
          actions={
            canEdit ? (
              <Link href="/email/create" className="btn btn-primary dash-cta">Create Template</Link>
            ) : null
          }
        />
        {error ? <div className="cal-flash err">{error}</div> : null}
        <div className="fu-toolbar">
          <div>
            <h2>Templates</h2>
            <p>{items.length} showing</p>
          </div>
          <button type="button" className="btn btn-secondary dash-cta" onClick={() => load()}>Search</button>
        </div>
        <div className="table-wrap">
          <table className="users-list-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Subject</th>
                <th>Category</th>
                <th>Status</th>
                <th>Usage</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {!items.length ? (
                <tr><td colSpan={7}>No templates yet.</td></tr>
              ) : items.map((row) => (
                <tr key={row.id}>
                  <td><strong>{row.name}</strong></td>
                  <td>{row.subject}</td>
                  <td>{row.category}</td>
                  <td>
                    <span className={`chip ${row.isActive ? "is-active" : "is-away"}`}>
                      {row.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>{row.usageCount}</td>
                  <td>{row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "—"}</td>
                  <td>
                    <div className="fu-list-actions">
                      <Link href={`/email/templates/${row.id}`} className="btn btn-secondary dash-cta">View</Link>
                      {canEdit ? (
                        <>
                          <button type="button" className="btn btn-secondary dash-cta" onClick={() => toggle(row)}>
                            {row.isActive ? "Deactivate" : "Activate"}
                          </button>
                          <Link href={`/email/templates/${row.id}/edit`} className="btn btn-primary dash-cta">Edit</Link>
                          <button type="button" className="btn btn-secondary dash-cta" onClick={() => remove(row)}>Delete</button>
                        </>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
