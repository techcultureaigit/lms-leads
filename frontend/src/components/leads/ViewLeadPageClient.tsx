"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import Topbar from "@/components/layout/Topbar";
import LeadActivityTimeline from "@/components/leads/LeadActivityTimeline";
import PageHeader from "@/components/shared/PageHeader";
import { useLeads } from "@/context/LeadsContext";
import { formatDate, statusClass } from "@/lib/format";
import type { Lead } from "@/types/lead";

export default function ViewLeadPageClient({ leadId }: { leadId: string }) {
  const router = useRouter();
  const { fetchLead, getActivities, loadActivities, addNote } = useLeads();
  const [lead, setLead] = useState<Lead | null>(null);
  const [ready, setReady] = useState(false);
  const activities = getActivities(leadId);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setReady(false);
      const found = await fetchLead(leadId);
      if (cancelled) return;
      if (!found) {
        router.replace("/leads");
        return;
      }
      setLead(found);
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
        <Topbar showSearch={false} />
        <section className="content">
          <div className="empty">Loading lead…</div>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Topbar showSearch={false} />

      <section className="content">
        <PageHeader
          title="View Lead"
          crumbs={[
            { label: "Leads", href: "/leads" },
            { label: lead.entity },
          ]}
          actions={
            <>
              <Link href="/leads" className="btn btn-secondary dash-cta">
                Back to List
              </Link>
              <Link
                href={`/leads/${lead.id}/edit`}
                className="btn btn-primary dash-cta"
              >
                Edit Lead
              </Link>
            </>
          }
        />

        <div className="edit-lead-layout">
          <div className="panel">
            <div className="panel-header">
              <div>
                <h2>{lead.entity}</h2>
                <p className="hint">ID #{lead.id.slice(-6)}</p>
              </div>
              <span className={`status ${statusClass(lead.status)}`}>
                {lead.status}
              </span>
            </div>

            <div className="lead-view-grid">
              <div>
                <b>Entity Name</b>
                <p>{lead.entity}</p>
              </div>
              <div>
                <b>Contact Person</b>
                <p>{lead.contact}</p>
              </div>
              <div>
                <b>Mobile No</b>
                <p>+91 {lead.mobile}</p>
              </div>
              <div>
                <b>Email Id</b>
                <p>{lead.email || "—"}</p>
              </div>
              <div>
                <b>Location</b>
                <p>{lead.location || "—"}</p>
              </div>
              <div>
                <b>Website</b>
                <p>{lead.website || "—"}</p>
              </div>
              <div>
                <b>Assigned User</b>
                <p>{lead.assigned || "—"}</p>
              </div>
              <div>
                <b>Lead Owner</b>
                <p>{lead.owner || "—"}</p>
              </div>
              <div>
                <b>Lead Status</b>
                <p>{lead.status}</p>
              </div>
              <div>
                <b>Follow-up Date</b>
                <p>{formatDate(lead.followup)}</p>
              </div>
              <div className="lead-view-full">
                <b>Products</b>
                <p>{lead.products.length ? lead.products.join(", ") : "—"}</p>
              </div>
              <div className="lead-view-full">
                <b>Key Dates / Meeting Details</b>
                <p>{lead.key || "—"}</p>
              </div>
              {lead.meetingType === "Online" && lead.meetingLink ? (
                <div className="lead-view-full">
                  <b>Meeting Link</b>
                  <p>
                    <a
                      href={lead.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-link"
                    >
                      {lead.meetingLink}
                    </a>
                  </p>
                </div>
              ) : null}
              <div className="lead-view-full">
                <b>Latest Notes</b>
                <p>{lead.notes || "—"}</p>
              </div>
            </div>
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
