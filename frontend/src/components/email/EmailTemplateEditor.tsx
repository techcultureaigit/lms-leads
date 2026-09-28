"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import Topbar from "@/components/layout/Topbar";
import PageHeader from "@/components/shared/PageHeader";
import { api, ApiError, getToken } from "@/lib/api";
import {
  BLOCK_PALETTE,
  EMAIL_VARIABLES,
  EmailBlock,
  EmailBlockType,
  newBlock,
  renderEmailHtml,
  renderEmailText,
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
  const [selectedId, setSelectedId] = useState("");
  const [mode, setMode] = useState<"desktop" | "mobile" | "preview">("desktop");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(Boolean(templateId));
  const [htmlCode, setHtmlCode] = useState(() => renderEmailHtml([]));
  const keepLoadedHtml = useRef(false);

  useEffect(() => {
    if (keepLoadedHtml.current) return;
    setHtmlCode(renderEmailHtml(blocks));
  }, [blocks]);

  useEffect(() => {
    if (!templateId) return;
    api<{ template: TemplatePayload & { id: string } }>(`/api/email-templates/${templateId}`)
      .then((res) => {
        const nextBlocks = res.template.design?.blocks || [];
        keepLoadedHtml.current = true;
        setName(res.template.name);
        setSubject(res.template.subject);
        setDescription(res.template.description || "");
        setCategory(res.template.category || "general");
        setBlocks(nextBlocks);
        setHtmlCode(res.template.html || renderEmailHtml(nextBlocks));
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Could not load template");
      })
      .finally(() => setLoading(false));
  }, [templateId]);

  const selected = blocks.find((block) => block.id === selectedId);

  const addBlock = (type: EmailBlockType) => {
    keepLoadedHtml.current = false;
    const block = newBlock(type);
    setBlocks((prev) => [...prev, block]);
    setSelectedId(block.id);
    setMode("desktop");
  };

  const updateSelected = (key: string, value: string) => {
    keepLoadedHtml.current = false;
    setBlocks((prev) =>
      prev.map((block) =>
        block.id === selectedId
          ? { ...block, props: { ...block.props, [key]: value } }
          : block,
      ),
    );
  };

  const insertVariable = (token: string) => {
    const snippet = `{{${token}}}`;
    if (selected && (selected.props.text !== undefined || selected.type === "paragraph" || selected.type === "heading" || selected.type === "header" || selected.type === "footer")) {
      updateSelected("text", `${selected.props.text || ""}${snippet}`);
      return;
    }
    setSubject((prev) => `${prev}${snippet}`);
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
      text: renderEmailText(blocks),
      isActive: true,
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

  const uploadImage = async (file: File) => {
    const body = new FormData();
    body.append("image", file);
    const token = getToken();
    const res = await fetch("/api/email-templates/upload-image", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || "Upload failed");
    return (data.path || data.url) as string;
  };

  return (
    <AppShell>
      <Topbar title={templateId ? "Edit email template" : "Create email template"} showSearch={false} />
      <section className="content email-page">
        <PageHeader
          title={templateId ? "Edit email template" : "Create email template"}
          subtitle="Design the email, then save the layout and HTML."
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
            <input className="input" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Welcome to {{courseName}}" />
          </label>
          <label>
            Category
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            Description
            <input className="input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description" />
          </label>
        </div>

        <div className="email-toolbar">
          <button type="button" className={mode === "desktop" ? "active" : ""} onClick={() => setMode("desktop")}>Desktop</button>
          <button type="button" className={mode === "mobile" ? "active" : ""} onClick={() => setMode("mobile")}>Mobile</button>
          <button type="button" className={mode === "preview" ? "active" : ""} onClick={() => setMode("preview")}>Preview</button>
          <button type="button" className="danger" onClick={() => { keepLoadedHtml.current = false; setBlocks([]); setSelectedId(""); }}>Reset</button>
        </div>

        <div className="email-studio">
          <div className={`email-canvas ${mode === "mobile" ? "is-mobile" : ""}`}>
            {mode === "preview" ? (
              <iframe title="Email preview" className="email-preview" srcDoc={renderEmailHtml(blocks)} />
            ) : (
              <div
                className="email-drop"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const type = e.dataTransfer.getData("block-type") as EmailBlockType;
                  if (type) addBlock(type);
                }}
              >
                {!blocks.length ? (
                  <div className="email-empty">
                    <strong>No content here</strong>
                    <p>Drag a block from the right panel to start the email.</p>
                  </div>
                ) : (
                  blocks.map((block) => (
                    <button
                      type="button"
                      key={block.id}
                      className={`email-canvas-block ${selectedId === block.id ? "is-selected" : ""}`}
                      onClick={() => setSelectedId(block.id)}
                    >
                      <small>{block.type}</small>
                      <span>{block.props.text || block.props.left || block.props.links || block.props.alt || "Block"}</span>
                    </button>
                  ))
                )}
              </div>
            )}
            {selected && mode !== "preview" ? (
              <div className="email-block-editor">
                <div className="email-block-editor-head">
                  <strong>Edit {selected.type}</strong>
                  <button
                    type="button"
                    onClick={() => {
                      keepLoadedHtml.current = false;
                      setBlocks((prev) => prev.filter((block) => block.id !== selected.id));
                      setSelectedId("");
                    }}
                  >
                    Remove
                  </button>
                </div>
                {Object.keys(selected.props).map((key) => (
                  <label key={key}>
                    {key}
                    {key === "text" || key === "html" || key === "left" || key === "right" ? (
                      <textarea value={selected.props[key]} onChange={(e) => updateSelected(key, e.target.value)} />
                    ) : (
                      <input className="input" value={selected.props[key]} onChange={(e) => updateSelected(key, e.target.value)} />
                    )}
                  </label>
                ))}
                {(selected.type === "image" || selected.type === "logo") ? (
                  <label className="email-upload">
                    Upload image
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/gif,image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        uploadImage(file)
                          .then((src) => updateSelected("src", src))
                          .catch((err) => setError(err instanceof Error ? err.message : "Upload failed"));
                      }}
                    />
                  </label>
                ) : null}
              </div>
            ) : null}
          </div>

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
            <h3>Variables</h3>
            <div className="email-vars">
              {EMAIL_VARIABLES.map((token) => (
                <button type="button" key={token} onClick={() => insertVariable(token)}>
                  {`{{${token}}}`}
                </button>
              ))}
            </div>
          </aside>
        </div>

        <label className="email-html-code">
          <span>HTML code</span>
          <textarea
            className="email-html-input"
            spellCheck={false}
            value={htmlCode}
            onChange={(e) => {
              keepLoadedHtml.current = true;
              setHtmlCode(e.target.value);
            }}
          />
        </label>
      </section>
    </AppShell>
  );
}
