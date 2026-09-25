"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import Topbar from "@/components/layout/Topbar";
import RoleForm, { emptyRoleForm } from "@/components/roles/RoleForm";
import PageHeader from "@/components/shared/PageHeader";
import { useRoles } from "@/context/RolesContext";
import { api, ApiError } from "@/lib/api";
import type { AppRole, RoleFormData } from "@/types/role";

export default function EditRolePageClient() {
  const router = useRouter();
  const params = useParams();
  const id = String(params?.id || "");
  const { updateRole, deleteRole } = useRoles();
  const [role, setRole] = useState<AppRole | null>(null);
  const [form, setForm] = useState<RoleFormData>(emptyRoleForm());
  const [status, setStatus] = useState<"loading" | "ready" | "missing">("loading");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setStatus("loading");
    setError("");
    api<{ role: AppRole }>(`/api/roles/${id}`)
      .then((res) => {
        if (cancelled) return;
        setRole(res.role);
        setForm({
          name: res.role.name,
          description: res.role.description || "",
          permissions: [...res.role.permissions],
        });
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("missing");
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (status === "missing") router.replace("/roles");
  }, [status, router]);

  if (status !== "ready" || !role) {
    return (
      <AppShell>
        <Topbar title="Edit Role" subtitle="Loading…" showSearch={false} />
        <section className="content users-page">
          <p>Loading role…</p>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Topbar
        title="Edit Role"
        subtitle="Update role name and permissions"
        showSearch={false}
      />

      <section className="content users-page">
        <PageHeader
          title="Edit Role"
          subtitle="Change description and permissions for this role."
          crumbs={[
            { label: "Roles", href: "/roles" },
            { label: role.name },
          ]}
          actions={
            <Link href="/roles" className="btn btn-secondary dash-cta">
              Back to Roles
            </Link>
          }
        />

        {error ? <div className="cal-flash err">{error}</div> : null}

        <div className="settings-panel">
          <div className="settings-panel-head">
            <div>
              <h2>
                {role.name}
                {role.isSystem ? " · System" : ""}
              </h2>
              <p>Permissions applied when this role is assigned to a user.</p>
            </div>
            {role.name !== "Admin" ? (
              <button
                type="button"
                className="btn btn-secondary dash-cta"
                disabled={saving}
                onClick={() => {
                  if (!confirm(`Delete role "${role.name}"?`)) return;
                  setSaving(true);
                  deleteRole(role.id)
                    .then(() => router.push("/roles"))
                    .catch((err) => {
                      setSaving(false);
                      setError(
                        err instanceof ApiError
                          ? err.message
                          : err instanceof Error
                            ? err.message
                            : "Could not delete role",
                      );
                    });
                }}
              >
                Delete
              </button>
            ) : null}
          </div>
          <div className="settings-body">
            <RoleForm
              form={form}
              isEditing
              isSystem={role.isSystem}
              onChange={setForm}
              onSubmit={async () => {
                setSaving(true);
                setError("");
                try {
                  const updated = await updateRole(id, form);
                  if (updated) setRole(updated);
                  router.push("/roles");
                } catch (err) {
                  setSaving(false);
                  setError(
                    err instanceof ApiError
                      ? err.message
                      : err instanceof Error
                        ? err.message
                        : "Could not update role",
                  );
                }
              }}
              onCancel={() => router.push("/roles")}
            />
          </div>
        </div>
      </section>
    </AppShell>
  );
}
