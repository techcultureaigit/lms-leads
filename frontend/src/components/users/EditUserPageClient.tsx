"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import Topbar from "@/components/layout/Topbar";
import UserForm, { emptyUserForm } from "@/components/users/UserForm";
import PageHeader from "@/components/shared/PageHeader";
import { useUsers } from "@/context/UsersContext";
import { ApiError } from "@/lib/api";
import type { UserFormData } from "@/types/user";

export default function EditUserPageClient({ userId }: { userId: string }) {
  const router = useRouter();
  const { getUser, updateUser, loading } = useUsers();
  const user = getUser(userId);
  const [form, setForm] = useState<UserFormData>(emptyUserForm());
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/users");
      return;
    }
    setForm({
      name: user.name,
      role: user.role,
      email: user.email,
      phone: user.phone,
      status: user.status,
      notes: user.notes || "",
      permissions: [...user.permissions],
      reportingManager: user.reportingManager || "",
      password: "",
    });
    setReady(true);
  }, [user, loading, router]);

  if (loading || !ready || !user) {
    return (
      <AppShell>
        <Topbar title="Edit User" showSearch={false} />
        <section className="content">
          <div className="empty">Loading user...</div>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Topbar
        title="Edit User"
        subtitle={`Updating ${user.name}`}
        showSearch={false}
      />

      <section className="content users-page">
        <PageHeader
          title="Edit User"
          subtitle="Update role, status and permissions for this teammate."
          crumbs={[
            { label: "Users", href: "/users" },
            { label: user.name },
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
              <h2>{user.name}</h2>
              <p>
                {user.role} · ID #{user.id}
              </p>
            </div>
          </div>
          <div className="settings-body">
            {error ? <div className="cal-flash err">{error}</div> : null}
            <UserForm
              form={form}
              isEditing
              excludeManagerName={user.name}
              onChange={setForm}
              onSubmit={async () => {
                setError("");
                try {
                  await updateUser(userId, form);
                  router.push("/users");
                } catch (e) {
                  setError(
                    e instanceof ApiError ? e.message : "Failed to update user",
                  );
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
