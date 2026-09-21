"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import Topbar from "@/components/layout/Topbar";
import LeadActivityTimeline from "@/components/leads/LeadActivityTimeline";
import LeadForm from "@/components/leads/LeadForm";
import PageHeader from "@/components/shared/PageHeader";
import { useLeads } from "@/context/LeadsContext";
import { ApiError } from "@/lib/api";
import { emptyForm, leadToForm } from "@/lib/format";
import type { Lead, LeadFormData } from "@/types/lead";

export default function EditLeadPageClient({ leadId }: { leadId: string }) {
  const router = useRouter();
  const {
    fetchLead,
    updateLead,
    getActivities,
    loadActivities,
    addNote,
  } = useLeads();
  const [lead, setLead] = useState<Lead | null>(null);
  const [form, setForm] = useState<LeadFormData>(emptyForm());
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const activities = getActivities(leadId);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setReady(false);
      setError("");
      const found = await fetchLead(leadId);
      if (cancelled) return;
      if (!found) {
        router.replace("/leads");
        return;
      }
      setLead(found);
      setForm(leadToForm(found));
      setReady(true);
      loadActivities(leadId).catch(() => undefined);
    })();
    return () => {
      cancelled = true;
    };
  }, [leadId, fetchLead, loadActivities, router]);

  if (!ready || !lead) {
    return (
      <AppShell>
        <Topbar title="Edit Lead" showSearch={false} />
        <section className="content">
          <div className="empty">Loading lead from API…</div>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Topbar
        title="Edit Lead"
        subtitle={`Updating ${lead.entity}`}
        showSearch={false}
      />

      <section className="content lead-form-page">
        <PageHeader
          title="Edit Lead"
          subtitle="Update details and track every change on the timeline."
          crumbs={[
            { label: "Leads", href: "/leads" },
            { label: lead.entity },
          ]}
          actions={
            <Link href="/leads" className="btn btn-secondary dash-cta">
              Back to List
            </Link>
          }
        />

        {error ? <div className="cal-flash err">{error}</div> : null}

        <div className="edit-lead-layout">
          <div className="panel lead-form-panel">
            <div className="panel-header">
              <div>
                <h2>{lead.entity}</h2>
                <p className="hint">ID #{lead.id.slice(-6)}</p>
              </div>
            </div>
            <LeadForm
              form={form}
              isEditing
              onChange={setForm}
              onSubmit={async () => {
                setSaving(true);
                setError("");
                try {
                  const updated = await updateLead(leadId, form);
                  if (updated) setLead(updated);
                  router.push("/leads");
                } catch (e) {
                  setError(
                    e instanceof ApiError ? e.message : "Failed to update lead",
                  );
                } finally {
                  setSaving(false);
                }
              }}
              onCancel={() => router.push("/leads")}
            />
            {saving ? (
              <p className="hint" style={{ padding: 16 }}>
                Saving…
              </p>
            ) : null}
          </div>

          <div className="panel activity-side-panel">
            <LeadActivityTimeline
              activities={activities}
              onAddNote={(message) => addNote(leadId, message)}
            />
          </div>
        </div>
      </section>
    </AppShell>
  );
}
