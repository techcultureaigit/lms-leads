"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Eye, RotateCcw, Search } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import Topbar from "@/components/layout/Topbar";
import PageHeader from "@/components/shared/PageHeader";
import Toast from "@/components/shared/Toast";
import SendTemplatePreviewModal from "@/components/email/SendTemplatePreviewModal";
import { api, ApiError } from "@/lib/api";
import { takeQueuedLeadEmail } from "@/lib/leadEmail";

type TemplateRow = {
  id: string;
  name: string;
  subject: string;
  category?: string;
  isActive: boolean;
  html?: string;
};
type StudentRow = {
  id: string;
  name: string;
  email: string;
  role: string;
};
type LeadMailRow = {
  id: string;
  name: string;
  email: string;
  company?: string;
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [templateSearch, setTemplateSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [loadedHtml, setLoadedHtml] = useState("");
  const [customSubject, setCustomSubject] = useState<string | null>(null);
  const [customBody, setCustomBody] = useState<string | null>(null);
  const [tab, setTab] = useState<"students" | "leads" | "csv" | "manual">("students");
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [leadRows, setLeadRows] = useState<LeadMailRow[]>([]);
  const [search, setSearch] = useState("");
  const [leadSearch, setLeadSearch] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [pickedLeads, setPickedLeads] = useState<string[]>([]);
  const [pickAllLeads, setPickAllLeads] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
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
    if (typeof window === "undefined") return;
    const audience = new URLSearchParams(window.location.search).get("audience");
    if (audience !== "leads") return;
    setTab("leads");
    const queued = takeQueuedLeadEmail();
    if (queued === "all") setPickAllLeads(true);
    else if (queued?.length) setPickedLeads(queued);
  }, []);

  useEffect(() => {
    if (tab !== "leads") return;
    const timer = setTimeout(() => {
      api<{ items: LeadMailRow[] }>(
        `/api/email-templates/leads/list?search=${encodeURIComponent(leadSearch)}`,
      )
        .then((res) => setLeadRows(res.items))
        .catch(() => setLeadRows([]));
    }, 250);
    return () => clearTimeout(timer);
  }, [leadSearch, tab]);

  useEffect(() => {
    if (!pickAllLeads || !leadRows.length) return;
    setPickedLeads(leadRows.map((lead) => lead.id));
    setPickAllLeads(false);
  }, [pickAllLeads, leadRows]);

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
  const allLeadsChecked =
    leadRows.length > 0 && leadRows.every((lead) => pickedLeads.includes(lead.id));

  const selectedTemplate = useMemo(
    () => templates.find((t) => t.id === templateId) || null,
    [templates, templateId],
  );

  const filteredTemplates = useMemo(() => {
    const q = templateSearch.trim().toLowerCase();
    if (!q) return templates;
    return templates.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        (t.category || "").toLowerCase().includes(q),
    );
  }, [templates, templateSearch]);

  useEffect(() => {
    if (!dropdownOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDropdownOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [dropdownOpen]);

  const openTemplatePreview = async (id: string) => {
    setPreviewOpen(true);
    setPreviewLoading(true);
    try {
      const res = await api<{ template?: TemplateRow; item?: TemplateRow }>(
        `/api/email-templates/${id}`,
      );
      const tpl = res.template || res.item;
      setLoadedHtml(tpl?.html || "");
    } catch {
      setLoadedHtml("");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSelectTemplate = (tpl: TemplateRow) => {
    setTemplateId(tpl.id);
    setDropdownOpen(false);
    setTemplateSearch("");
    setCustomSubject(null);
    setCustomBody(null);
    void openTemplatePreview(tpl.id);
  };

  const isCustomized = customSubject !== null || customBody !== null;

  const summary = useMemo(() => progress, [progress]);

  const successText = (count: number, noun: "user" | "lead") => {
    const label = noun === "lead" ? "lead" : "user";
    return `Email sent successfully · ${count} ${label}${count === 1 ? "" : "s"}`;
  };

  const send = async () => {
    if (!templateId) {
      setError("Select an email template.");
      return;
    }
    setSending(true);
    setError("");
    const overrides = {
      ...(customSubject !== null ? { customSubject } : {}),
      ...(customBody !== null ? { customBody } : {}),
    };
    try {
      if (tab === "students") {
        if (!picked.length) throw new Error("Select at least one user.");
        const res = await api<{ jobId: string }>("/api/email-templates/send", {
          method: "POST",
          body: { templateId, studentIds: picked, ...overrides },
        });
        setJobId(res.jobId);
        setToast(successText(picked.length, "user"));
      } else if (tab === "leads") {
        if (!pickedLeads.length) throw new Error("Select at least one lead.");
        const res = await api<{ jobId: string }>("/api/email-templates/send-leads", {
          method: "POST",
          body: { templateId, leadIds: pickedLeads, ...overrides },
        });
        setJobId(res.jobId);
        setToast(successText(pickedLeads.length, "lead"));
      } else {
        const emails = tab === "csv" ? csvText : manual;
        if (!emails.trim()) throw new Error("Add at least one email address.");
        const res = await api<{ jobId: string }>("/api/email-templates/send-external", {
          method: "POST",
          body: { templateId, emails, mode: tab, ...overrides },
        });
        setJobId(res.jobId);
        setToast("Email sent successfully");
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
        {toast ? <Toast message={toast} onClose={() => setToast(null)} /> : null}

        <div className="settings-panel email-send-card" style={{ overflow: "visible" }}>
          <div className="settings-body" style={{ overflow: "visible" }}>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-slate-800">
                  Select email template <span className="text-red-500">*</span>
                </span>
                {selectedTemplate ? (
                  <div className="flex items-center gap-2">
                    {isCustomized ? (
                      <>
                        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                          Edited for this send
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setCustomSubject(null);
                            setCustomBody(null);
                          }}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800"
                        >
                          <RotateCcw size={12} /> Reset
                        </button>
                      </>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => {
                        if (loadedHtml) setPreviewOpen(true);
                        else void openTemplatePreview(selectedTemplate.id);
                      }}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                    >
                      <Eye size={14} /> Preview &amp; Edit
                    </button>
                  </div>
                ) : null}
              </div>

              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen((open) => !open)}
                  className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-left transition hover:border-blue-400 focus:border-blue-500 focus:outline-none"
                >
                  {selectedTemplate ? (
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-slate-900">
                        {selectedTemplate.name}
                      </div>
                      <div className="truncate text-xs text-slate-500">
                        {customSubject ?? selectedTemplate.subject}
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-slate-400">Select template…</span>
                  )}
                  <ChevronDown
                    size={16}
                    className={`shrink-0 text-slate-500 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {dropdownOpen ? (
                  <div className="absolute left-0 right-0 top-full z-40 mt-1.5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                    <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2">
                      <Search size={14} className="shrink-0 text-slate-400" />
                      <input
                        type="text"
                        autoFocus
                        value={templateSearch}
                        onChange={(e) => setTemplateSearch(e.target.value)}
                        placeholder="Search templates by name or subject..."
                        className="w-full border-0 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                      />
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                      {filteredTemplates.length ? (
                        filteredTemplates.map((tpl) => {
                          const active = tpl.id === templateId;
                          return (
                            <button
                              key={tpl.id}
                              type="button"
                              onClick={() => handleSelectTemplate(tpl)}
                              className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left transition ${
                                active ? "bg-blue-50" : "hover:bg-slate-50"
                              }`}
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className={`truncate text-sm font-semibold ${active ? "text-blue-700" : "text-slate-900"}`}>
                                    {tpl.name}
                                  </span>
                                  {tpl.category ? (
                                    <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                                      {tpl.category}
                                    </span>
                                  ) : null}
                                </div>
                                <div className="mt-0.5 truncate text-xs text-slate-500">
                                  {tpl.subject}
                                </div>
                              </div>
                              {active ? <Check size={16} className="shrink-0 text-blue-600" /> : null}
                            </button>
                          );
                        })
                      ) : (
                        <div className="px-4 py-6 text-center text-sm text-slate-400">
                          No matching templates found.
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {previewOpen && selectedTemplate ? (
          <SendTemplatePreviewModal
            templateName={selectedTemplate.name}
            initialSubject={customSubject ?? selectedTemplate.subject}
            initialHtml={customBody ?? loadedHtml}
            loading={previewLoading}
            onClose={() => setPreviewOpen(false)}
            onApply={({ subject, html }) => {
              setCustomSubject(subject !== selectedTemplate.subject ? subject : null);
              setCustomBody(html !== loadedHtml ? html : null);
              setPreviewOpen(false);
            }}
          />
        ) : null}

        <div className="email-tabs">
          <button type="button" className={tab === "students" ? "active" : ""} onClick={() => setTab("students")}>All users</button>
          <button type="button" className={tab === "leads" ? "active" : ""} onClick={() => setTab("leads")}>Leads</button>
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

        {tab === "leads" ? (
          <div className="settings-panel">
            <div className="settings-body">
              <p className="hint">Mail goes to the email saved on each lead. Leads without an email are skipped.</p>
              <div className="email-student-tools">
                <input className="input" value={leadSearch} onChange={(e) => setLeadSearch(e.target.value)} placeholder="Search leads..." />
                <button
                  type="button"
                  className="btn btn-secondary dash-cta"
                  onClick={() =>
                    setPickedLeads(allLeadsChecked ? [] : leadRows.map((lead) => lead.id))
                  }
                >
                  {allLeadsChecked ? "Clear" : "Select all"}
                </button>
              </div>
              <div className="email-student-list">
                {leadRows.map((lead) => (
                  <label key={lead.id}>
                    <input
                      type="checkbox"
                      checked={pickedLeads.includes(lead.id)}
                      onChange={(e) => {
                        setPickedLeads((prev) =>
                          e.target.checked ? [...prev, lead.id] : prev.filter((id) => id !== lead.id),
                        );
                      }}
                    />
                    <span>
                      <strong>{lead.name || lead.company || lead.email}</strong>
                      {lead.company ? <em className="email-user-role">{lead.company}</em> : null}
                      <small>{lead.email}</small>
                    </span>
                  </label>
                ))}
                {!leadRows.length ? <p>No leads with an email address.</p> : null}
              </div>
              <p>{pickedLeads.length} selected</p>
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
