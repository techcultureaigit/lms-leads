"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Topbar from "@/components/layout/Topbar";
import PageHeader from "@/components/shared/PageHeader";
import { api, ApiError } from "@/lib/api";

type BatchRow = {
  id: string;
  templateName: string;
  mode: string;
  status: string;
  total: number;
  sent: number;
  failed: number;
  unsent: number;
  remaining: number;
  createdBy: string;
  createdAt?: string;
};

export default function EmailReportsPageClient() {
  const [items, setItems] = useState<BatchRow[]>([]);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<BatchRow | null>(null);
  const [recipients, setRecipients] = useState<{ email: string; status: string; error: string }[]>([]);

  const load = () => {
    api<{ items: BatchRow[] }>("/api/email-templates/send/batches")
      .then((res) => setItems(res.items))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load reports"));
  };

  useEffect(() => {
    load();
  }, []);

  const open = async (row: BatchRow) => {
    setSelected(row);
    const res = await api<{ batch: { recipients: { email: string; status: string; error: string }[] } }>(
      `/api/email-templates/send/batches/${row.id}`,
    );
    setRecipients(res.batch.recipients);
  };

  const stop = async (row: BatchRow) => {
    try {
      await api(`/api/email-templates/send/batches/${row.id}/stop`, { method: "POST" });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not stop batch");
    }
  };

  const resend = async (row: BatchRow) => {
    try {
      await api(`/api/email-templates/send/batches/${row.id}/resend`, { method: "POST" });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not resend batch");
    }
  };

  return (
    <AppShell>
      <Topbar title="Send Reports" showSearch={false} />
      <section className="content email-page">
        <PageHeader
          title="Send Reports"
          subtitle="Batch status for sent, failed, and unsent email."
          crumbs={[{ label: "Send Reports" }]}
        />
        {error ? <div className="cal-flash err">{error}</div> : null}
        <div className="table-wrap">
          <table className="users-list-table">
            <thead>
              <tr>
                <th>Template</th>
                <th>Mode</th>
                <th>Status</th>
                <th>Sent</th>
                <th>Failed</th>
                <th>Unsent</th>
                <th>Total</th>
                <th>By</th>
                <th>When</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {!items.length ? (
                <tr><td colSpan={10}>No send batches yet.</td></tr>
              ) : items.map((row) => (
                <tr key={row.id}>
                  <td><strong>{row.templateName}</strong></td>
                  <td>{row.mode}</td>
                  <td>{row.status}</td>
                  <td>{row.sent}</td>
                  <td>{row.failed}</td>
                  <td>{row.unsent}</td>
                  <td>{row.total}</td>
                  <td>{row.createdBy || "—"}</td>
                  <td>{row.createdAt ? new Date(row.createdAt).toLocaleString() : "—"}</td>
                  <td>
                    <div className="fu-list-actions">
                      <button type="button" className="btn btn-secondary dash-cta" onClick={() => open(row)}>View</button>
                      {row.status === "running" || row.status === "queued" ? (
                        <button type="button" className="btn btn-secondary dash-cta" onClick={() => stop(row)}>Stop</button>
                      ) : null}
                      {row.failed > 0 || row.unsent > 0 ? (
                        <button type="button" className="btn btn-primary dash-cta" onClick={() => resend(row)}>Resend</button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {selected ? (
          <div className="settings-panel">
            <div className="settings-panel-head">
              <h2>{selected.templateName}</h2>
            </div>
            <div className="settings-body">
              <div className="table-wrap">
                <table className="users-list-table">
                  <thead>
                    <tr><th>Email</th><th>Status</th><th>Error</th></tr>
                  </thead>
                  <tbody>
                    {recipients.map((recipient) => (
                      <tr key={`${recipient.email}-${recipient.status}`}>
                        <td>{recipient.email}</td>
                        <td>{recipient.status}</td>
                        <td>{recipient.error || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </AppShell>
  );
}
