"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type { SavedFilter } from "@/types/filter";

type SavedFiltersPanelProps = {
  open: boolean;
  filters: SavedFilter[];
  canUsePrivate: boolean;
  preferredTab?: "public" | "private";
  onClose: () => void;
  onCreate: () => void;
  onApply: (filter: SavedFilter) => void;
  onEdit: (filter: SavedFilter) => void;
  onDelete: (id: string) => void;
};

export default function SavedFiltersPanel({
  open,
  filters,
  canUsePrivate,
  preferredTab = "public",
  onClose,
  onCreate,
  onApply,
  onEdit,
  onDelete,
}: SavedFiltersPanelProps) {
  const [tab, setTab] = useState<"public" | "private">(preferredTab);
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    setTab(canUsePrivate ? preferredTab : "public");
    setSearch("");
  }, [open, preferredTab, canUsePrivate]);

  const publicItems = useMemo(
    () => filters.filter((f) => f.visibility === "public"),
    [filters],
  );
  const privateItems = useMemo(
    () => filters.filter((f) => f.visibility === "private"),
    [filters],
  );

  const activeTab = canUsePrivate ? tab : "public";
  const list = (activeTab === "private" ? privateItems : publicItems).filter(
    (f) => f.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="modal show filter-modal-root"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="saved-filters-panel" role="dialog" aria-modal="true">
        <div className="saved-filters-head">
          <div className="saved-tabs">
            <button
              type="button"
              className={`saved-tab ${activeTab === "public" ? "active" : ""}`}
              onClick={() => setTab("public")}
            >
              🌐 Public ({publicItems.length})
            </button>
            {canUsePrivate ? (
              <button
                type="button"
                className={`saved-tab ${activeTab === "private" ? "active" : ""}`}
                onClick={() => setTab("private")}
              >
                🔒 Private ({privateItems.length})
              </button>
            ) : null}
          </div>
          <button type="button" className="btn btn-primary dash-cta" onClick={onCreate}>
            + Create
          </button>
        </div>

        <div className="saved-search-wrap">
          <input
            className="input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search saved filters…"
          />
        </div>

        <div className="saved-filters-list">
          {!list.length ? (
            <div className="saved-empty">
              No {activeTab} filters yet. Create one to reuse later.
            </div>
          ) : (
            list.map((f) => (
              <div className="saved-filter-row" key={f.id}>
                <button
                  type="button"
                  className="saved-filter-name"
                  onClick={() => {
                    onApply(f);
                    onClose();
                  }}
                >
                  <span>{f.name}</span>
                  <em className={`vis-pill ${f.visibility}`}>{f.visibility}</em>
                </button>
                <div className="saved-filter-actions">
                  <button type="button" title="Edit" onClick={() => onEdit(f)}>
                    ✎
                  </button>
                  <button
                    type="button"
                    className="danger"
                    title="Delete"
                    onClick={() => {
                      if (confirm(`Delete filter “${f.name}”?`)) onDelete(f.id);
                    }}
                  >
                    ⌫
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="saved-filters-foot">
          <button type="button" className="toolbar-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
