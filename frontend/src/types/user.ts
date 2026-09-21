export type UserStatus = "Active" | "Away" | "Inactive";

/** Dynamic role name from Roles API (system + custom). */
export type UserRole = string;

export type Permission =
  | "leads.view"
  | "leads.create"
  | "leads.edit"
  | "leads.delete"
  | "followups.manage"
  | "reports.view"
  | "users.view"
  | "users.manage"
  | "settings.manage";

export interface AppUser {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  phone: string;
  status: UserStatus;
  initials: string;
  permissions: Permission[];
  notes?: string;
  reportingManager?: string;
}

export type UserFormData = {
  name: string;
  role: UserRole;
  email: string;
  phone: string;
  status: UserStatus;
  notes: string;
  permissions: Permission[];
  reportingManager: string;
};
