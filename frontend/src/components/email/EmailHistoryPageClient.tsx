"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Topbar from "@/components/layout/Topbar";
import PageHeader from "@/components/shared/PageHeader";
import { api, ApiError } from "@/lib/api";

type HistoryRow = {
  id: string;
  action: string;
  message: string;
  actor: string;
  createdAt?: string;
};

const LABELS: Record<string, string> = {
  "template.create": "Template created",
  "template.update": "Template updated",
  "template.delete": "Template deleted",
  "email.send": "Email sent",
  "email.stop": "Send stopped",
  "email.resend": "Resend started",
};

export default function EmailHistoryPageClient() {
  const [items, setItems] = useState<HistoryRow[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api<{ items: HistoryRow[] }>("/api/email-history")
      .then((res) => setItems(res.items))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load history"));
  }, []);

  return (
    <AppShell>
      <Topbar title="Email History" showSearch={false} />
      <section className="content email-page">
        <PageHeader
          title="Email History"
          subtitle="Who created, updated, deleted, or sent email."
          crumbs={[{ label: "Email History" }]}
        />
        {error ? <div className="cal-flash err">{error}</div> : null}
        <div className="table-wrap">
          <table className="users-list-table">
            <thead>
              <tr>
                <th>When</th>
                <th>Who</th>
                <th>Action</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {!items.length ? (
                <tr><td colSpan={4}>No email activity yet.</td></tr>
              ) : items.map((row) => (
                <tr key={row.id}>
                  <td>{row.createdAt ? new Date(row.createdAt).toLocaleString() : "—"}</td>
                  <td>{row.actor || "—"}</td>
                  <td>{LABELS[row.action] || row.action}</td>
                  <td>{row.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
