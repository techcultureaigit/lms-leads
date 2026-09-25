import type { Permission } from "@/types/user";

export function hasPermission(
  permissions: readonly string[] | undefined,
  required?: Permission | Permission[],
) {
  if (!required) return true;
  const need = Array.isArray(required) ? required : [required];
  if (!need.length) return true;
  return need.some((key) => permissions?.includes(key));
}

type RouteRule = {
  match: (path: string) => boolean;
  any: Permission[];
};

/** More specific paths first. Empty `any` means any signed-in user. */
const ROUTE_RULES: RouteRule[] = [
  {
    match: (p) => p === "/leads/create" || p.startsWith("/leads/import"),
    any: ["leads.create"],
  },
  {
    match: (p) => /^\/leads\/[^/]+\/edit/.test(p),
    any: ["leads.edit"],
  },
  { match: (p) => p === "/leads" || p.startsWith("/leads/"), any: ["leads.view"] },
  { match: (p) => p.startsWith("/follow-ups"), any: ["followups.manage"] },
  { match: (p) => p.startsWith("/calendar"), any: ["leads.view"] },
  { match: (p) => p.startsWith("/reports"), any: ["reports.view"] },
  {
    match: (p) => p === "/users/create" || /^\/users\/[^/]+\/edit/.test(p),
    any: ["users.manage"],
  },
  { match: (p) => p === "/users" || p.startsWith("/users/"), any: ["users.view"] },
  {
    match: (p) => p === "/roles/create" || /^\/roles\/[^/]+\/edit/.test(p),
    any: ["users.manage"],
  },
  { match: (p) => p === "/roles" || p.startsWith("/roles/"), any: ["users.view"] },
  { match: (p) => p.startsWith("/dashboard"), any: ["leads.view"] },
  { match: (p) => p.startsWith("/settings"), any: [] },
];

export function canAccessPath(
  path: string,
  permissions: readonly string[] | undefined,
) {
  const rule = ROUTE_RULES.find((r) => r.match(path));
  if (!rule) return true;
  if (!rule.any.length) return true;
  return hasPermission(permissions, rule.any);
}

const HOME_ORDER: { href: string; any: Permission[] }[] = [
  { href: "/dashboard", any: ["leads.view"] },
  { href: "/leads", any: ["leads.view"] },
  { href: "/follow-ups", any: ["followups.manage"] },
  { href: "/calendar", any: ["leads.view"] },
  { href: "/reports", any: ["reports.view"] },
  { href: "/users", any: ["users.view"] },
  { href: "/roles", any: ["users.view"] },
  { href: "/settings", any: [] },
];

export function firstAllowedPath(permissions: readonly string[] | undefined) {
  const hit = HOME_ORDER.find((item) => hasPermission(permissions, item.any));
  return hit?.href || "/settings";
}
