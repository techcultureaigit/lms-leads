"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code2,
  Eraser,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Monitor,
  Redo2,
  Save,
  Smartphone,
  Strikethrough,
  Underline,
  Undo2,
  Unlink,
  X,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import Topbar from "@/components/layout/Topbar";
import PageHeader from "@/components/shared/PageHeader";
import { api, ApiError, getToken } from "@/lib/api";
import { prepareEmailImage } from "@/lib/prepareEmailImage";

const CATEGORIES = ["general", "welcome", "follow-up", "report", "announcement"];

const LEAD_VARIABLES = [
  { key: "lead_id", label: "{{lead_id}}", hint: "Lead ID (e.g. LD-A4F29B)" },
  { key: "first_name", label: "{{first_name}}", hint: "Lead contact first name" },
  { key: "contact_name", label: "{{contact_name}}", hint: "Lead contact full name" },
  { key: "company_name", label: "{{company_name}}", hint: "Lead entity / company name" },
  { key: "email", label: "{{email}}", hint: "Lead email address" },
  { key: "mobile", label: "{{mobile}}", hint: "Lead mobile number" },
  { key: "location", label: "{{location}}", hint: "Lead location" },
  { key: "products", label: "{{products}}", hint: "Lead products / services" },
  { key: "status", label: "{{status}}", hint: "Lead status" },
  { key: "lead_source", label: "{{lead_source}}", hint: "Lead source" },
  { key: "owner", label: "{{owner}}", hint: "Lead owner" },
  { key: "followup", label: "{{followup}}", hint: "Follow-up date" },
  { key: "website", label: "{{website}}", hint: "Lead website" },
];

// Header mirrors the footer: navy band, same logo (white TECH / orange CULTURE) and padding.
const HEADER_LOGO_URL = "https://res.cloudinary.com/cqjexiif/image/upload/e_make_transparent:20/f_png/v1795597539/techlogo.webp";

const FIXED_HEADER_HTML = `<tr>
            <td style="padding:26px 32px;background:#172544;border-bottom:1px solid #2b3c60;">
              <img src="${HEADER_LOGO_URL}" width="180" alt="TechCulture" style="width:180px;max-width:70%;height:auto;display:block;border:0;">
            </td>
          </tr>`;

