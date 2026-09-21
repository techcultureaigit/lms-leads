export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/leads", label: "Leads", icon: "leads" },
  { href: "/follow-ups", label: "Follow-ups", icon: "followups" },
  { href: "/calendar", label: "Calendar", icon: "calendar" },
  { href: "/reports", label: "Reports", icon: "reports" },
  { href: "/users", label: "Users", icon: "users" },
  { href: "/roles", label: "Roles", icon: "roles" },
  { href: "/settings", label: "Settings", icon: "settings" },
] as const;

export type NavIcon = (typeof NAV_ITEMS)[number]["icon"];
