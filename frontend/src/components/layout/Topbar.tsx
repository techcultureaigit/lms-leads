"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLeads } from "@/context/LeadsContext";
import { useSidebarUi } from "@/context/SidebarUiContext";
import { DEMO_TODAY } from "@/lib/demoDate";
import { formatDate } from "@/lib/format";

type TopbarProps = {
  title?: string;
  subtitle?: string;
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  showSearch?: boolean;
  compact?: boolean;
};

type NotifItem = {
  id: string;
  title: string;
  detail: string;
  time: string;
  href: string;
  unread: boolean;
};

const READ_KEY = "tc_notif_read";

function loadReadIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(READ_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function saveReadIds(ids: Set<string>) {
  localStorage.setItem(READ_KEY, JSON.stringify([...ids]));
}

export default function Topbar({
  title: _title = "",
  subtitle: _subtitle,
  search = "",
  onSearchChange,
  searchPlaceholder = "Search...",
  showSearch = true,
  compact: _compact = false,
}: TopbarProps) {
  const { user, logout } = useAuth();
  const { leads } = useLeads();
  const { collapsed, toggleCollapsed } = useSidebarUi();
  const [openMenu, setOpenMenu] = useState<"help" | "notif" | "profile" | null>(
    null,
  );
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set());
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setReadIds(loadReadIds());
  }, []);

  const notifications = useMemo(() => {
    const items: NotifItem[] = [];

    leads.forEach((l) => {
      if (l.followup && l.followup < DEMO_TODAY) {
        const id = `overdue-${l.id}`;
        items.push({
          id,
          title: `Follow-up overdue · ${l.entity}`,
          detail: `Requires your attention · ${l.owner}`,
          time: `Due ${formatDate(l.followup)}`,
          href: `/leads/${l.id}/edit`,
          unread: !readIds.has(id),
        });
      } else if (l.followup === DEMO_TODAY) {
        const id = `fu-${l.id}`;
        items.push({
          id,
          title: `Follow-up due today · ${l.entity}`,
          detail: `${l.contact} · ${l.owner}`,
          time: "Today",
          href: `/follow-ups`,
          unread: !readIds.has(id),
        });
      }
      if (l.meetingDate === DEMO_TODAY) {
        const id = `meet-${l.id}`;
        items.push({
          id,
          title: `Meeting scheduled · ${l.entity}`,
          detail: `${l.meetingType || "Meeting"} with ${l.contact}`,
          time: "Today",
          href: `/calendar`,
          unread: !readIds.has(id),
        });
      }
    });

    // Stable order: unread first
    return items
      .sort((a, b) => Number(b.unread) - Number(a.unread))
      .slice(0, 12);
  }, [leads, readIds]);

  const newCount = notifications.filter((n) => n.unread).length;
  const notifCount = notifications.length;

  const markRead = (id: string) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      saveReadIds(next);
      return next;
    });
  };

  const markAllRead = () => {
    setReadIds((prev) => {
      const next = new Set(prev);
      notifications.forEach((n) => next.add(n.id));
      saveReadIds(next);
      return next;
    });
  };

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const initials =
    user?.initials ||
    user?.name
      ?.split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() || "")
      .join("") ||
    "—";

  return (
    <header className="topbar topbar-compact" ref={rootRef}>
      <button
        type="button"
        className={`icon-btn sidebar-toggle-top ${collapsed ? "is-collapsed" : ""}`}
        onClick={toggleCollapsed}
        aria-label={collapsed ? "Open sidebar" : "Close sidebar"}
        title={collapsed ? "Open sidebar" : "Close sidebar"}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <path d="M15 6 9 12l6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div className="top-actions">
        {showSearch && onSearchChange ? (
          <input
            className="search-top"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label="Search"
          />
        ) : null}

        <div className="topbar-pop">
          <button
            className={`icon-btn ${openMenu === "help" ? "is-open" : ""}`}
            type="button"
            aria-label="Help"
            aria-expanded={openMenu === "help"}
            onClick={() =>
              setOpenMenu((m) => (m === "help" ? null : "help"))
            }
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="9" />
              <path
                d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1.5 1-1.5 2.2"
                strokeLinecap="round"
              />
              <circle cx="12" cy="17" r="0.8" fill="currentColor" stroke="none" />
            </svg>
          </button>
          {openMenu === "help" ? (
            <div className="topbar-dropdown topbar-dropdown-help">
              <strong>Quick help</strong>
              <p>Use Leads to manage pipeline, Follow-ups for due work, and Calendar for meetings.</p>
              <Link href="/leads/create" onClick={() => setOpenMenu(null)}>
                Create a lead
              </Link>
              <Link href="/follow-ups" onClick={() => setOpenMenu(null)}>
                Open follow-ups
              </Link>
              <Link href="/settings" onClick={() => setOpenMenu(null)}>
                Workspace settings
              </Link>
            </div>
          ) : null}
        </div>

        <div className="topbar-pop">
          <button
            className={`icon-btn ${openMenu === "notif" ? "is-open" : ""}`}
            type="button"
            aria-label="Notifications"
            aria-expanded={openMenu === "notif"}
            onClick={() =>
              setOpenMenu((m) => (m === "notif" ? null : "notif"))
            }
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path
                d="M6 9a6 6 0 1 1 12 0c0 7 3 7 3 7H3s3 0 3-7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M10 19a2 2 0 0 0 4 0" strokeLinecap="round" />
            </svg>
            {notifCount > 0 ? (
              <span className="badge">{newCount > 0 ? (newCount > 9 ? "9+" : newCount) : notifCount}</span>
            ) : null}
          </button>
          {openMenu === "notif" ? (
            <div className="topbar-dropdown topbar-dropdown-notif">
              <div className="notif-panel-head">
                <h3>Notifications</h3>
                {newCount > 0 ? (
                  <span className="notif-new-pill">{newCount} new</span>
                ) : (
                  <span className="notif-new-pill is-clear">All caught up</span>
                )}
              </div>

              {!notifications.length ? (
                <div className="topbar-empty">
                  No alerts right now for {formatDate(DEMO_TODAY)}.
                </div>
              ) : (
                <div className="notif-panel-list">
                  {notifications.map((n) => (
                    <Link
                      key={n.id}
                      href={n.href}
                      className={`notif-row ${n.unread ? "is-unread" : ""}`}
                      onClick={() => {
                        markRead(n.id);
                        setOpenMenu(null);
                      }}
                    >
                      <span className="notif-dot" aria-hidden />
                      <span className="notif-copy">
                        <strong>{n.title}</strong>
                        <em>{n.detail}</em>
                        <small>{n.time}</small>
                      </span>
                    </Link>
                  ))}
                </div>
              )}

              <div className="notif-panel-foot">
                <Link
                  href="/follow-ups"
                  className="notif-show-all"
                  onClick={() => {
                    markAllRead();
                    setOpenMenu(null);
                  }}
                >
                  Show all notifications
                </Link>
              </div>
            </div>
          ) : null}
        </div>

        <div className="topbar-pop">
          <button
            type="button"
            className={`icon-btn ${openMenu === "profile" ? "is-open" : ""}`}
            aria-label="Account menu"
            aria-expanded={openMenu === "profile"}
            onClick={() =>
              setOpenMenu((m) => (m === "profile" ? null : "profile"))
            }
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <circle cx="12" cy="5" r="1.8" />
              <circle cx="12" cy="12" r="1.8" />
              <circle cx="12" cy="19" r="1.8" />
            </svg>
          </button>
          {openMenu === "profile" ? (
            <div className="topbar-dropdown topbar-dropdown-profile">
              <div className="topbar-profile-card">
                <div className="avatar">{initials}</div>
                <div>
                  <strong>{user?.name || "Guest"}</strong>
                  <span>{user?.email || user?.role || ""}</span>
                </div>
              </div>
              <Link href="/settings" onClick={() => setOpenMenu(null)}>
                Settings
              </Link>
              <Link href="/users" onClick={() => setOpenMenu(null)}>
                Team users
              </Link>
              <Link href="/roles" onClick={() => setOpenMenu(null)}>
                Roles
              </Link>
              <button
                type="button"
                className="topbar-logout"
                onClick={() => {
                  setOpenMenu(null);
                  logout();
                }}
              >
                Log out
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
