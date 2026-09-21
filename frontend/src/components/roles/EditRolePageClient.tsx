"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import Topbar from "@/components/layout/Topbar";
import RoleForm, { emptyRoleForm } from "@/components/roles/RoleForm";
import PageHeader from "@/components/shared/PageHeader";
import { useRoles } from "@/context/RolesContext";
import type { RoleFormData } from "@/types/role";

export default function EditRolePageClient() {
  const router = useRouter();
  const params = useParams();
  const id = String(params?.id || "");
  const { getRole, updateRole, loading } = useRoles();
  const role = getRole(id);
  const [form, setForm] = useState<RoleFormData>(emptyRoleForm());

  useEffect(() => {
    if (!id || loading) return;
    if (!role) {
      router.replace("/roles");
      return;
    }
    setForm({
      name: role.name,
      description: role.description || "",
      permissions: [...role.permissions],
    });
  }, [id, role, router, loading]);

  if (loading && !role) {
    return (
      <AppShell>
        <Topbar title="Edit Role" subtitle="Loading…" showSearch={false} />
        <section className="content users-page">
          <p>Loading role…</p>
        </section>
      </AppShell>
    );
  }

  if (!role) return null;

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

        <div className="settings-panel">
          <div className="settings-panel-head">
            <div>
              <h2>
                {role.name}
                {role.isSystem ? " · System" : ""}
              </h2>
              <p>Permissions applied when this role is assigned to a user.</p>
            </div>
          </div>
          <div className="settings-body">
            <RoleForm
              form={form}
              isEditing
              isSystem={role.isSystem}
              onChange={setForm}
              onSubmit={async () => {
                try {
                  await updateRole(id, form);
                  router.push("/roles");
                } catch (err) {
                  alert(
                    err instanceof Error ? err.message : "Could not update role",
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
