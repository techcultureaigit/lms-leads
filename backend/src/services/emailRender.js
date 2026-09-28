function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function blockHtml(block) {
  const props = block?.props || {};
  switch (block?.type) {
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
      return `<tr><td style="padding:12px 24px;text-align:center;font-family:Arial,sans-serif;font-size:13px;">${escapeHtml(props.links || "Home · Courses · Contact")}</td></tr>`;
    case "html":
      return `<tr><td style="padding:8px 24px;">${props.html || ""}</td></tr>`;
    default:
      return "";
  }
}

export function renderDesign(design) {
  const blocks = Array.isArray(design?.blocks) ? design.blocks : [];
  const rows = blocks.map(blockHtml).join("");
  const html = `<!DOCTYPE html><html><body style="margin:0;background:#f1f5f9;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;"><tr><td align="center" style="padding:24px 12px;"><table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#fff;border-radius:12px;overflow:hidden;">${rows}</table></td></tr></table></body></html>`;
  const text = blocks
    .map((block) => {
      const props = block?.props || {};
      return props.text || props.left || props.html || props.links || "";
    })
    .filter(Boolean)
    .join("\n");
  return { html, text };
}

export function applyPlaceholders(input, student) {
  const now = new Date();
  const map = {
    name: student?.name || "",
    email: student?.email || "",
    studentId: student?.studentId || "",
    mobile: student?.mobile || "",
    courseName: student?.courseName || "",
    batch: student?.batch || "",
    enrollmentDate: student?.enrollmentDate || "",
    instructor: student?.instructor || "",
    company: student?.company || "",
    role: student?.role || "",
    date: now.toLocaleDateString("en-IN"),
    year: String(now.getFullYear()),
  };
  return String(input || "").replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_match, key) =>
    Object.prototype.hasOwnProperty.call(map, key) ? map[key] : "",
  );
}
