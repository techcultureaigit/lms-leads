"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import Topbar from "@/components/layout/Topbar";
import RoleForm, { emptyRoleForm } from "@/components/roles/RoleForm";
import PageHeader from "@/components/shared/PageHeader";
import { useRoles } from "@/context/RolesContext";
import type { RoleFormData } from "@/types/role";

export default function CreateRolePageClient() {
  const router = useRouter();
  const { createRole } = useRoles();
  const [form, setForm] = useState<RoleFormData>(emptyRoleForm());

  return (
    <AppShell>
      <Topbar
        title="Create Role"
        subtitle="Define name and permissions for a new role"
        showSearch={false}
      />

      <section className="content users-page">
        <PageHeader
          title="Create Role"
          subtitle="Pick permissions this role should grant to users."
          crumbs={[
            { label: "Roles", href: "/roles" },
            { label: "Create Role" },
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
              <h2>Role Details & Permissions</h2>
              <p>Name the role, then select full CRUD-style permissions as needed.</p>
            </div>
          </div>
          <div className="settings-body">
            <RoleForm
              form={form}
              onChange={setForm}
              onSubmit={async () => {
                try {
                  await createRole(form);
                  router.push("/roles");
                } catch (err) {
                  alert(
                    err instanceof Error ? err.message : "Could not create role",
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
