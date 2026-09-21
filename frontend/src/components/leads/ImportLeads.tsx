"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLeads } from "@/context/LeadsContext";
import { ApiError, api } from "@/lib/api";
import {
  downloadSampleCsv,
  parseLeadImportFile,
  type ImportLeadRow,
} from "@/lib/importLeads";
import type { Lead } from "@/types/lead";

type ImportResult = {
  created: number;
  failed: number;
  items: Lead[];
  errors: { row: number; message: string }[];
};

export default function ImportLeads() {
  const router = useRouter();
  const { user } = useAuth();
  const { refreshLeads } = useLeads();

  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState<ImportLeadRow[]>([]);
  const [mapped, setMapped] = useState<Record<string, string>>({});
  const [headers, setHeaders] = useState<string[]>([]);
  const [headerRow, setHeaderRow] = useState(1);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const preview = useMemo(() => rows.slice(0, 8), [rows]);
  const invalidCount = useMemo(
    () =>
      rows.filter(
        (r) =>
          !r.entity?.trim() ||
          !r.contact?.trim() ||
          String(r.mobile || "").replace(/\D/g, "").length < 10,
      ).length,
    [rows],
  );

  const onFile = async (file: File | null) => {
    setError("");
    setResult(null);
    setRows([]);
    setMapped({});
    setHeaders([]);
    setHeaderRow(1);
    setFileName("");
    if (!file) return;

    setFileName(file.name);
    try {
      const buf = await file.arrayBuffer();
      const parsed = await parseLeadImportFile(buf, file.name);
      if (!parsed.rows.length) {
        setError("No data rows found in file.");
        return;
      }
      setHeaders(parsed.headers);
      setMapped(parsed.mapped as Record<string, string>);
      setRows(parsed.rows);
      setHeaderRow(parsed.headerRow);

      const badMobile = parsed.rows.filter(
        (r) => String(r.mobile || "").replace(/\D/g, "").length < 10,
      ).length;
      if (!parsed.mapped.mobile && badMobile > 0) {
        setError(
          `Mobile column not clearly detected. Headers: ${parsed.headers.join(", ")}. ${badMobile} rows missing 10-digit mobile.`,
        );
      } else if (badMobile > 0) {
        setError(
          `${badMobile} of ${parsed.rows.length} rows have invalid/missing 10-digit mobile — those will fail on import.`,
        );
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to read file");
    }
  };

  const handleImport = async () => {
    if (!rows.length) {
      setError("Select a CSV/Excel file first.");
      return;
    }
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const defaultName = user?.name || "";
      const payload = rows.map((r) => ({
        ...r,
        owner: r.owner || defaultName,
        assigned: r.assigned || r.owner || defaultName,
        products: r.products?.length ? r.products : ["CRM"],
        status: r.status || "New",
      }));

      const res = await api<ImportResult>("/api/leads/import", {
        method: "POST",
        body: { leads: payload },
      });
      setResult(res);
      await refreshLeads().catch(() => undefined);

      if (res.created > 0 && res.failed === 0) {
        setTimeout(() => router.push("/leads"), 1200);
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Import failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="import-panel import-panel-live">
      <h3>Import Leads</h3>
      <p>
        Upload a CSV or Excel (`.xlsx`) file. Columns like Entity/Company,
        Contact, Mobile, Email, Location are auto-detected.
      </p>

      <div className="import-actions-top">
        <button
          type="button"
          className="btn btn-secondary dash-cta"
          onClick={downloadSampleCsv}
        >
          Download Sample CSV
        </button>
      </div>

      <div className="import-drop">
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={(e) => onFile(e.target.files?.[0] || null)}
        />
        {fileName ? (
          <p className="import-file-name">Selected: {fileName}</p>
        ) : (
          <p className="import-file-name muted">No file selected</p>
        )}
      </div>

      {error ? <div className="cal-flash err">{error}</div> : null}

      {rows.length ? (
        <div className="import-preview">
          <div className="import-preview-head">
            <strong>
              {rows.length} rows ready
              {invalidCount ? ` · ${invalidCount} invalid` : ""}
            </strong>
            <span>
              Header row #{headerRow} · Mapped:{" "}
              {Object.entries(mapped)
                .map(([k, v]) => `${k}←${v}`)
                .join(", ") || "—"}
            </span>
          </div>
          {headers.length ? (
            <p className="import-headers">
              File headers: {headers.slice(0, 12).join(", ")}
              {headers.length > 12 ? "…" : ""}
            </p>
          ) : null}
          <div className="table-wrap import-table-wrap">
            <table className="users-list-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Entity</th>
                  <th>Contact</th>
                  <th>Mobile</th>
                  <th>Email</th>
                  <th>Location</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((r, idx) => (
                  <tr key={`${r.entity}-${idx}`}>
                    <td>{r._row || idx + 2}</td>
                    <td>{r.entity || "—"}</td>
                    <td>{r.contact || "—"}</td>
                    <td>{r.mobile || "—"}</td>
                    <td>{r.email || "—"}</td>
                    <td>{r.location || "—"}</td>
                    <td>{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length > preview.length ? (
            <p className="hint">Showing first {preview.length} rows…</p>
          ) : null}
        </div>
      ) : null}

      {result ? (
        <div
          className={`cal-flash ${result.failed ? "err" : ""}`}
          style={{ marginTop: 12 }}
        >
          Imported <strong>{result.created}</strong> leads
          {result.failed ? ` · ${result.failed} failed` : ""}.
          {result.errors?.[0] ? (
            <div style={{ marginTop: 6 }}>
              First error (row {result.errors[0].row}):{" "}
              {result.errors[0].message}
            </div>
          ) : null}
          {result.created > 0 && result.failed === 0
            ? " Redirecting to leads list…"
            : null}
        </div>
      ) : null}

      <button
        type="button"
        className="btn btn-primary dash-cta"
        disabled={busy || !rows.length}
        onClick={handleImport}
      >
        {busy ? "Importing…" : "Import Leads"}
      </button>
    </div>
  );
}
