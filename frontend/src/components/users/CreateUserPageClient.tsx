"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import Topbar from "@/components/layout/Topbar";
import UserForm, { emptyUserForm } from "@/components/users/UserForm";
import PageHeader from "@/components/shared/PageHeader";
import { useUsers } from "@/context/UsersContext";
import { ApiError } from "@/lib/api";
import type { UserFormData } from "@/types/user";

export default function CreateUserPageClient() {
  const router = useRouter();
  const { createUser } = useUsers();
  const [form, setForm] = useState<UserFormData>(emptyUserForm());
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  return (
    <AppShell>
      <Topbar
        title="Create User"
        subtitle="Role-based access for the lead workspace"
        showSearch={false}
      />

      <section className="content users-page">
        <PageHeader
          title="Create User"
          subtitle="Add a teammate and assign a role with permissions."
          crumbs={[
            { label: "Users", href: "/users" },
            { label: "Create User" },
          ]}
          actions={
            <Link href="/users" className="btn btn-secondary dash-cta">
              Back to Users
            </Link>
          }
        />

        <div className="settings-panel">
          <div className="settings-panel-head">
            <div>
              <h2>User Details & Role</h2>
              <p>
                {saving
                  ? "Saving user…"
                  : "Choose a role to auto-apply permissions, then customize if needed."}
              </p>
            </div>
          </div>
          <div className="settings-body">
            {error ? <div className="cal-flash err">{error}</div> : null}
            <UserForm
              form={form}
              onChange={setForm}
              onSubmit={async () => {
                setSaving(true);
                setError("");
                try {
                  await createUser(form);
                  router.push("/users");
                } catch (e) {
                  setError(
                    e instanceof ApiError ? e.message : "Failed to create user",
                  );
                  setSaving(false);
                }
              }}
              onCancel={() => router.push("/users")}
            />
          </div>
        </div>
      </section>
    </AppShell>
  );
}
