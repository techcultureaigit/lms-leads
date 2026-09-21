"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

type SearchableSelectProps = {
  value: string;
  options: string[];
  placeholder?: string;
  searchPlaceholder?: string;
  required?: boolean;
  emptyLabel?: string;
  onChange: (value: string) => void;
};

type PanelPos = { top: number; left: number; width: number };

export default function SearchableSelect({
  value,
  options,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  required = false,
  emptyLabel = "No matches",
  onChange,
}: SearchableSelectProps) {
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

  const updatePos = () => {
    const el = rootRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const spaceBelow = window.innerHeight - r.bottom;
    const panelH = Math.min(280, window.innerHeight * 0.45);
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

  const panel =
    open && pos
      ? createPortal(
          <div
            ref={panelRef}
            className="search-select-panel search-select-panel-fixed"
            role="listbox"
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
                if (e.key === "Enter" && filtered[0]) {
                  e.preventDefault();
                  onChange(filtered[0]);
                  setOpen(false);
                  setQuery("");
                }
              }}
            />
            <div className="search-select-list">
              {!filtered.length ? (
                <div className="search-select-empty">{emptyLabel}</div>
              ) : (
                filtered.map((opt) => (
                  <button
                    type="button"
                    key={opt}
                    role="option"
                    aria-selected={opt === value}
                    className={`search-select-option ${opt === value ? "is-active" : ""}`}
                    onClick={() => {
                      onChange(opt);
                      setOpen(false);
                      setQuery("");
                    }}
                  >
                    {opt}
                  </button>
                ))
              )}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div className={`search-select ${open ? "is-open" : ""}`} ref={rootRef}>
      <input
        className="search-select-native"
        tabIndex={-1}
        aria-hidden
        required={required}
        value={value}
        onChange={() => {}}
      />

      <button
        type="button"
        className={`search-select-trigger ${value ? "has-value" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          setOpen((v) => !v);
          setQuery("");
        }}
      >
        <span>{value || placeholder}</span>
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
