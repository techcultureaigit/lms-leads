"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AdvancedFilterModal from "@/components/leads/AdvancedFilterModal";
import SavedFiltersPanel from "@/components/leads/SavedFiltersPanel";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import { useUsers } from "@/context/UsersContext";
import { api } from "@/lib/api";
import { DEMO_TODAY } from "@/lib/demoDate";
import { formatDate, statusClass } from "@/lib/format";
import { LEAD_STATUSES, PRODUCTS } from "@/lib/constants";
import { applySavedFilter } from "@/lib/leadFilters";
import type {
  FilterCondition,
  FilterJoin,
  FilterVisibility,
  SavedFilter,
} from "@/types/filter";
import type { Lead } from "@/types/lead";

type SortKey =
  | "entity"
  | "contact"
  | "status"
  | "leadSource"
  | "owner"
  | "followup"
  | "location";

type Filters = {
  status: string;
  leadSource: string;
  owner: string;
  product: string;
  followupFrom: string;
  followupTo: string;
};

type LeadsTableProps = {
  leads: Lead[];
  tableSearch: string;
  onTableSearch: (value: string) => void;
  initialFilters?: Partial<Filters> & { overdue?: boolean };
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onExport: () => void;
};

const EMPTY_FILTERS: Filters = {
  status: "",
  leadSource: "",
  owner: "",
  product: "",
  followupFrom: "",
  followupTo: "",
};

