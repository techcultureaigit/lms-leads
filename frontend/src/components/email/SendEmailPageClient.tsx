"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Topbar from "@/components/layout/Topbar";
import PageHeader from "@/components/shared/PageHeader";
import { api, ApiError } from "@/lib/api";

type TemplateRow = { id: string; name: string; subject: string; isActive: boolean };
type StudentRow = {
  id: string;
  name: string;
  email: string;
  role: string;
};
type BatchStatus = {
  id: string;
  status: string;
  sent: number;
  failed: number;
  remaining: number;
  total: number;
};

export default function SendEmailPageClient() {
  const [templates, setTemplates] = useState<TemplateRow[]>([]);
  const [templateId, setTemplateId] = useState("");
  const [tab, setTab] = useState<"students" | "csv" | "manual">("students");
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [search, setSearch] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [manual, setManual] = useState("");
  const [csvText, setCsvText] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [jobId, setJobId] = useState("");
  const [progress, setProgress] = useState<BatchStatus | null>(null);

  useEffect(() => {
    api<{ items: TemplateRow[] }>("/api/email-templates?active=1")
      .then((res) => setTemplates(res.items))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load templates"));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      api<{ items: StudentRow[] }>(
        `/api/email-templates/students/list?search=${encodeURIComponent(search)}`,
      )
        .then((res) => setStudents(res.items))
        .catch(() => setStudents([]));
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!jobId) return;
    let stop = false;
    const tick = async () => {
      try {
        const res = await api<{ batch: BatchStatus }>(`/api/email-templates/send/status/${jobId}`);
        if (!stop) setProgress(res.batch);
      } catch {
        /* keep last progress */
      }
    };
    tick();
    const id = setInterval(tick, 1500);
    return () => {
      stop = true;
      clearInterval(id);
    };
  }, [jobId]);

  const allChecked = students.length > 0 && students.every((student) => picked.includes(student.id));

  const summary = useMemo(() => progress, [progress]);

  const send = async () => {
    if (!templateId) {
      setError("Select an email template.");
      return;
    }
    setSending(true);
    setError("");
    try {
      if (tab === "students") {
        if (!picked.length) throw new Error("Select at least one user.");
        const res = await api<{ jobId: string }>("/api/email-templates/send", {
          method: "POST",
          body: { templateId, studentIds: picked },
        });
        setJobId(res.jobId);
      } else {
        const emails = tab === "csv" ? csvText : manual;
        if (!emails.trim()) throw new Error("Add at least one email address.");
        const res = await api<{ jobId: string }>("/api/email-templates/send-external", {
          method: "POST",
          body: { templateId, emails, mode: tab },
        });
        setJobId(res.jobId);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : err instanceof Error ? err.message : "Send failed");
    } finally {
      setSending(false);
    }
  };

  return (
    <AppShell>
      <Topbar title="Send email" showSearch={false} />
      <section className="content email-page">
        <PageHeader
          title="Send email"
          subtitle="Choose a template and recipients, then send."
          crumbs={[{ label: "Send Email" }]}
          actions={
            <button type="button" className="btn btn-primary dash-cta" onClick={send} disabled={sending}>
              {sending ? "Starting…" : "Send email"}
            </button>
          }
        />
        {error ? <div className="cal-flash err">{error}</div> : null}

        <div className="settings-panel email-send-card">
          <div className="settings-body">
            <label>
              Select email template <span className="required">*</span>
              <select value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
                <option value="">Select template…</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name} — {template.subject}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="email-tabs">
          <button type="button" className={tab === "students" ? "active" : ""} onClick={() => setTab("students")}>All users</button>
          <button type="button" className={tab === "csv" ? "active" : ""} onClick={() => setTab("csv")}>CSV upload</button>
          <button type="button" className={tab === "manual" ? "active" : ""} onClick={() => setTab("manual")}>Manual entry</button>
        </div>

        {tab === "students" ? (
          <div className="settings-panel">
            <div className="settings-body">
              <div className="email-student-tools">
                <input className="input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..." />
                <button
                  type="button"
                  className="btn btn-secondary dash-cta"
                  onClick={() => setPicked(allChecked ? [] : students.map((student) => student.id))}
                >
                  {allChecked ? "Clear" : "Select all"}
                </button>
              </div>
              <div className="email-student-list">
                {students.map((student) => (
                  <label key={student.id}>
                    <input
                      type="checkbox"
                      checked={picked.includes(student.id)}
                      onChange={(e) => {
                        setPicked((prev) =>
                          e.target.checked ? [...prev, student.id] : prev.filter((id) => id !== student.id),
                        );
                      }}
                    />
                    <span>
                      <strong>{student.name || student.email}</strong>
                      <em className="email-user-role">{student.role || "—"}</em>
                      <small>{student.email}</small>
                    </span>
                  </label>
                ))}
                {!students.length ? <p>No users with an email address.</p> : null}
              </div>
              <p>{picked.length} selected</p>
            </div>
          </div>
        ) : null}

        {tab === "csv" ? (
          <div className="settings-panel">
            <div className="settings-body">
              <input
                type="file"
                accept=".csv,text/csv,text/plain"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  file.text().then(setCsvText);
                }}
              />
              <textarea value={csvText} onChange={(e) => setCsvText(e.target.value)} placeholder="Or paste CSV text containing email addresses" />
            </div>
          </div>
        ) : null}

        {tab === "manual" ? (
          <div className="settings-panel">
            <div className="settings-body">
              <textarea value={manual} onChange={(e) => setManual(e.target.value)} placeholder="one@email.com, two@email.com" />
            </div>
          </div>
        ) : null}

        {summary ? (
          <div className="email-progress">
            <div><span>Sent</span><strong>{summary.sent}</strong></div>
            <div><span>Remaining</span><strong>{summary.remaining}</strong></div>
            <div><span>Failed</span><strong>{summary.failed}</strong></div>
            <div><span>Status</span><strong>{summary.status}</strong></div>
          </div>
        ) : null}
      </section>
    </AppShell>
  );
}