const FIXED_FOOTER_HTML = `<tr>
            <td style="background:#172544;color:#d7deea;padding:28px 32px 20px;font-family:Arial,Helvetica,sans-serif;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
                <tr>
                  <td width="52%" valign="top" style="padding-right:16px;text-align:left;">
                    <img src="https://res.cloudinary.com/cqjexiif/image/upload/e_make_transparent:20/f_png/v1795597539/techlogo.webp" width="145" alt="TechCulture" style="width:145px;max-width:100%;height:auto;display:block;border:0;margin:0 0 10px 0;">
                    <p style="margin:0;font-size:11px;line-height:1.5;color:#9fb0cc;white-space:nowrap;font-family:Arial,Helvetica,sans-serif;">
                      Building connected digital experiences through technology.
                    </p>
                  </td>
                  <td width="48%" valign="top" style="padding-left:20px;border-left:1px solid #2b3c60;text-align:left;">
                    <p style="margin:0 0 5px;color:#ffffff;font-size:12px;font-weight:bold;letter-spacing:0.4px;font-family:Arial,Helvetica,sans-serif;">
                      TECHCULTURE AI
                    </p>
                    <p style="margin:0;font-size:11px;line-height:1.65;color:#d7deea;font-family:Arial,Helvetica,sans-serif;">
                      <strong style="color:#ffffff;">Corporate Office:</strong><br>
                      1212, 12th Floor, Kailash Building, 26 KG Marg,<br>
                      Connaught Pl&#8203;ace, New Del&#8203;hi &#8211; 110&#8203;001.
                    </p>
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin-top:18px;">
                <tr>
                  <td style="border-top:1px solid #2b3c60;padding-top:14px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
                      <tr>
                        <td align="left" valign="middle" style="font-size:12px;color:#d7deea;font-family:Arial,Helvetica,sans-serif;">
                          <a href="mailto:info@techculture.ai" style="color:#d7deea;text-decoration:none;margin-right:16px;">
                            <span style="display:inline-block;background:#22345c;color:#ff8a5b;padding:4px 7px;border-radius:6px;margin-right:6px;font-size:11px;">&#9993;</span>info@techculture.ai
                          </a>
                          <a href="tel:+919810785215" style="color:#d7deea;text-decoration:none;">
                            <span style="display:inline-block;background:#22345c;color:#ff8a5b;padding:4px 7px;border-radius:6px;margin-right:6px;font-size:11px;">&#9742;</span>+91 9810785215
                          </a>
                        </td>
                        <td align="right" valign="middle">
                          <a href="https://www.facebook.com/people/Tech-Culture/61581408442619/" target="_blank" style="display:inline-block;width:30px;height:30px;background:#22345c;border-radius:50%;text-align:center;vertical-align:middle;text-decoration:none;margin-left:6px;">
                            <img src="https://img.icons8.com/ios-filled/32/ffffff/facebook-f.png" width="14" height="14" alt="Facebook" style="display:inline-block;vertical-align:middle;margin-top:8px;border:0;">
                          </a>
                          <a href="https://www.instagram.com/techculture_technologies" target="_blank" style="display:inline-block;width:30px;height:30px;background:#22345c;border-radius:50%;text-align:center;vertical-align:middle;text-decoration:none;margin-left:6px;">
                            <img src="https://img.icons8.com/ios-filled/32/ffffff/instagram-new.png" width="15" height="15" alt="Instagram" style="display:inline-block;vertical-align:middle;margin-top:7px;border:0;">
                          </a>
                          <a href="https://www.linkedin.com/company/techculture-technologies-private-limited/" target="_blank" style="display:inline-block;width:30px;height:30px;background:#22345c;border-radius:50%;text-align:center;vertical-align:middle;text-decoration:none;margin-left:6px;">
                            <img src="https://img.icons8.com/ios-filled/32/ffffff/linkedin-2.png" width="14" height="14" alt="LinkedIn" style="display:inline-block;vertical-align:middle;margin-top:8px;border:0;">
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin-top:14px;">
                <tr>
                  <td style="border-top:1px solid #2b3c60;padding-top:10px;text-align:center;font-size:11px;color:#9fb0cc;font-family:Arial,Helvetica,sans-serif;">
                    © TechCulture. All rights reserved.
                  </td>
                </tr>
              </table>
            </td>
          </tr>`;

const DEFAULT_BODY_HTML = `<h1 style="margin:0 0 14px;font-size:22px;font-weight:700;line-height:1.3;color:#172544;">Write your heading here</h1>
<p style="margin:0 0 14px;font-size:14px;line-height:1.65;color:#5e6879;">Write your email content here. You can format text or upload images using the toolbar above.</p>`;

function normalizeBodySpacing(html: string) {
  return String(html || "")
    .replace(/<p(?![^>]*\bstyle=)(\s[^>]*)?>/gi, '<p style="margin:0 0 14px;line-height:1.65;"$1>')
    .replace(/<h1(?![^>]*\bstyle=)(\s[^>]*)?>/gi, '<h1 style="margin:0 0 14px;font-size:22px;font-weight:700;line-height:1.3;color:#172544;"$1>')
    .replace(/<h2(?![^>]*\bstyle=)(\s[^>]*)?>/gi, '<h2 style="margin:18px 0 10px;font-size:18px;font-weight:700;line-height:1.35;color:#172544;"$1>')
    .replace(/<h3(?![^>]*\bstyle=)(\s[^>]*)?>/gi, '<h3 style="margin:16px 0 8px;font-size:16px;font-weight:700;line-height:1.4;color:#172544;"$1>')
    .replace(/<ul(?![^>]*\bstyle=)(\s[^>]*)?>/gi, '<ul style="margin:0 0 14px;padding-left:24px;"$1>')
    .replace(/<ol(?![^>]*\bstyle=)(\s[^>]*)?>/gi, '<ol style="margin:0 0 14px;padding-left:24px;"$1>')
    .replace(/<li(?![^>]*\bstyle=)(\s[^>]*)?>/gi, '<li style="margin:0 0 6px;line-height:1.6;"$1>');
}

