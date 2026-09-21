"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

type SearchableMultiSelectProps = {
  values: string[];
  options: string[];
  placeholder?: string;
  searchPlaceholder?: string;
  required?: boolean;
  emptyLabel?: string;
  onChange: (values: string[]) => void;
};

type PanelPos = { top: number; left: number; width: number };

export default function SearchableMultiSelect({
  values,
  options,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  required = false,
  emptyLabel = "No matches",
  onChange,
}: SearchableMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [pos, setPos] = useState<PanelPos | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.toLowerCase().includes(q));
  }, [options, query]);

  const allSelected =
    options.length > 0 && options.every((o) => values.includes(o));

  const updatePos = () => {
    const el = rootRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const spaceBelow = window.innerHeight - r.bottom;
    const panelH = Math.min(320, window.innerHeight * 0.5);
    const openUp = spaceBelow < panelH && r.top > spaceBelow;
    setPos({
      top: openUp ? Math.max(8, r.top - panelH - 6) : r.bottom + 6,
      left: r.left,
      width: r.width,
    });
  };

  useLayoutEffect(() => {
    if (!open) {
      setPos(null);
      return;
    }
    updatePos();
    const onScroll = () => updatePos();
    window.addEventListener("resize", onScroll);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (rootRef.current?.contains(t) || panelRef.current?.contains(t)) return;
      setOpen(false);
      setQuery("");
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const toggle = (opt: string) => {
    if (values.includes(opt)) {
      onChange(values.filter((v) => v !== opt));
    } else {
      onChange([...values, opt]);
    }
  };

  const label =
    values.length === 0
      ? placeholder
      : values.length <= 2
        ? values.join(", ")
        : `${values.slice(0, 2).join(", ")} +${values.length - 2}`;

  const panel =
    open && pos
      ? createPortal(
          <div
            ref={panelRef}
            className="search-select-panel search-select-panel-fixed"
            role="listbox"
            aria-multiselectable
            style={{
              top: pos.top,
              left: pos.left,
              width: pos.width,
            }}
          >
            <input
              ref={inputRef}
              className="input search-select-query"
              value={query}
              placeholder={searchPlaceholder}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setOpen(false);
                  setQuery("");
                }
              }}
            />
            <div className="search-select-actions">
              <button
                type="button"
                className="search-select-action"
                onClick={() => onChange(allSelected ? [] : [...options])}
              >
                {allSelected ? "Clear all" : "Select all"}
              </button>
              {values.length ? (
                <span className="search-select-count">
                  {values.length} selected
                </span>
              ) : null}
            </div>
            <div className="search-select-list">
              {!filtered.length ? (
                <div className="search-select-empty">{emptyLabel}</div>
              ) : (
                filtered.map((opt) => {
                  const checked = values.includes(opt);
                  return (
                    <label
                      key={opt}
                      className={`search-select-option search-multi-option ${checked ? "is-active" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(opt)}
                      />
                      <span>{opt}</span>
                    </label>
                  );
                })
              )}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div
      className={`search-select search-multi ${open ? "is-open" : ""}`}
      ref={rootRef}
    >
      <input
        className="search-select-native"
        tabIndex={-1}
        aria-hidden
        required={required}
        value={values.length ? values.join(",") : ""}
        onChange={() => {}}
      />

      <button
        type="button"
        className={`search-select-trigger ${values.length ? "has-value" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          setOpen((v) => !v);
          setQuery("");
        }}
      >
        <span>{label}</span>
        <svg viewBox="0 0 12 8" width="12" height="8" aria-hidden>
          <path
            fill="currentColor"
            d="M1.2 1.2 6 6l4.8-4.8"
            stroke="currentColor"
            strokeWidth="1.4"
            fillOpacity="0"
          />
        </svg>
      </button>

      {panel}
    </div>
  );
}
