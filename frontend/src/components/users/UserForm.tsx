"use client";

import { ALL_PERMISSIONS } from "@/lib/roles";
import { useRoles } from "@/context/RolesContext";
import { useUsers } from "@/context/UsersContext";
import SearchableSelect from "@/components/shared/SearchableSelect";
import SearchableMultiSelect from "@/components/shared/SearchableMultiSelect";
import type { Permission, UserFormData, UserStatus } from "@/types/user";

type UserFormProps = {
  form: UserFormData;
  isEditing?: boolean;
  excludeManagerName?: string;
  onChange: (next: UserFormData) => void;
  onSubmit: () => void;
  onCancel: () => void;
};

const PERM_OPTIONS = ALL_PERMISSIONS.map(
  (p) => `${p.group} · ${p.label}`,
);

const NONE_MANAGER = "— None —";

function permissionKeysToOptions(keys: Permission[]) {
  const set = new Set(keys);
  return ALL_PERMISSIONS.filter((p) => set.has(p.key)).map(
    (p) => `${p.group} · ${p.label}`,
  );
}

function optionsToPermissionKeys(options: string[]): Permission[] {
  const map = new Map<string, Permission>(
    ALL_PERMISSIONS.map((p) => [`${p.group} · ${p.label}`, p.key]),
  );
  return options
    .map((o) => map.get(o))
    .filter((k): k is Permission => Boolean(k));
}

export function emptyUserForm(): UserFormData {
  return {
    name: "",
    role: "Business Development",
    email: "",
    phone: "",
    status: "Active",
    notes: "",
    permissions: [
      "leads.view",
      "leads.create",
      "leads.edit",
      "followups.manage",
      "reports.view",
    ],
    reportingManager: "",
    password: "",
  };
}

export default function UserForm({
  form,
  isEditing = false,
  excludeManagerName = "",
  onChange,
  onSubmit,
  onCancel,
}: UserFormProps) {
  const { users } = useUsers();
  const { roles, roleNames, getRoleByName } = useRoles();

  const managerOptions: { value: string; label: string }[] = [
    { value: NONE_MANAGER, label: NONE_MANAGER },
    ...users
      .filter((person) => {
        const role = (person.role || "").trim().toLowerCase().replace(/\s+/g, " ");
        return role === "admin" || role === "sales manager";
      })
      .filter(
        (person) =>
          person.name !== excludeManagerName && person.name !== form.name.trim(),
      )
      .sort((a, b) => {
        const rank = (role: string) =>
          role.trim().toLowerCase() === "admin" ? 0 : 1;
        return rank(a.role) - rank(b.role) || a.name.localeCompare(b.name);
      })
      .map((person) => ({
        value: person.name,
        label: `${person.name} · ${person.role}`,
      })),
  ];

  const selectedRole = getRoleByName(form.role);

  const set = <K extends keyof UserFormData>(key: K, value: UserFormData[K]) => {
    onChange({ ...form, [key]: value });
  };

  const handleRoleChange = (roleName: string) => {
    const role = getRoleByName(roleName);
    onChange({
      ...form,
      role: roleName,
      permissions: role ? [...role.permissions] : form.permissions,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || form.phone.length < 10) {
      alert("Please fill name, email and 10-digit mobile.");
      return;
    }
    if (!form.permissions.length) {
      alert("Select at least one permission.");
      return;
    }
    const password = form.password.trim();
    if (password && password.length < 6) {
      alert("Password must be at least 6 characters, or leave it blank.");
      return;
    }
    onSubmit();
  };

  const roleOptions =
    roleNames.length > 0
      ? roleNames
      : form.role
        ? [form.role]
        : ["Account Executive"];

  return (
    <form className="user-form" onSubmit={handleSubmit}>
      <div className="user-form-grid">
        <div className="field">
          <label>
            Full Name <span className="required">*</span>
          </label>
          <input
            className="input"
            required
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Enter full name"
          />
        </div>

        <div className="field">
          <label>
            Email <span className="required">*</span>
          </label>
          <input
            className="input"
            type="email"
            required
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="name@techculture.in"
          />
        </div>

        <div className="field">
          <label>Password</label>
          <input
            className="input"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            placeholder={isEditing ? "Leave blank to keep current" : "Enter password"}
          />
          {isEditing ? (
            <p className="role-dropdown-hint">
              Set a new password to replace the current one. Blank keeps it unchanged.
            </p>
          ) : null}
        </div>

        <div className="field">
          <label>
            Mobile No <span className="required">*</span>
          </label>
          <div className="phone">
            <span className="phone-prefix">+91</span>
            <input
              className="input"
              required
              maxLength={10}
              value={form.phone}
              onChange={(e) =>
                set("phone", e.target.value.replace(/\D/g, "").slice(0, 10))
              }
              placeholder="Enter mobile number"
            />
          </div>
        </div>

        <div className="field">
          <label>
            Status <span className="required">*</span>
          </label>
          <select
            required
            value={form.status}
            onChange={(e) => set("status", e.target.value as UserStatus)}
          >
            <option value="Active">Active</option>
            <option value="Away">Away</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div className="field">
          <label>Reporting Manager</label>
          <SearchableSelect
            value={form.reportingManager || NONE_MANAGER}
            options={managerOptions}
            placeholder="Select reporting manager…"
            searchPlaceholder="Search managers…"
            onChange={(value) =>
              set("reportingManager", value === NONE_MANAGER ? "" : value)
            }
          />
          <p className="role-dropdown-hint">
            Business Development should report to a Sales Manager. That manager
            then sees this person's leads.
          </p>
        </div>

        <div className="field full">
          <label>Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            placeholder="Optional notes about this user..."
          />
        </div>
      </div>

      <div className="role-perm-row">
        <div className="role-picker">
          <div className="role-picker-head">
            <h3>Select Role</h3>
            <p>Permissions auto-fill from role.</p>
          </div>
          <div className="field role-dropdown-field">
            <label>
              Role <span className="required">*</span>
            </label>
            <SearchableSelect
              value={form.role}
              options={roleOptions}
              required
              placeholder="Select role…"
              searchPlaceholder="Search roles…"
              onChange={handleRoleChange}
            />
            <p className="role-dropdown-hint">
              {selectedRole?.description ||
                (roles.length
                  ? "Choose a role to apply its permissions"
                  : "No roles loaded — create roles from the Roles page")}{" "}
              · {selectedRole?.permissions.length ?? form.permissions.length}{" "}
              permissions
            </p>
          </div>
        </div>

        <div className="perm-box">
          <div className="role-picker-head">
            <h3>Permissions</h3>
            <p>
              Role: <strong>{form.role}</strong> · {form.permissions.length}{" "}
              selected
            </p>
          </div>
          <div className="field role-dropdown-field">
            <label>
              Permissions <span className="required">*</span>
            </label>
            <SearchableMultiSelect
              values={permissionKeysToOptions(form.permissions)}
              options={PERM_OPTIONS}
              required
              placeholder="Select permissions…"
              searchPlaceholder="Search permissions…"
              onChange={(next) =>
                set("permissions", optionsToPermissionKeys(next))
              }
            />
          </div>
        </div>
      </div>

      <div className="user-form-actions">
        <button type="button" className="btn btn-secondary dash-cta" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary dash-cta">
          {isEditing ? "Update User" : "Create User"}
        </button>
      </div>
    </form>
  );
}
