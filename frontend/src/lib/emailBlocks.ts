export type EmailBlockType =
  | "header"
  | "footer"
  | "columns"
  | "button"
  | "divider"
  | "heading"
  | "paragraph"
  | "image"
  | "logo"
  | "social"
  | "menu"
  | "html";

export type EmailBlock = {
  id: string;
  type: EmailBlockType;
  props: Record<string, string>;
};

export const EMAIL_VARIABLES = [
  "name",
  "email",
  "studentId",
  "mobile",
  "courseName",
  "batch",
  "enrollmentDate",
  "instructor",
  "company",
  "role",
  "date",
  "year",
] as const;

export const BLOCK_PALETTE: { type: EmailBlockType; label: string }[] = [
  { type: "header", label: "Header" },
  { type: "footer", label: "Footer" },
  { type: "columns", label: "Columns" },
  { type: "button", label: "Button" },
  { type: "divider", label: "Divider" },
  { type: "heading", label: "Heading" },
  { type: "paragraph", label: "Paragraph" },
  { type: "image", label: "Image" },
  { type: "logo", label: "Logo" },
  { type: "social", label: "Social" },
  { type: "menu", label: "Menu" },
  { type: "html", label: "HTML" },
];

export function newBlock(type: EmailBlockType): EmailBlock {
  const id = `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const defaults: Record<EmailBlockType, Record<string, string>> = {
    header: { text: "Hello {{name}}" },
    footer: { text: "{{company}} · {{year}}" },
    columns: { left: "Course: {{courseName}}", right: "Batch: {{batch}}" },
    button: { text: "View course", href: "#" },
    divider: {},
    heading: { text: "Welcome {{name}}" },
    paragraph: {
      text: "Hi {{name}}, your enrollment for {{courseName}} starts on {{enrollmentDate}}.",
    },
    image: { src: "", alt: "Image" },
    logo: { src: "", alt: "Logo" },
    social: { facebook: "#", instagram: "#", linkedin: "#" },
    menu: { links: "Courses · Batch · Contact" },
    html: { html: "<p>Custom HTML</p>" },
  };
  return { id, type, props: defaults[type] };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function blockHtml(block: EmailBlock) {
  const props = block.props || {};
  switch (block.type) {
    case "header":
      return `<tr><td style="padding:24px;background:#0f172a;color:#fff;font-family:Arial,sans-serif;font-size:20px;font-weight:700;">${escapeHtml(props.text || "Header")}</td></tr>`;
    case "footer":
      return `<tr><td style="padding:16px 24px;background:#f8fafc;color:#64748b;font-family:Arial,sans-serif;font-size:12px;text-align:center;">${escapeHtml(props.text || "Footer")}</td></tr>`;
    case "heading":
      return `<tr><td style="padding:16px 24px 4px;font-family:Arial,sans-serif;font-size:22px;font-weight:700;color:#0f172a;">${escapeHtml(props.text || "Heading")}</td></tr>`;
    case "paragraph":
      return `<tr><td style="padding:8px 24px;font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#334155;">${escapeHtml(props.text || "").replace(/\n/g, "<br>")}</td></tr>`;
    case "button":
      return `<tr><td style="padding:16px 24px;"><a href="${escapeHtml(props.href || "#")}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:12px 18px;border-radius:8px;font-family:Arial,sans-serif;font-weight:700;">${escapeHtml(props.text || "Button")}</a></td></tr>`;
    case "divider":
      return `<tr><td style="padding:8px 24px;"><hr style="border:0;border-top:1px solid #e2e8f0;"></td></tr>`;
    case "image":
    case "logo":
      return `<tr><td style="padding:12px 24px;${block.type === "logo" ? "text-align:center;" : ""}">${props.src ? `<img src="${escapeHtml(props.src)}" alt="${escapeHtml(props.alt || "")}" style="max-width:100%;height:auto;${block.type === "logo" ? "max-height:64px;" : ""}">` : ""}</td></tr>`;
    case "columns":
      return `<tr><td style="padding:8px 24px;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td width="50%" valign="top" style="padding-right:8px;font-family:Arial,sans-serif;font-size:14px;color:#334155;">${escapeHtml(props.left || "")}</td><td width="50%" valign="top" style="padding-left:8px;font-family:Arial,sans-serif;font-size:14px;color:#334155;">${escapeHtml(props.right || "")}</td></tr></table></td></tr>`;
    case "social":
      return `<tr><td style="padding:12px 24px;text-align:center;font-family:Arial,sans-serif;font-size:13px;"><a href="${escapeHtml(props.facebook || "#")}">Facebook</a> &nbsp; <a href="${escapeHtml(props.instagram || "#")}">Instagram</a> &nbsp; <a href="${escapeHtml(props.linkedin || "#")}">LinkedIn</a></td></tr>`;
    case "menu":
      return `<tr><td style="padding:12px 24px;text-align:center;font-family:Arial,sans-serif;font-size:13px;">${escapeHtml(props.links || "")}</td></tr>`;
    case "html":
      return `<tr><td style="padding:8px 24px;">${props.html || ""}</td></tr>`;
    default:
      return "";
  }
}

export function renderEmailHtml(blocks: EmailBlock[]) {
  const rows = blocks.map(blockHtml).join("");
  return `<!DOCTYPE html><html><body style="margin:0;background:#f1f5f9;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;"><tr><td align="center" style="padding:24px 12px;"><table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#fff;border-radius:12px;overflow:hidden;">${rows}</table></td></tr></table></body></html>`;
}

export function renderEmailText(blocks: EmailBlock[]) {
  return blocks
    .map((block) => block.props.text || block.props.left || block.props.html || block.props.links || "")
    .filter(Boolean)
    .join("\n");
}