export default function LeadsTable({
  leads,
  tableSearch,
  onTableSearch,
  initialFilters,
  onView,
  onEdit,
  onDelete,
  onExport,
}: LeadsTableProps) {
  const { user } = useAuth();
  const { leadSources } = useSettings();
  const { userNames } = useUsers();
  const canUsePrivate = user?.role === "Admin";
  const seed: Filters = {
    ...EMPTY_FILTERS,
    status: initialFilters?.status || "",
    owner: initialFilters?.owner || "",
    product: initialFilters?.product || "",
    followupFrom: initialFilters?.followupFrom || "",
    followupTo: initialFilters?.followupTo || "",
  };
  const [showFilters, setShowFilters] = useState(
    Boolean(
      seed.status ||
        seed.owner ||
        seed.product ||
        seed.followupFrom ||
        seed.followupTo ||
        initialFilters?.overdue,
    ),
  );
  const [filters, setFilters] = useState<Filters>(seed);
  const [overdueOnly, setOverdueOnly] = useState(
    Boolean(initialFilters?.overdue),
  );
  const [advancedConditions, setAdvancedConditions] = useState<
    FilterCondition[]
  >([]);
  const [advancedJoins, setAdvancedJoins] = useState<FilterJoin[]>([]);
  const [activeSavedName, setActiveSavedName] = useState("");
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [showSavedPanel, setShowSavedPanel] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [editingFilter, setEditingFilter] = useState<SavedFilter | null>(null);
  const [savedPreferredTab, setSavedPreferredTab] = useState<
    "public" | "private"
  >("public");
  const [sortKey, setSortKey] = useState<SortKey>("entity");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const refreshSavedFilters = useCallback(async () => {
    try {
      const res = await api<{ items: SavedFilter[] }>("/api/filters");
      setSavedFilters(res.items);
    } catch {
      setSavedFilters([]);
    }
  }, []);

  useEffect(() => {
    refreshSavedFilters();
  }, [refreshSavedFilters]);

  const activeFilterCount =
    Object.values(filters).filter(Boolean).length +
    (overdueOnly ? 1 : 0) +
    (advancedConditions.length ? 1 : 0);

  const filtered = useMemo(() => {
    let rows = [...leads];

    if (filters.status) {
      rows = rows.filter((l) => l.status === filters.status);
    }
    if (filters.leadSource) {
      rows = rows.filter((l) => (l.leadSource || "") === filters.leadSource);
    }
    if (filters.owner) {
      rows = rows.filter((l) => l.owner === filters.owner);
    }
    if (filters.product) {
      rows = rows.filter((l) => l.products.includes(filters.product));
    }
    if (filters.followupFrom) {
      rows = rows.filter(
        (l) => l.followup && l.followup >= filters.followupFrom,
      );
    }
    if (filters.followupTo) {
      rows = rows.filter((l) => l.followup && l.followup <= filters.followupTo);
    }
    if (overdueOnly) {
      rows = rows.filter((l) => l.followup && l.followup < DEMO_TODAY);
    }

    if (advancedConditions.length) {
      rows = applySavedFilter(rows, advancedConditions, advancedJoins);
    }

    rows.sort((a, b) => {
      const av = String(a[sortKey] || "");
      const bv = String(b[sortKey] || "");
      const cmp = av.localeCompare(bv, undefined, { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });

    return rows;
  }, [
    leads,
    filters,
    overdueOnly,
    advancedConditions,
    advancedJoins,
    sortKey,
    sortDir,
  ]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  useEffect(() => {
    setPage(1);
  }, [filters, tableSearch, pageSize, leads.length]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortMark = (key: SortKey) =>
    sortKey === key ? (sortDir === "asc" ? " ↑" : " ↓") : "";

  const start = filtered.length ? (page - 1) * pageSize + 1 : 0;
  const end = Math.min(page * pageSize, filtered.length);

  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <h2>Leads List</h2>
          <p className="hint">
            {filtered.length} result{filtered.length === 1 ? "" : "s"}
            {activeFilterCount ? ` · ${activeFilterCount} filter(s)` : ""}
            {activeSavedName ? ` · ${activeSavedName}` : ""}
          </p>
        </div>
        <div className="list-toolbar">
          <input
            className="list-search"
            value={tableSearch}
            onChange={(e) => onTableSearch(e.target.value)}
            placeholder="Search..."
            aria-label="Filter table"
          />
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => setShowSavedPanel(true)}
          >
            Saved filters
          </button>
          <button
            type="button"
            className={`toolbar-btn ${advancedConditions.length ? "active" : ""}`}
            onClick={() => {
              setEditingFilter(null);
              setShowAdvanced(true);
            }}
          >
            Advanced filter
            {advancedConditions.length ? ` (${advancedConditions.length})` : ""}
          </button>
          <button
            type="button"
            className={`toolbar-btn ${showFilters ? "active" : ""}`}
            onClick={() => setShowFilters((v) => !v)}
          >
            Quick filter{Object.values(filters).filter(Boolean).length || overdueOnly ? " •" : ""}
          </button>
          <button type="button" className="toolbar-btn" onClick={onExport}>
            Export
          </button>
        </div>
      </div>

      {showFilters ? (
        <div className="leads-filter-panel">
          <div className="leads-filter-grid">
            <div className="field">
              <label>Status</label>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, status: e.target.value }))
                }
              >
                <option value="">All Status</option>
                {LEAD_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Lead Source</label>
              <select
                value={filters.leadSource}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, leadSource: e.target.value }))
                }
              >
                <option value="">All Sources</option>
                {leadSources.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Owner</label>
              <select
                value={filters.owner}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, owner: e.target.value }))
                }
              >
                <option value="">All Owners</option>
                {userNames.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Product</label>
              <select
                value={filters.product}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, product: e.target.value }))
                }
              >
                <option value="">All Products</option>
                {PRODUCTS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Follow-up From</label>
              <input
                type="date"
                className="input"
                value={filters.followupFrom}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, followupFrom: e.target.value }))
                }
              />
            </div>
            <div className="field">
              <label>Follow-up To</label>
              <input
                type="date"
                className="input"
                value={filters.followupTo}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, followupTo: e.target.value }))
                }
              />
            </div>
            <div className="field field-check">
              <label className="check-label">
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={overdueOnly}
                  onChange={(e) => setOverdueOnly(e.target.checked)}
                />
                Overdue follow-ups only
              </label>
            </div>
          </div>
          <div className="leads-filter-actions">
            <button
              type="button"
              className="btn btn-secondary dash-cta"
              onClick={() => {
                setFilters(EMPTY_FILTERS);
                setOverdueOnly(false);
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>
      ) : null}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>S.No</th>
              <th>
                <button type="button" className="th-sort" onClick={() => toggleSort("entity")}>
                  Entity{sortMark("entity")}
                </button>
              </th>
              <th>
                <button type="button" className="th-sort" onClick={() => toggleSort("contact")}>
                  Contact{sortMark("contact")}
                </button>
              </th>
              <th>Mobile No</th>
              <th>Email Id</th>
              <th>
                <button type="button" className="th-sort" onClick={() => toggleSort("location")}>
                  Location{sortMark("location")}
                </button>
              </th>
              <th>Products</th>
              <th>
                <button type="button" className="th-sort" onClick={() => toggleSort("status")}>
                  Status{sortMark("status")}
                </button>
              </th>
              <th>
                <button type="button" className="th-sort" onClick={() => toggleSort("leadSource")}>
                  Source{sortMark("leadSource")}
                </button>
              </th>
              <th>
                <button type="button" className="th-sort" onClick={() => toggleSort("owner")}>
                  Owner{sortMark("owner")}
                </button>
              </th>
              <th>
                <button type="button" className="th-sort" onClick={() => toggleSort("followup")}>
                  Follow-up{sortMark("followup")}
                </button>
              </th>
              <th>Key Dates</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {!pageRows.length ? (
              <tr>
                <td colSpan={13} className="empty">
                  <div className="table-empty">
                    <h3>No leads found</h3>
                    <p>Try clearing filters or create a new lead.</p>
                  </div>
                </td>
              </tr>
            ) : (
              pageRows.map((l, i) => (
                <tr
                  key={l.id}
                  className="leads-click-row"
                  tabIndex={0}
                  role="link"
                  onClick={() => onView(l.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onView(l.id);
                    }
                  }}
                >
                  <td>{start + i}</td>
                  <td>{l.entity}</td>
                  <td>{l.contact}</td>
                  <td>{l.mobile}</td>
                  <td>{l.email || "—"}</td>
                  <td>{l.location || "—"}</td>
                  <td>
                    {l.products.slice(0, 2).map((p) => (
                      <span className="product-tag" key={p}>
                        {p}
                      </span>
                    ))}
                    {l.products.length > 2 ? (
                      <span className="product-tag">+{l.products.length - 2}</span>
                    ) : null}
                  </td>
                  <td>
                    <span className={`status ${statusClass(l.status)}`}>
                      {l.status}
                    </span>
                  </td>
                  <td>{l.leadSource || "—"}</td>
                  <td>{l.owner}</td>
                  <td>{formatDate(l.followup)}</td>
                  <td>{l.key || "—"}</td>
                  <td
                    className="actions"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    <button type="button" className="view" title="View" onClick={() => onView(l.id)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                    <button type="button" className="edit" title="Edit" onClick={() => onEdit(l.id)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M12 20h9" strokeLinecap="round" />
                        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <button type="button" className="delete" title="Delete" onClick={() => onDelete(l.id)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <div className="pagination-left">
          <span>
            Showing {start} to {end} of {filtered.length} Leads
          </span>
          <select
            className="page-size"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            aria-label="Rows per page"
          >
            <option value={5}>5 / page</option>
            <option value={10}>10 / page</option>
            <option value={25}>25 / page</option>
          </select>
        </div>
        <div className="pages">
          <button
            type="button"
            className="page-btn"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .slice(Math.max(0, page - 3), Math.max(0, page - 3) + 5)
            .map((p) => (
              <button
                key={p}
                type="button"
                className={`page-btn ${p === page ? "active" : ""}`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}
          <button
            type="button"
            className="page-btn"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </div>
      </div>

      {advancedConditions.length ? (
        <div className="advanced-filter-chipbar">
          <span>
            Advanced filter active
            {activeSavedName ? `: ${activeSavedName}` : ""}
          </span>
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => {
              setAdvancedConditions([]);
              setAdvancedJoins([]);
              setActiveSavedName("");
            }}
          >
            Clear advanced
          </button>
        </div>
      ) : null}

      <SavedFiltersPanel
        open={showSavedPanel}
        filters={savedFilters}
        canUsePrivate={canUsePrivate}
        preferredTab={savedPreferredTab}
        onClose={() => setShowSavedPanel(false)}
        onCreate={() => {
          setShowSavedPanel(false);
          setEditingFilter(null);
          setShowAdvanced(true);
        }}
        onApply={(f) => {
          setAdvancedConditions(f.conditions);
          setAdvancedJoins(f.joins || []);
          setActiveSavedName(f.name);
        }}
        onEdit={(f) => {
          setShowSavedPanel(false);
          setEditingFilter(f);
          setShowAdvanced(true);
        }}
        onDelete={async (id) => {
          await api(`/api/filters/${id}`, { method: "DELETE" });
          setSavedFilters((prev) => prev.filter((f) => f.id !== id));
          if (editingFilter?.id === id) setEditingFilter(null);
        }}
      />

      <AdvancedFilterModal
        open={showAdvanced}
        canUsePrivate={canUsePrivate}
        editing={editingFilter}
        onClose={() => {
          setShowAdvanced(false);
          setEditingFilter(null);
        }}
        onApply={(conditions, joins) => {
          setAdvancedConditions(conditions);
          setAdvancedJoins(joins);
          setActiveSavedName(editingFilter?.name || "Custom filter");
        }}
        onSave={async (payload) => {
          const body = {
            name: payload.name,
            visibility: payload.visibility as FilterVisibility,
            conditions: payload.conditions,
            joins: payload.joins,
          };
          let saved: SavedFilter;
          if (payload.id) {
            const res = await api<{ filter: SavedFilter }>(
              `/api/filters/${payload.id}`,
              { method: "PUT", body },
            );
            saved = res.filter;
            setSavedFilters((prev) =>
              prev.map((f) => (f.id === saved.id ? saved : f)),
            );
          } else {
            const res = await api<{ filter: SavedFilter }>("/api/filters", {
              method: "POST",
              body,
            });
            saved = res.filter;
            setSavedFilters((prev) => [
              saved,
              ...prev.filter((f) => f.id !== saved.id),
            ]);
          }
          // Apply on table immediately
          setAdvancedConditions(saved.conditions);
          setAdvancedJoins(saved.joins || []);
          setActiveSavedName(saved.name);
          setSavedPreferredTab(
            saved.visibility === "private" ? "private" : "public",
          );
          setShowAdvanced(false);
          setEditingFilter(null);
          // Show in Saved filters list
          setShowSavedPanel(true);
          // Re-fetch to stay in sync with DB
          await refreshSavedFilters();
        }}
      />
    </div>
  );
}
