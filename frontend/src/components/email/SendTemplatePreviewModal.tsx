"use client";

import { useEffect, useRef, useState } from "react";
import { Code2, Monitor, Smartphone, X } from "lucide-react";

type Props = {
  templateName: string;
  initialSubject: string;
  initialHtml: string;
  loading?: boolean;
  onClose: () => void;
  onApply: (next: { subject: string; html: string }) => void;
};

export default function SendTemplatePreviewModal({
  templateName,
  initialSubject,
  initialHtml,
  loading = false,
  onClose,
  onApply,
}: Props) {
  const [subject, setSubject] = useState(initialSubject);
  const [html, setHtml] = useState(initialHtml);
  const [view, setView] = useState<"desktop" | "mobile" | "html">("desktop");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const skipWriteRef = useRef(false);

  useEffect(() => {
    setSubject(initialSubject);
    setHtml(initialHtml);
  }, [initialSubject, initialHtml]);

  useEffect(() => {
    if (view === "html" || loading) return;
    if (skipWriteRef.current) {
      skipWriteRef.current = false;
      return;
    }
    const frame = iframeRef.current;
    const doc = frame?.contentDocument;
    if (!doc) return;
    doc.open();
    doc.write(html || "<p></p>");
    doc.close();
    if (doc.body) {
      doc.body.contentEditable = "true";
      doc.body.style.outline = "none";
      const onInput = () => {
        const currentDoc = iframeRef.current?.contentDocument;
        if (!currentDoc) return;
        skipWriteRef.current = true;
        setHtml(`<!DOCTYPE html>\n${currentDoc.documentElement.outerHTML}`);
      };
      doc.body.addEventListener("input", onInput);
      return () => doc.body?.removeEventListener("input", onInput);
    }
  }, [html, view, loading]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div className="min-w-0">
            <h3 className="truncate text-base font-bold text-slate-900">
              {templateName || "Template Preview"}
            </h3>
            <p className="text-xs text-slate-500">
              Preview or click inside the email to edit text before sending.
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setView("desktop")}
              className={`inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs font-semibold ${
                view === "desktop"
                  ? "border-blue-300 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Monitor size={14} /> Desktop
            </button>
            <button
              type="button"
              onClick={() => setView("mobile")}
              className={`inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs font-semibold ${
                view === "mobile"
                  ? "border-blue-300 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Smartphone size={14} /> Mobile
            </button>
            <button
              type="button"
              onClick={() => setView(view === "html" ? "desktop" : "html")}
              className={`inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs font-semibold ${
                view === "html"
                  ? "border-blue-300 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Code2 size={14} /> HTML
            </button>
            <button
              type="button"
              onClick={onClose}
              title="Close"
              className="ml-1 inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Subject input */}
        <div className="border-b border-slate-200 bg-slate-50 px-5 py-3">
          <label className="flex items-center gap-3 text-xs font-semibold text-slate-600">
            <span className="shrink-0">Subject:</span>
            <input
              className="input h-9 flex-1 bg-white text-sm font-medium text-slate-900"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
            />
          </label>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto bg-[#f2f4f8] p-5">
          {loading ? (
            <div className="flex h-[420px] items-center justify-center text-sm text-slate-500">
              Loading template preview…
            </div>
          ) : view === "html" ? (
            <textarea
              className="h-[460px] w-full rounded-xl bg-slate-900 p-4 font-mono text-xs text-slate-100 outline-none resize-none"
              style={{ border: 0, background: "#0f172a", color: "#f1f5f9", height: 460 }}
              spellCheck={false}
              value={html}
              onChange={(e) => setHtml(e.target.value)}
            />
          ) : (
            <div
              className="mx-auto overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all"
              style={{ width: view === "mobile" ? 390 : "100%", maxWidth: 740 }}
            >
              <iframe
                ref={iframeRef}
                title="Email template preview"
                className="h-[480px] w-full border-0 bg-white"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-slate-200 bg-white px-5 py-3.5">
          <span className="text-xs text-slate-500">
            Edits apply to this send only (saved template stays unchanged).
          </span>
          <div className="flex items-center gap-2">
            <button type="button" className="btn btn-secondary dash-cta" onClick={onClose}>
              Close
            </button>
            <button
              type="button"
              className="btn btn-primary dash-cta"
              disabled={loading}
              onClick={() => onApply({ subject: subject.trim(), html })}
            >
              Use this template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
