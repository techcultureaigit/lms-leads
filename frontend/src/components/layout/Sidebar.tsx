"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { type NavIcon } from "@/lib/nav";
import { hasPermission, firstAllowedPath } from "@/lib/permissions";
import { useSidebarUi } from "@/context/SidebarUiContext";
import type { Permission } from "@/types/user";

function Icon({ name }: { name: NavIcon | "logout" | "collapse" }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (name) {
    case "dashboard":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <rect x="3" y="3" width="7" height="9" rx="1.5" />
          <rect x="14" y="3" width="7" height="5" rx="1.5" />
          <rect x="14" y="12" width="7" height="9" rx="1.5" />
          <rect x="3" y="16" width="7" height="5" rx="1.5" />
        </svg>
      );
    case "leads":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "followups":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M21 12a9 9 0 1 1-3-6.7" />
          <path d="M21 3v6h-6" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    case "calendar":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M16 3v4M8 3v4M3 11h18" />
        </svg>
      );
    case "reports":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M4 19V5M4 19h16" />
          <path d="M8 15v-4M12 15V8M16 15v-7" />
        </svg>
      );
    case "users":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <circle cx="9" cy="8" r="3.5" />
          <path d="M2.5 19a6.5 6.5 0 0 1 13 0" />
          <circle cx="17" cy="9" r="2.5" />
          <path d="M16 19c.4-2.2 1.9-4 4.5-4.5" />
        </svg>
      );
    case "roles":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M12 3 4 6v5c0 5 3.4 8.5 8 10 4.6-1.5 8-5 8-10V6l-8-3z" />
          <path d="M9.5 12.5 11 14l3.5-3.5" />
        </svg>
      );
    case "settings":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9c.3.6.9 1 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
        </svg>
      );
    case "logout":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M10 7V5a2 2 0 0 1 2-2h7v18h-7a2 2 0 0 1-2-2v-2" />
          <path d="M15 12H3m0 0 3-3m-3 3 3 3" />
        </svg>
      );
    case "collapse":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M15 6 9 12l6 6" />
        </svg>
      );
    default:
      return null;
  }
}

const GROUPS: {
  title: string | null;
  items: {
    href: string;
    label: string;
    icon: NavIcon;
    permission?: Permission;
  }[];
}[] = [
  {
    title: null,
    items: [
      {
        href: "/dashboard",
        label: "Dashboard",
        icon: "dashboard",
        permission: "leads.view",
      },
    ],
  },
  {
    title: "Sales",
    items: [
      { href: "/leads", label: "Leads", icon: "leads", permission: "leads.view" },
      {
        href: "/follow-ups",
        label: "Follow-ups",
        icon: "followups",
        permission: "followups.manage",
      },
      {
        href: "/calendar",
        label: "Calendar",
        icon: "calendar",
        permission: "leads.view",
      },
    ],
  },
  {
    title: "Insights",
    items: [
      {
        href: "/reports",
        label: "Reports",
        icon: "reports",
        permission: "reports.view",
      },
      { href: "/users", label: "Users", icon: "users", permission: "users.view" },
      { href: "/roles", label: "Roles", icon: "roles", permission: "users.view" },
      { href: "/settings", label: "Settings", icon: "settings" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const { collapsed, setCollapsed } = useSidebarUi();

  const closeMobileNav = () => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 900px)").matches
    ) {
      setCollapsed(true);
    }
  };

  return (
    <aside className={`sidebar ${collapsed ? "is-collapsed" : ""}`}>
      <div className="brand">
        <Link
          href={firstAllowedPath(user?.permissions)}
          className="brand-logo-link"
          aria-label="TechCulture home"
          onClick={closeMobileNav}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={collapsed ? "/logo-mark.png" : "/logo.png"}
            alt="TechCulture"
            className={`brand-logo ${collapsed ? "is-mark" : ""}`}
          />
        </Link>
      </div>

      <nav className="menu menu-grouped" aria-label="Main">
        {GROUPS.map((group) => {
          const items = group.items.filter((item) =>
            hasPermission(user?.permissions, item.permission),
          );
          if (!items.length) return null;
          return (
          <div className="nav-group" key={group.title || "main"}>
            {group.title ? (
              <div className="nav-group-title">{group.title}</div>
            ) : null}
            {items.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={active ? "active" : undefined}
                  onClick={closeMobileNav}
                >
                  <span className="menu-icon">
                    <Icon name={item.icon} />
                  </span>
                  <span className="menu-label">{item.label}</span>
                  <span className="menu-tip" role="tooltip">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
          );
        })}
      </nav>

      <div className="sidebar-foot">
        {user ? (
          <div className="sidebar-user">
            <strong>{user.name}</strong>
            <small>{user.role}</small>
          </div>
        ) : null}
        <button type="button" className="logout-btn" onClick={logout}>
          <span className="menu-icon">
            <Icon name="logout" />
          </span>
          <span className="menu-label">Log out</span>
          <span className="menu-tip" role="tooltip">
            Log out
          </span>
        </button>
      </div>
    </aside>
  );
}
