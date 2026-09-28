"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import Topbar from "@/components/layout/Topbar";
import PageHeader from "@/components/shared/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError } from "@/lib/api";
import { hasPermission } from "@/lib/permissions";

type Template = {
  id: string;
  name: string;
  subject: string;
  description: string;
  category: string;
  html: string;
  isActive: boolean;
  usageCount: number;
  createdBy: string;
  updatedBy: string;
  createdAt?: string;
  updatedAt?: string;
};

export default function EmailTemplateViewPageClient() {
  const params = useParams();
  const id = String(params?.id || "");
  const { user } = useAuth();
  const canEdit = hasPermission(user?.permissions, "email.create");
  const [template, setTemplate] = useState<Template | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    api<{ template: Template }>(`/api/email-templates/${id}`)
      .then((res) => setTemplate(res.template))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load template"));
  }, [id]);

  return (
    <AppShell>
      <Topbar title="View template" showSearch={false} />
      <section className="content email-page">
        <PageHeader
          title={template?.name || "View template"}
          subtitle={template?.subject || "Read-only preview of this email."}
          crumbs={[
            { label: "Email Templates", href: "/email/templates" },
            { label: template?.name || "View" },
          ]}
          actions={
            <>
              <Link href="/email/templates" className="btn btn-secondary dash-cta">Back</Link>
              {canEdit && template ? (
                <Link href={`/email/templates/${template.id}/edit`} className="btn btn-primary dash-cta">Edit</Link>
              ) : null}
            </>
          }
        />
        {error ? <div className="cal-flash err">{error}</div> : null}
        {!template && !error ? <p>Loading template…</p> : null}
        {template ? (
          <>
            <div className="email-view-meta">
              <div><span>Category</span><strong>{template.category || "general"}</strong></div>
              <div><span>Status</span><strong>{template.isActive ? "Active" : "Inactive"}</strong></div>
              <div><span>Usage</span><strong>{template.usageCount}</strong></div>
              <div><span>Created</span><strong>{template.createdAt ? new Date(template.createdAt).toLocaleString() : "—"}</strong></div>
            </div>
            {template.description ? <p className="email-view-desc">{template.description}</p> : null}
            <div className="settings-panel">
              <div className="settings-panel-head"><h2>Preview</h2></div>
              <div className="settings-body">
                <iframe title="Email preview" className="email-preview" srcDoc={template.html || "<p>No content</p>"} />
              </div>
            </div>
          </>
        ) : null}
      </section>
    </AppShell>
  );
}
