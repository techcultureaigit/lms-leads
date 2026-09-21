export const USER_ROLES = [
  "Admin",
  "Sales Lead",
  "Account Executive",
  "Business Development",
  "Relationship Manager",
  "Viewer",
];

export const ALL_PERMISSIONS = [
  "leads.view",
  "leads.create",
  "leads.edit",
  "leads.delete",
  "followups.manage",
  "reports.view",
  "users.view",
  "users.manage",
  "settings.manage",
];

export const ROLE_PERMISSIONS = {
  Admin: [...ALL_PERMISSIONS],
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

export const ROLE_DESCRIPTIONS = {
  Admin: "Full access to leads, users, reports and settings",
  "Sales Lead": "Manage team pipeline, leads and follow-ups",
  "Account Executive": "Create and update assigned leads",
  "Business Development": "Acquire and nurture new opportunities",
  "Relationship Manager": "Handle existing accounts and follow-ups",
  Viewer: "Read-only access to leads and reports",
};

export const LEAD_STATUSES = [
  "New",
  "In Process",
  "Meeting",
  "Lost",
  "Completed",
];

export const PRODUCTS = [
  "Mobile App",
  "Mutual Fund",
  "Website",
  "IPO",
  "LMS",
  "Ecommerce",
  "CRM",
  "Digital Market",
  "Ticketing System",
  "SEO",
  "Client Onboarding",
  "Client Modifications Tools",
];

/** Demo “today” aligned with seeded lead dates (Sep 2026). */
export const DEMO_TODAY = process.env.DASHBOARD_TODAY || "2026-09-07";

export function initialsFromName(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || "")
    .join("");
}
