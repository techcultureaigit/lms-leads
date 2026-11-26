/**
 * Build an isolated HTML document for email preview iframes.
 * Never inject email CSS into the parent document — that leaks into the admin UI.
 */
export function buildEmailPreviewSrcDoc(
  html: string,
  options?: { mobile?: boolean }
): string {
  const trimmed = String(html || "").trim();
  const mobile = Boolean(options?.mobile);

  const mobileCss = mobile
    ? `
    html { -webkit-text-size-adjust: 100% !important; -ms-text-size-adjust: 100% !important; }
    img { max-width: 100% !important; height: auto !important; }
    table.app-download-buttons,
    table[class*="app-download"],
    table[style*="margin-top: 20px"],
    table[style*="margin-top:20px"] {
      width: 100% !important;
      max-width: 100% !important;
      display: block !important;
      table-layout: fixed !important;
    }
    table.app-download-buttons tr,
    table[class*="app-download"] tr,
    table[style*="margin-top: 20px"] tr {
      display: block !important;
      width: 100% !important;
    }
    table.app-download-buttons td,
    table[class*="app-download"] td,
    table.app-buttons-container td,
    td.app-button-cell {
      display: block !important;
      width: 100% !important;
      max-width: 100% !important;
      box-sizing: border-box !important;
      text-align: center !important;
      padding: 8px 15px !important;
    }
    a.app-download-button,
    a[class*="app-download-button"] {
      display: block !important;
      width: 100% !important;
      max-width: 100% !important;
      text-align: center !important;
      box-sizing: border-box !important;
      margin: 8px auto !important;
    }
    .columns-wrapper { display: block !important; width: 100% !important; }
    .column { display: block !important; width: 100% !important; max-width: 100% !important; }
  `
    : "";

  const baseCss = `
    html, body { margin: 0; padding: 0; background: #ffffff; }
    body { padding: 12px; box-sizing: border-box; }
    img { max-width: 100%; height: auto; }
    ${mobileCss}
  `;

  if (!trimmed) {
    return `<!DOCTYPE html><html><head><meta charset="utf-8" /><style>${baseCss}</style></head><body><div style="padding:2rem;text-align:center;color:#9ca3af;font-family:system-ui,sans-serif">No content yet. Add blocks to see preview.</div></body></html>`;
  }

  if (/<!DOCTYPE/i.test(trimmed) || /<html[\s>]/i.test(trimmed)) {
    if (/<\/head>/i.test(trimmed)) {
      return trimmed.replace(
        /<\/head>/i,
        `<style id="admin-preview-isolate">${baseCss}</style></head>`
      );
    }
    return trimmed.replace(
      /<html([^>]*)>/i,
      `<html$1><head><meta charset="utf-8"/><style id="admin-preview-isolate">${baseCss}</style></head>`
    );
  }

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <base target="_blank" />
  <style id="admin-preview-isolate">${baseCss}</style>
</head>
<body>${trimmed}</body>
</html>`;
}
