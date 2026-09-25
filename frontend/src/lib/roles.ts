import type { Permission, UserRole } from "@/types/user";

export const USER_ROLES: UserRole[] = [
  "Admin",
  "Sales Manager",
  "Business Development",
];

export const ALL_PERMISSIONS: { key: Permission; label: string; group: string }[] =
  [
    { key: "leads.view", label: "View Leads", group: "Leads" },
    { key: "leads.create", label: "Create Leads", group: "Leads" },
    { key: "leads.edit", label: "Edit Leads", group: "Leads" },
    { key: "leads.delete", label: "Delete Leads", group: "Leads" },
    { key: "followups.manage", label: "Manage Follow-ups", group: "Sales" },
    { key: "reports.view", label: "View Reports", group: "Insights" },
    { key: "users.view", label: "View Users", group: "Users" },
    { key: "users.manage", label: "Manage Users", group: "Users" },
    { key: "settings.manage", label: "Manage Settings", group: "Workspace" },
  ];

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  Admin: ALL_PERMISSIONS.map((p) => p.key),
  "Sales Manager": [
    "leads.view",
    "leads.create",
    "leads.edit",
    "leads.delete",
    "followups.manage",
    "reports.view",
    "users.view",
  ],
  "Sales Lead": [
    "leads.view",
    "leads.create",
    "leads.edit",
    "leads.delete",
    "followups.manage",
    "reports.view",
    "users.view",
  ],
  "Account Executive": [
    "leads.view",
    "leads.create",
    "leads.edit",
    "followups.manage",
    "reports.view",
  ],
  "Business Development": [
    "leads.view",
    "leads.create",
    "leads.edit",
    "followups.manage",
    "reports.view",
  ],
  "Relationship Manager": [
    "leads.view",
    "leads.edit",
    "followups.manage",
    "reports.view",
  ],
  Viewer: ["leads.view", "reports.view", "users.view"],
};

export const ROLE_DESCRIPTIONS: Record<string, string> = {
  Admin: "Full access to leads, users, reports and settings",
  "Sales Manager": "Sees leads for their own team only",
  "Sales Lead": "Manage team pipeline, leads and follow-ups",
  "Account Executive": "Create and update assigned leads",
  "Business Development": "Sees only leads assigned to them",
  "Relationship Manager": "Handle existing accounts and follow-ups",
  Viewer: "Read-only access to leads and reports",
};

export function initialsFromName(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || "")
    .join("");
}
