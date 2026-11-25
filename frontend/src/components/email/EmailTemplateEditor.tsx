"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import Topbar from "@/components/layout/Topbar";
import PageHeader from "@/components/shared/PageHeader";
import { api, ApiError } from "@/lib/api";
import {
  BLOCK_PALETTE,
  EmailBlock,
  EmailBlockType,
  blockInnerHtml,
  emailBodyHtml,
  htmlToPlainText,
  newBlock,
  renderEmailHtml,
  wrapEmailDocument,
} from "@/lib/emailBlocks";

type TemplatePayload = {
  name: string;
  subject: string;
  description: string;
  category: string;
  design: { blocks: EmailBlock[] };
  html: string;
  text: string;
  isActive: boolean;
};

const CATEGORIES = ["general", "welcome", "follow-up", "report", "announcement"];

export default function EmailTemplateEditor({ templateId }: { templateId?: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [blocks, setBlocks] = useState<EmailBlock[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [preview, setPreview] = useState<"desktop" | "mobile">("desktop");
  const [panel, setPanel] = useState<"preview" | "html">("preview");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(Boolean(templateId));
  const [htmlCode, setHtmlCode] = useState(() => renderEmailHtml([]));
  const previewRef = useRef<HTMLIFrameElement>(null);
  const skipPreviewWrite = useRef(false);

  useEffect(() => {
    if (!templateId) return;
    api<{ template: TemplatePayload & { id: string } }>(`/api/email-templates/${templateId}`)
      .then((res) => {
        const nextBlocks = res.template.design?.blocks || [];
        setName(res.template.name);
        setSubject(res.template.subject);
        setDescription(res.template.description || "");
        setCategory(res.template.category || "general");
        setIsActive(res.template.isActive !== false);
        setBlocks(nextBlocks);
        setHtmlCode(res.template.html || renderEmailHtml(nextBlocks));
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Could not load template");
      })
      .finally(() => setLoading(false));
  }, [templateId]);

  useEffect(() => {
    if (skipPreviewWrite.current) {
      skipPreviewWrite.current = false;
      return;
    }
    const timer = window.setTimeout(() => {
      const frame = previewRef.current;
      const doc = frame?.contentDocument;
      if (!frame || !doc) return;
      const scroll = doc.scrollingElement?.scrollTop || 0;
      doc.open();
      doc.write(htmlCode || "<p>No HTML yet</p>");
      doc.close();
      const live = frame.contentDocument;
      if (!live?.body) return;
      if (live.scrollingElement) live.scrollingElement.scrollTop = scroll;
      live.body.contentEditable = "true";
      live.body.spellcheck = false;
      live.body.addEventListener("input", () => {
        const root = live.documentElement.cloneNode(true) as HTMLElement;
        root.querySelectorAll("[contenteditable]").forEach((node) => node.removeAttribute("contenteditable"));
        skipPreviewWrite.current = true;
        setHtmlCode(`<!DOCTYPE html>\n${root.outerHTML}`);
      });
    }, 180);
    return () => window.clearTimeout(timer);
  }, [htmlCode, preview]);

  const addBlock = (type: EmailBlockType) => {
    const block = newBlock(type);
    setBlocks((prev) => [...prev, block]);
    setHtmlCode((prev) => wrapEmailDocument(`${emailBodyHtml(prev)}${blockInnerHtml(block)}`));
  };

  const save = async () => {
    if (!name.trim() || !subject.trim()) {
      setError("Template name and email subject are required.");
      return;
    }
    setSaving(true);
    setError("");
    const payload: TemplatePayload = {
      name: name.trim(),
      subject: subject.trim(),
      description,
      category,
      design: { blocks },
      html: htmlCode.trim() ? htmlCode : renderEmailHtml(blocks),
      text: htmlToPlainText(htmlCode),
      isActive,
    };
    try {
      if (templateId) {
        await api(`/api/email-templates/${templateId}`, { method: "PUT", body: payload });
      } else {
        await api("/api/email-templates", { method: "POST", body: payload });
      }
      router.push("/email/templates");
    } catch (err) {
      setSaving(false);
      setError(err instanceof ApiError ? err.message : "Could not save template");
    }
  };

  return (
    <AppShell>
      <Topbar title={templateId ? "Edit email template" : "Create email template"} showSearch={false} />
      <section className="content email-page">
        <PageHeader
          title={templateId ? "Edit email template" : "Create email template"}
          subtitle="Preview opens first. Open HTML code only when you want to edit the source."
          crumbs={[
            { label: "Email Templates", href: "/email/templates" },
            { label: templateId ? "Edit" : "Create" },
          ]}
          actions={
            <>
              <button type="button" className="btn btn-secondary dash-cta" onClick={() => router.push("/email/templates")}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary dash-cta" onClick={save} disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </button>
            </>
          }
        />
        {error ? <div className="cal-flash err">{error}</div> : null}
        {loading ? <p>Loading template…</p> : null}

        <div className="email-meta">
          <label>
            Template name <span className="required">*</span>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Welcome Email" />
          </label>
          <label>
            Email subject <span className="required">*</span>
            <input className="input" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. KYC reminder" />
          </label>
          <label>
            Status
            <select value={isActive ? "active" : "inactive"} onChange={(e) => setIsActive(e.target.value === "active")}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
          <label>
            Category
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="email-meta-wide">
            Description
            <input className="input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description" />
          </label>
        </div>

        <div className="email-toolbar">
          <button type="button" className={panel === "preview" ? "active" : ""} onClick={() => setPanel("preview")}>Preview</button>
          <button type="button" className={panel === "html" ? "active" : ""} onClick={() => setPanel("html")}>HTML code</button>
          <button type="button" className={preview === "desktop" ? "active" : ""} onClick={() => setPreview("desktop")}>Desktop</button>
          <button type="button" className={preview === "mobile" ? "active" : ""} onClick={() => setPreview("mobile")}>Mobile</button>
          <button
            type="button"
            className="danger"
            onClick={() => {
              setBlocks([]);
              setHtmlCode(renderEmailHtml([]));
            }}
          >
            Reset
          </button>
        </div>

        <div className="email-studio">
          <aside className="email-palette">
            <h3>Content blocks</h3>
            <div className="email-palette-grid">
              {BLOCK_PALETTE.map((item) => (
                <button
                  type="button"
                  key={item.type}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("block-type", item.type)}
                  onClick={() => addBlock(item.type)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </aside>
          <div className={`email-split ${panel === "preview" ? "is-preview-only" : ""}`}>
            {panel === "html" ? (
            <label className="email-source-wrap">
              <span>HTML code</span>
              <textarea
                className="email-html-input email-source"
                spellCheck={false}
                value={htmlCode}
                onChange={(e) => setHtmlCode(e.target.value)}
              />
            </label>
            ) : null}
            <div className={`email-preview-pane ${preview === "mobile" ? "is-mobile" : ""}`}>
              <span>Preview — click the paragraph and type</span>
              <iframe ref={previewRef} title="Email preview" className="email-preview" />
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
