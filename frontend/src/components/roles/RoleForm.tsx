"use client";

import { ALL_PERMISSIONS } from "@/lib/roles";
import SearchableMultiSelect from "@/components/shared/SearchableMultiSelect";
import type { Permission } from "@/types/user";
import type { RoleFormData } from "@/types/role";

type RoleFormProps = {
  form: RoleFormData;
  isEditing?: boolean;
  isSystem?: boolean;
  onChange: (next: RoleFormData) => void;
  onSubmit: () => void;
  onCancel: () => void;
};

const PERM_OPTIONS = ALL_PERMISSIONS.map((p) => `${p.group} · ${p.label}`);

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

export function emptyRoleForm(): RoleFormData {
  return {
    name: "",
    description: "",
    permissions: ["leads.view"],
  };
}

export default function RoleForm({
  form,
  isEditing = false,
  isSystem = false,
  onChange,
  onSubmit,
  onCancel,
}: RoleFormProps) {
  const set = <K extends keyof RoleFormData>(key: K, value: RoleFormData[K]) => {
    onChange({ ...form, [key]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      alert("Role name is required.");
      return;
    }
    if (!form.permissions.length) {
      alert("Select at least one permission.");
      return;
    }
    onSubmit();
  };

  return (
    <form className="user-form" onSubmit={handleSubmit}>
      <div className="user-form-grid">
        <div className="field">
          <label>
            Role Name <span className="required">*</span>
          </label>
          <input
            className="input"
            required
            value={form.name}
            disabled={isSystem}
            onChange={(e) => set("name", e.target.value)}
            placeholder="e.g. Sales Lead"
          />
          {isSystem ? (
            <p className="role-dropdown-hint">System role name cannot be changed.</p>
          ) : null}
        </div>

        <div className="field full">
          <label>Description</label>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="What this role can do…"
          />
        </div>
      </div>

      <div className="role-perm-row">
        <div className="perm-box" style={{ gridColumn: "1 / -1" }}>
          <div className="role-picker-head">
            <h3>Permissions</h3>
            <p>{form.permissions.length} selected</p>
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
          {isEditing ? "Update Role" : "Create Role"}
        </button>
      </div>
    </form>
  );
}
