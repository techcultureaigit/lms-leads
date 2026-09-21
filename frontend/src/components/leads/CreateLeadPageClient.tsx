"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import Topbar from "@/components/layout/Topbar";
import LeadForm from "@/components/leads/LeadForm";
import PageHeader from "@/components/shared/PageHeader";
import { useLeads } from "@/context/LeadsContext";
import { ApiError } from "@/lib/api";
import { emptyForm } from "@/lib/format";
import type { LeadFormData } from "@/types/lead";

export default function CreateLeadPageClient() {
  const router = useRouter();
  const { createLead } = useLeads();
  const [form, setForm] = useState<LeadFormData>(emptyForm());
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    setError("");
    try {
      await createLead(form);
      router.push("/leads");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to create lead");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <Topbar
        title="Create Lead"
        subtitle="Add a new opportunity to the pipeline"
        showSearch={false}
      />

      <section className="content lead-form-page">
        <PageHeader
          title="Create Lead"
          subtitle="Fill required fields and save to the leads list."
          crumbs={[
            { label: "Leads", href: "/leads" },
            { label: "Create Lead" },
          ]}
          actions={
            <Link href="/leads" className="btn btn-secondary dash-cta">
              Back to List
            </Link>
          }
        />

        {error ? <div className="cal-flash err">{error}</div> : null}

        <div className="panel lead-form-panel">
          <div className="panel-header">
            <div>
              <h2>Lead Details</h2>
              <p className="hint">
                {saving
                  ? "Saving to API…"
                  : "Manual entry with status-based date fields"}
              </p>
            </div>
          </div>
          <LeadForm
            form={form}
            isEditing={false}
            onChange={setForm}
            onSubmit={handleSubmit}
            onCancel={() => router.push("/leads")}
          />
        </div>
      </section>
    </AppShell>
  );
}
