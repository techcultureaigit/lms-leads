"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  FILTER_FIELDS,
  FILTER_OPERATORS,
  emptyCondition,
} from "@/lib/leadFilters";
import type {
  FilterCondition,
  FilterJoin,
  FilterOperator,
  FilterVisibility,
  SavedFilter,
} from "@/types/filter";

type AdvancedFilterModalProps = {
  open: boolean;
  canUsePrivate: boolean;
  editing?: SavedFilter | null;
  onClose: () => void;
  onApply: (conditions: FilterCondition[], joins: FilterJoin[]) => void;
  onSave: (payload: {
    name: string;
    visibility: FilterVisibility;
    conditions: FilterCondition[];
    joins: FilterJoin[];
    id?: string;
  }) => Promise<void>;
};

export default function AdvancedFilterModal({
  open,
  canUsePrivate,
  editing,
  onClose,
  onApply,
  onSave,
}: AdvancedFilterModalProps) {
  const [name, setName] = useState("");
  const [visibility, setVisibility] = useState<FilterVisibility>("public");
  const [conditions, setConditions] = useState<FilterCondition[]>([
    emptyCondition(),
  ]);
  const [joins, setJoins] = useState<FilterJoin[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setName(editing.name);
      setVisibility(editing.visibility);
      setConditions(
        editing.conditions.length ? editing.conditions : [emptyCondition()],
      );
      setJoins(editing.joins || []);
    } else {
      setName("");
      setVisibility("public");
      setConditions([emptyCondition()]);
      setJoins([]);
    }
    setError("");
  }, [open, editing, canUsePrivate]);

  if (!open || !mounted) return null;

  const updateCondition = (index: number, patch: Partial<FilterCondition>) => {
    setConditions((prev) =>
      prev.map((c, i) => (i === index ? { ...c, ...patch } : c)),
    );
  };

  const addCondition = () => {
    setConditions((prev) => [...prev, emptyCondition()]);
    setJoins((prev) => [...prev, "AND"]);
  };

  const removeCondition = (index: number) => {
    setConditions((prev) => prev.filter((_, i) => i !== index));
    setJoins((prev) => {
      if (prev.length === 0) return prev;
      if (index === 0) return prev.slice(1);
      return prev.filter((_, i) => i !== index - 1);
    });
  };

  const clearAll = () => {
    setConditions([emptyCondition()]);
    setJoins([]);
    setName("");
  };

  const getCleanPayload = () => {
    const cleanConditions = conditions.filter((c) => {
      if (c.operator === "is_empty" || c.operator === "is_not_empty") {
        return Boolean(c.field);
      }
      return Boolean(c.field && c.value.trim());
    });
    const cleanJoins = cleanConditions
      .slice(1)
      .map((_, i) => joins[i] || "AND");
    return { cleanConditions, cleanJoins };
  };

  const handleSaveAndApply = async () => {
    const { cleanConditions, cleanJoins } = getCleanPayload();
    if (!cleanConditions.length) {
      setError("Add at least one complete condition");
      return;
    }

    const autoName =
      name.trim() ||
      `${FILTER_FIELDS.find((f) => f.key === cleanConditions[0].field)?.label || "Filter"} · ${cleanConditions[0].operator} ${cleanConditions[0].value || ""}`.trim();

    setBusy(true);
    setError("");
    try {
      await onSave({
        id: editing?.id,
        name: autoName,
        visibility: canUsePrivate ? visibility : "public",
        conditions: cleanConditions,
        joins: cleanJoins,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  };

  const handleApplyOnly = () => {
    const { cleanConditions, cleanJoins } = getCleanPayload();
    if (!cleanConditions.length) {
      setError("Add at least one complete condition");
      return;
    }
    onApply(cleanConditions, cleanJoins);
    onClose();
  };

  return createPortal(
    <div
      className="modal show filter-modal-root"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="filter-modal filter-modal-v2" role="dialog" aria-modal="true">
        <div className="filter-modal-head">
          <div>
            <p className="filter-kicker">Leads</p>
            <h3>{editing ? "Edit filter" : "Build filter"}</h3>
            <p>Rules apply to the table. Save to reuse anytime.</p>
          </div>
          <button type="button" className="filter-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="filter-modal-body">
          <section className="filter-setup">
            <div className="field filter-setup-name">
              <label>Filter name</label>
              <input
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Optional — auto-named if empty"
              />
            </div>

            <div className="field filter-setup-vis">
              <label>Share with</label>
              <div
                className="vis-segment"
                role="group"
                aria-label="Filter visibility"
              >
                <button
                  type="button"
                  className={`vis-seg ${visibility === "private" ? "active" : ""}`}
                  disabled={!canUsePrivate}
                  title={
                    canUsePrivate
                      ? "Only Admin can see"
                      : "Only Admin can create private filters"
                  }
                  onClick={() => canUsePrivate && setVisibility("private")}
                >
                  Private
                </button>
                <button
                  type="button"
                  className={`vis-seg ${visibility === "public" ? "active" : ""}`}
                  onClick={() => setVisibility("public")}
                >
                  Public
                </button>
              </div>
              <small className="vis-hint">
                {visibility === "private"
                  ? "Visible only to Admin"
                  : "Visible to everyone on the team"}
              </small>
            </div>
          </section>

          {error ? <div className="filter-error">{error}</div> : null}

          <section className="filter-rules">
            <div className="filter-rules-head">
              <h4>Conditions</h4>
              <span>{conditions.length} rule{conditions.length === 1 ? "" : "s"}</span>
            </div>

            <div className="filter-conditions">
              {conditions.map((c, index) => {
                const fieldDef = FILTER_FIELDS.find((f) => f.key === c.field);
                const needsValue =
                  c.operator !== "is_empty" && c.operator !== "is_not_empty";
                return (
                  <div key={index} className="filter-rule-block">
                    {index > 0 ? (
                      <div className="filter-join">
                        <span className="filter-join-line" aria-hidden />
                        <div className="join-toggle">
                          <button
                            type="button"
                            className={`join-btn ${joins[index - 1] === "AND" ? "active" : ""}`}
                            onClick={() =>
                              setJoins((prev) =>
                                prev.map((j, i) => (i === index - 1 ? "AND" : j)),
                              )
                            }
                          >
                            AND
                          </button>
                          <button
                            type="button"
                            className={`join-btn or ${joins[index - 1] === "OR" ? "active" : ""}`}
                            onClick={() =>
                              setJoins((prev) =>
                                prev.map((j, i) => (i === index - 1 ? "OR" : j)),
                              )
                            }
                          >
                            OR
                          </button>
                        </div>
                        <span className="filter-join-line" aria-hidden />
                      </div>
                    ) : null}

                    <div className="filter-condition-card">
                      <div className="filter-condition-top">
                        <span className="cond-badge">{index + 1}</span>
                        <span className="cond-label">Where</span>
                        {conditions.length > 1 ? (
                          <button
                            type="button"
                            className="cond-remove"
                            onClick={() => removeCondition(index)}
                            aria-label={`Remove condition ${index + 1}`}
                          >
                            Remove
                          </button>
                        ) : null}
                      </div>
                      <div className="filter-condition-grid">
                        <div className="field">
                          <label>Field</label>
                          <select
                            value={c.field}
                            onChange={(e) =>
                              updateCondition(index, {
                                field: e.target.value,
                                value: "",
                              })
                            }
                          >
                            {FILTER_FIELDS.map((f) => (
                              <option key={f.key} value={f.key}>
                                {f.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="field">
                          <label>Operator</label>
                          <select
                            value={c.operator}
                            onChange={(e) =>
                              updateCondition(index, {
                                operator: e.target.value as FilterOperator,
                              })
                            }
                          >
                            {FILTER_OPERATORS.map((op) => (
                              <option key={op.value} value={op.value}>
                                {op.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="field">
                          <label>Value</label>
                          {!needsValue ? (
                            <input className="input" value="—" disabled />
                          ) : fieldDef?.type === "select" ? (
                            <select
                              value={c.value}
                              onChange={(e) =>
                                updateCondition(index, { value: e.target.value })
                              }
                            >
                              <option value="">Select…</option>
                              {fieldDef.options?.map((o) => (
                                <option key={o} value={o}>
                                  {o}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              className="input"
                              type={fieldDef?.type === "date" ? "date" : "text"}
                              value={c.value}
                              onChange={(e) =>
                                updateCondition(index, { value: e.target.value })
                              }
                              placeholder="Value…"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <button type="button" className="add-condition-btn" onClick={addCondition}>
                <span aria-hidden>+</span> Add another condition
              </button>
            </div>
          </section>
        </div>

        <div className="filter-modal-footer">
          <button type="button" className="toolbar-btn" onClick={clearAll}>
            Clear
          </button>
          <div className="filter-modal-footer-right">
            <button type="button" className="toolbar-btn" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-secondary dash-cta"
              onClick={handleApplyOnly}
            >
              Apply only
            </button>
            <button
              type="button"
              className="btn btn-primary dash-cta"
              disabled={busy}
              onClick={handleSaveAndApply}
            >
              {busy ? "Saving…" : "Save & Apply"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