function buildFullEmailHtml(title: string, bodyHtml: string) {
  const safeBody = normalizeBodySpacing(bodyHtml);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title.replace(/</g, "&lt;") || "TechCulture"}</title>
</head>
<body style="margin:0;padding:0;background:#f2f4f8;font-family:Arial,Helvetica,sans-serif;color:#263044;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;background:#f2f4f8;border-collapse:collapse;">
    <tr>
      <td align="center" style="padding:28px 12px;">
        <table role="presentation" width="700" cellpadding="0" cellspacing="0" style="width:100%;max-width:700px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border-collapse:collapse;">
          ${FIXED_HEADER_HTML}
          <tr>
            <td style="padding:28px 32px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.65;color:#263044;">
              ${safeBody}
            </td>
          </tr>
          ${FIXED_FOOTER_HTML}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function htmlToPlainText(html: string) {
  return String(html || "")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

type ImageAlign = "left" | "center" | "right";
type ImagePanelState = { src: string; width: number; align: ImageAlign };

const IMAGE_MIN_WIDTH = 60;
// Email content width: 700px card minus 32px padding on each side.
const IMAGE_MAX_WIDTH = 636;
const IMAGE_DEFAULT_WIDTH = 560;
const IMAGE_PRESETS = [
  { label: "Small", width: 240 },
  { label: "Medium", width: 400 },
  { label: "Large", width: 560 },
  { label: "Full", width: 636 },
];

function clampImageWidth(value: number) {
  if (!Number.isFinite(value)) return IMAGE_DEFAULT_WIDTH;
  return Math.min(IMAGE_MAX_WIDTH, Math.max(IMAGE_MIN_WIDTH, Math.round(value)));
}

// Image is a block with margins, so left/center/right works without wrapper tables.
function imageStyle(width: number, align: ImageAlign) {
  const marginLeft = align === "left" ? "0" : "auto";
  const marginRight = align === "right" ? "0" : "auto";
  return `display:block;width:${width}px;max-width:100%;height:auto;border:0;border-radius:8px;margin-top:16px;margin-bottom:16px;margin-left:${marginLeft};margin-right:${marginRight};`;
}

function readImageWidth(img: HTMLImageElement) {
  const fromStyle = img.style.width.match(/^([\d.]+)px$/);
  if (fromStyle) return clampImageWidth(parseFloat(fromStyle[1]));
  return clampImageWidth(parseInt(img.getAttribute("width") || "", 10));
}

function readImageAlign(img: HTMLImageElement): ImageAlign {
  const left = img.style.marginLeft;
  const right = img.style.marginRight;
  if (left === "auto" && right === "auto") return "center";
  if (left === "auto") return "right";
  return "left";
}

export default function FixedLayoutEmailEditor() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [isActive, setIsActive] = useState(true);
  const [view, setView] = useState<"desktop" | "mobile" | "html">("desktop");
  const [bodyHtml, setBodyHtml] = useState(DEFAULT_BODY_HTML);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileRef = useRef<HTMLInputElement>(null);
  const selectedImgRef = useRef<HTMLImageElement | null>(null);
  const initialImageRef = useRef<ImagePanelState | null>(null);
  const [imagePanel, setImagePanel] = useState<ImagePanelState | null>(null);
  const [replaceUrl, setReplaceUrl] = useState("");
  const [panelError, setPanelError] = useState("");

  useEffect(() => {
    const node = editorRef.current;
    if (!node || view === "html") return;
    if (document.activeElement === node) return;
    if (node.innerHTML !== bodyHtml) {
      node.innerHTML = bodyHtml;
    }
  }, [bodyHtml, view]);

  const syncBody = () => {
    if (editorRef.current) {
      setBodyHtml(editorRef.current.innerHTML);
    }
  };

  const exec = (cmd: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, value);
    syncBody();
  };

  const insertVariable = (token: string) => {
    if (view === "html") {
      setBodyHtml((prev) => `${prev}${token}`);
      return;
    }
    editorRef.current?.focus();
    document.execCommand("insertText", false, token);
    syncBody();
  };

  const uploadImageFile = async (original: File): Promise<string> => {
    const file = await prepareEmailImage(original);
    const form = new FormData();
    form.append("image", file);
    const token = getToken();
    const res = await fetch("/api/email-templates/upload-image", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || "Image upload failed");
    const src = data.url || data.path;
    if (!src) throw new Error("No image URL returned");
    return String(src);
  };

  const applyImageToDom = (img: HTMLImageElement, next: ImagePanelState) => {
    const width = clampImageWidth(next.width);
    img.setAttribute("src", next.src);
    img.setAttribute("width", String(width));
    img.setAttribute("style", imageStyle(width, next.align));
    syncBody();
  };

  const openImagePanel = (img: HTMLImageElement) => {
    selectedImgRef.current = img;
    setPanelError("");
    setReplaceUrl("");
    const snapshot: ImagePanelState = {
      src: img.getAttribute("src") || "",
      width: readImageWidth(img),
      align: readImageAlign(img),
    };
    initialImageRef.current = snapshot;
    setImagePanel(snapshot);
  };

  const closeImagePanel = () => {
    selectedImgRef.current = null;
    initialImageRef.current = null;
    setImagePanel(null);
    setPanelError("");
  };

  const cancelImagePanel = () => {
    const img = selectedImgRef.current;
    const initial = initialImageRef.current;
    if (img && img.isConnected && initial) {
      applyImageToDom(img, initial);
    }
    closeImagePanel();
  };

  const updateImagePanel = (patch: Partial<ImagePanelState>) => {
    setImagePanel((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      const img = selectedImgRef.current;
      if (img && img.isConnected) {
        applyImageToDom(img, next);
      }
      return next;
    });
  };

  const setPanelWidth = (width: number) => {
    updateImagePanel({ width });
  };

  const applyImagePanel = () => {
    const img = selectedImgRef.current;
    if (!imagePanel || !img || !img.isConnected) {
      setPanelError("This image is no longer in the editor. Click it again.");
      return;
    }
    applyImageToDom(img, imagePanel);
    closeImagePanel();
  };

  const replaceWithUrl = () => {
    const url = replaceUrl.trim();
    if (!/^https?:\/\//i.test(url)) {
      setPanelError("Enter a valid image URL starting with https://");
      return;
    }
    setPanelError("");
    updateImagePanel({ src: url });
    setReplaceUrl("");
  };

  const replaceWithFile = async (file: File) => {
    setUploading(true);
    setPanelError("");
    try {
      const src = await uploadImageFile(file);
      updateImagePanel({ src });
    } catch (err) {
      setPanelError(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    setError("");
    try {
      const src = await uploadImageFile(file);
      const imgTag = `<img src="${src}" width="${IMAGE_DEFAULT_WIDTH}" alt="" style="${imageStyle(IMAGE_DEFAULT_WIDTH, "left")}">`;
      if (view === "html") {
        setBodyHtml((prev) => `${prev}\n<p style="margin:12px 0;">${imgTag}</p>`);
        return;
      }
      const editor = editorRef.current;
      if (!editor) return;
      editor.focus();
      document.execCommand("insertHTML", false, imgTag);
      syncBody();
      // Open the edit panel for the image that was just inserted.
      const inserted = Array.from(editor.querySelectorAll("img"))
        .filter((img) => img.getAttribute("src") === src)
        .pop();
      if (inserted) openImagePanel(inserted);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !subject.trim()) {
      setError("Template name and email subject are required.");
      return;
    }
    setSaving(true);
    setError("");
    const currentBody = view !== "html" && editorRef.current ? editorRef.current.innerHTML : bodyHtml;
    const fullHtml = buildFullEmailHtml(subject.trim(), currentBody);
    try {
      await api("/api/email-templates", {
        method: "POST",
        body: {
          name: name.trim(),
          subject: subject.trim(),
          description: description.trim(),
          category,
          isActive,
          design: { fixedLayout: true, bodyHtml: currentBody },
          html: fullHtml,
          text: htmlToPlainText(currentBody),
        },
      });
      router.push("/email/templates");
    } catch (err) {
      setSaving(false);
      setError(err instanceof ApiError ? err.message : "Could not save template");
    }
  };

  return (
    <AppShell>
      <Topbar title="Create email template" showSearch={false} />
      <section className="content email-page">
        <style>{`
          .fixed-email-body h1 { font-size: 22px; font-weight: 700; line-height: 1.3; margin: 0 0 14px; color: #172544; }
          .fixed-email-body h2 { font-size: 18px; font-weight: 700; line-height: 1.35; margin: 18px 0 10px; color: #172544; }
          .fixed-email-body h3 { font-size: 16px; font-weight: 700; line-height: 1.4; margin: 16px 0 8px; color: #172544; }
          .fixed-email-body p { margin: 0 0 14px; line-height: 1.65; }
          .fixed-email-body div { margin: 0 0 10px; line-height: 1.65; }
          .fixed-email-body ul, .fixed-email-body ol { margin: 0 0 14px; padding-left: 24px; }
          .fixed-email-body ul { list-style: disc; }
          .fixed-email-body ol { list-style: decimal; }
          .fixed-email-body li { margin: 0 0 6px; line-height: 1.6; }
          .fixed-email-body > *:last-child { margin-bottom: 0; }
          .fixed-email-body img { cursor: pointer; }
          .fixed-email-body img:hover { outline: 2px dashed #93c5fd; outline-offset: 3px; }
          .fixed-email-footer td { padding: 0; border-bottom: 0; white-space: normal; }
          .fixed-email-footer tbody tr,
          .fixed-email-footer tbody tr:hover { background: transparent; }
        `}</style>
        <PageHeader
          title="Create email template"
          subtitle="Header and footer are fixed. Write your content or upload images in the middle."
          crumbs={[
            { label: "Email Templates", href: "/email/templates" },
            { label: "Create" },
          ]}
          actions={
            <>
              <button
                type="button"
                className="btn btn-secondary dash-cta"
                onClick={() => router.push("/email/templates")}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary dash-cta"
                onClick={handleSave}
                disabled={saving}
              >
                <Save size={15} />
                {saving ? "Saving…" : "Save"}
              </button>
            </>
          }
        />

        {error ? <div className="cal-flash err">{error}</div> : null}

        <div className="email-meta">
          <label>
            Template name <span className="required">*</span>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. KYC Reminder"
            />
          </label>
          <label>
            Email subject <span className="required">*</span>
            <input
              className="input"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Fastest Client Onboarding Solution"
            />
          </label>
          <label>
            Status
            <select
              value={isActive ? "active" : "inactive"}
              onChange={(e) => setIsActive(e.target.value === "active")}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
          <label>
            Category
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="email-meta-wide">
            Description
            <input
              className="input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description"
            />
          </label>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          {/* Lead variables bar */}
          <div className="flex flex-wrap items-center gap-1.5 px-4 py-2.5 border-b border-slate-200 bg-white">
            <span className="mr-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Lead variables:
            </span>
            {LEAD_VARIABLES.map((v) => (
              <button
                key={v.key}
                type="button"
                title={v.hint}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => insertVariable(v.label)}
                className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-[11px] font-medium text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
              >
                {v.label}
              </button>
            ))}
          </div>

          {/* Top toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-slate-200 bg-slate-50">
            <div className="flex flex-wrap items-center gap-1.5">
              <button type="button" title="Undo" onClick={() => exec("undo")} className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-slate-200 bg-white hover:bg-slate-100 text-slate-700">
                <Undo2 size={15} />
              </button>
              <button type="button" title="Redo" onClick={() => exec("redo")} className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-slate-200 bg-white hover:bg-slate-100 text-slate-700">
                <Redo2 size={15} />
              </button>

              <span className="w-px h-5 bg-slate-200 mx-1" />

              <select
                aria-label="Block format"
                defaultValue="P"
                onChange={(e) => exec("formatBlock", e.target.value)}
                className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700"
              >
                <option value="P">Normal</option>
                <option value="H1">Heading 1</option>
                <option value="H2">Heading 2</option>
                <option value="H3">Heading 3</option>
              </select>

              <select
                aria-label="Font family"
                defaultValue="Arial"
                onChange={(e) => exec("fontName", e.target.value)}
                className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700"
              >
                <option value="Arial">Arial</option>
                <option value="Georgia">Georgia</option>
                <option value="Verdana">Verdana</option>
                <option value="Tahoma">Tahoma</option>
                <option value="Times New Roman">Times New Roman</option>
              </select>

              <select
                aria-label="Font size"
                defaultValue="3"
                onChange={(e) => exec("fontSize", e.target.value)}
                className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700"
              >
                <option value="2">12px</option>
                <option value="3">14px</option>
                <option value="4">16px</option>
                <option value="5">20px</option>
                <option value="6">24px</option>
              </select>

              <span className="w-px h-5 bg-slate-200 mx-1" />

              <button type="button" title="Bold" onClick={() => exec("bold")} className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-slate-200 bg-white hover:bg-slate-100 text-slate-700">
                <Bold size={15} />
              </button>
              <button type="button" title="Italic" onClick={() => exec("italic")} className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-slate-200 bg-white hover:bg-slate-100 text-slate-700">
                <Italic size={15} />
              </button>
              <button type="button" title="Underline" onClick={() => exec("underline")} className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-slate-200 bg-white hover:bg-slate-100 text-slate-700">
                <Underline size={15} />
              </button>
              <button type="button" title="Strikethrough" onClick={() => exec("strikeThrough")} className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-slate-200 bg-white hover:bg-slate-100 text-slate-700">
                <Strikethrough size={15} />
              </button>

              <label title="Text color" className="h-8 px-1.5 inline-flex items-center rounded-md border border-slate-200 bg-white cursor-pointer">
                <input type="color" defaultValue="#172544" onChange={(e) => exec("foreColor", e.target.value)} className="w-5 h-5 border-0 bg-transparent cursor-pointer" />
              </label>
              <label title="Highlight color" className="h-8 px-1.5 inline-flex items-center rounded-md border border-slate-200 bg-white cursor-pointer">
                <input type="color" defaultValue="#fef08a" onChange={(e) => exec("hiliteColor", e.target.value)} className="w-5 h-5 border-0 bg-transparent cursor-pointer" />
              </label>

              <span className="w-px h-5 bg-slate-200 mx-1" />

              <button type="button" title="Align left" onClick={() => exec("justifyLeft")} className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-slate-200 bg-white hover:bg-slate-100 text-slate-700">
                <AlignLeft size={15} />
              </button>
              <button type="button" title="Align center" onClick={() => exec("justifyCenter")} className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-slate-200 bg-white hover:bg-slate-100 text-slate-700">
                <AlignCenter size={15} />
              </button>
              <button type="button" title="Align right" onClick={() => exec("justifyRight")} className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-slate-200 bg-white hover:bg-slate-100 text-slate-700">
                <AlignRight size={15} />
              </button>
              <button type="button" title="Justify" onClick={() => exec("justifyFull")} className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-slate-200 bg-white hover:bg-slate-100 text-slate-700">
                <AlignJustify size={15} />
              </button>

              <span className="w-px h-5 bg-slate-200 mx-1" />

              <button type="button" title="Bullet list" onClick={() => exec("insertUnorderedList")} className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-slate-200 bg-white hover:bg-slate-100 text-slate-700">
                <List size={15} />
              </button>
              <button type="button" title="Numbered list" onClick={() => exec("insertOrderedList")} className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-slate-200 bg-white hover:bg-slate-100 text-slate-700">
                <ListOrdered size={15} />
              </button>

              <span className="w-px h-5 bg-slate-200 mx-1" />

              <button
                type="button"
                title="Insert link"
                onClick={() => {
                  const url = window.prompt("Enter link URL (https://...)");
                  if (url) exec("createLink", url);
                }}
                className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-slate-200 bg-white hover:bg-slate-100 text-slate-700"
              >
                <Link2 size={15} />
              </button>
              <button type="button" title="Remove link" onClick={() => exec("unlink")} className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-slate-200 bg-white hover:bg-slate-100 text-slate-700">
                <Unlink size={15} />
              </button>

              <button
                type="button"
                title="Upload image"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="h-8 px-2.5 inline-flex items-center gap-1.5 rounded-md border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold"
              >
                <ImagePlus size={14} />
                {uploading ? "Uploading…" : "Upload"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (file) handleImageUpload(file);
                }}
              />

              <button type="button" title="Clear formatting" onClick={() => exec("removeFormat")} className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-slate-200 bg-white hover:bg-slate-100 text-slate-700">
                <Eraser size={15} />
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setView("desktop")}
                className={`h-8 px-2.5 inline-flex items-center gap-1.5 rounded-md border text-xs font-semibold ${
                  view === "desktop" ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                <Monitor size={14} /> Desktop
              </button>
              <button
                type="button"
                onClick={() => setView("mobile")}
                className={`h-8 px-2.5 inline-flex items-center gap-1.5 rounded-md border text-xs font-semibold ${
                  view === "mobile" ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                <Smartphone size={14} /> Mobile
              </button>
              <button
                type="button"
                onClick={() => setView(view === "html" ? "desktop" : "html")}
                className={`h-8 px-2.5 inline-flex items-center gap-1.5 rounded-md border text-xs font-semibold ${
                  view === "html" ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                <Code2 size={14} /> HTML
              </button>
            </div>
          </div>

          {/* Email canvas with fixed Header + editable Middle + fixed Footer */}
          <div className="bg-[#f2f4f8] px-4 py-8 sm:px-8 sm:py-10 flex justify-center">
            <div
              className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 w-full transition-all"
              style={{ maxWidth: view === "mobile" ? 390 : 700 }}
            >
              {/* Fixed Header */}
              <div className="px-8 py-6 bg-[#172544] border-b border-[#2b3c60] select-none">
                <img
                  src={HEADER_LOGO_URL}
                  width={180}
                  alt="TechCulture"
                  style={{ width: 180, maxWidth: "70%", height: "auto", display: "block" }}
                />
              </div>

              {/* Editable Middle */}
              {view === "html" ? (
                <div className="p-5 bg-slate-900">
                  <textarea
                    className="w-full min-h-[300px] bg-slate-900 text-slate-100 font-mono text-xs border-0 outline-none resize-y"
                    style={{ border: 0, background: "#0f172a", color: "#f1f5f9", padding: "8px 4px" }}
                    spellCheck={false}
                    value={bodyHtml}
                    onChange={(e) => setBodyHtml(e.target.value)}
                  />
                </div>
              ) : (
                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={syncBody}
                  onClick={(e) => {
                    if (e.target instanceof HTMLImageElement) openImagePanel(e.target);
                  }}
                  className="fixed-email-body px-8 py-7 min-h-[320px] outline-none text-[#263044] focus:bg-blue-50/20"
                  style={{ fontFamily: "Arial, Helvetica, sans-serif", fontSize: 14, lineHeight: 1.65 }}
                />
              )}

              {/* Fixed Footer */}
              <div
                className="fixed-email-footer select-none"
                dangerouslySetInnerHTML={{
                  __html: `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">${FIXED_FOOTER_HTML}</table>`,
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {imagePanel ? (
        <aside className="fixed top-0 right-0 z-50 h-full w-[340px] max-w-full bg-white shadow-2xl border-l border-slate-200 flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
            <h3 className="text-base font-semibold text-slate-900">Edit image</h3>
            <button
              type="button"
              title="Close"
              onClick={cancelImagePanel}
              className="h-8 w-8 inline-flex items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
            <p className="text-xs leading-relaxed text-slate-500">
              Only the <strong>selected image</strong> moves. Your email layout and text stay fixed. Click <strong>Apply</strong> when done.
            </p>

            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 flex flex-col gap-2">
              <div
                className={`flex w-full ${
                  imagePanel.align === "left" ? "justify-start" : imagePanel.align === "right" ? "justify-end" : "justify-center"
                }`}
              >
                {imagePanel.src ? (
                  <img src={imagePanel.src} alt="" className="max-h-28 w-auto rounded" />
                ) : null}
              </div>
              <span className="self-center text-xs font-semibold text-blue-700 bg-blue-100 rounded px-2 py-0.5">
                Image - {imagePanel.width}px
              </span>
            </div>

            <section className="space-y-2">
              <h4 className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">Replace image</h4>
              <div className="flex gap-2">
                <input
                  className="input flex-1 h-9 text-xs"
                  placeholder="https://example.com/image.png"
                  value={replaceUrl}
                  onChange={(e) => setReplaceUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      replaceWithUrl();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={replaceWithUrl}
                  className="h-9 px-3 rounded-md border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Use
                </button>
              </div>
              <button
                type="button"
                disabled={uploading}
                onClick={() => replaceFileRef.current?.click()}
                className="text-xs font-semibold text-blue-700 hover:underline disabled:opacity-50"
              >
                {uploading ? "Uploading…" : "Upload new image"}
              </button>
              <input
                ref={replaceFileRef}
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (file) replaceWithFile(file);
                }}
              />
            </section>

            <section className="space-y-2">
              <h4 className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">Size (width)</h4>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPanelWidth(clampImageWidth(imagePanel.width - 10))}
                  className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                >
                  −
                </button>
                <input
                  type="range"
                  min={IMAGE_MIN_WIDTH}
                  max={IMAGE_MAX_WIDTH}
                  value={clampImageWidth(imagePanel.width)}
                  onChange={(e) => setPanelWidth(Number(e.target.value))}
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={() => setPanelWidth(clampImageWidth(imagePanel.width + 10))}
                  className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                >
                  +
                </button>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={IMAGE_MIN_WIDTH}
                    max={IMAGE_MAX_WIDTH}
                    value={imagePanel.width}
                    onChange={(e) => setPanelWidth(Number(e.target.value))}
                    className="input h-8 w-20 text-xs"
                  />
                  <span className="text-xs text-slate-500">px</span>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {IMAGE_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setPanelWidth(preset.width)}
                    className={`h-8 rounded-md border text-xs font-semibold ${
                      clampImageWidth(imagePanel.width) === preset.width
                        ? "border-blue-300 bg-blue-50 text-blue-700"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-500">
                Between {IMAGE_MIN_WIDTH} and {IMAGE_MAX_WIDTH}px. {IMAGE_MAX_WIDTH}px is the full email content width.
              </p>
            </section>

            <section className="space-y-2">
              <h4 className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">Position</h4>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { value: "left", label: "Left", Icon: AlignLeft },
                    { value: "center", label: "Center", Icon: AlignCenter },
                    { value: "right", label: "Right", Icon: AlignRight },
                  ] as const
                ).map(({ value, label, Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => updateImagePanel({ align: value })}
                    className={`h-9 inline-flex items-center justify-center gap-1.5 rounded-md border text-xs font-semibold ${
                      imagePanel.align === value
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <Icon size={14} />
                    {label}
                  </button>
                ))}
              </div>
            </section>
          </div>

          <div className="border-t border-slate-200 px-5 py-4 space-y-2">
            {panelError ? <p className="text-xs text-red-600">{panelError}</p> : null}
            <div className="flex justify-end gap-2">
              <button type="button" className="btn btn-secondary dash-cta" onClick={cancelImagePanel}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary dash-cta" onClick={applyImagePanel}>
                Apply
              </button>
            </div>
          </div>
        </aside>
      ) : null}
    </AppShell>
  );
}
