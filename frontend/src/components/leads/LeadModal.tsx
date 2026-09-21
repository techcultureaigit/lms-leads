"use client";

import { useEffect } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/format";
import { useLeads } from "@/context/LeadsContext";
import LeadActivityTimeline from "@/components/leads/LeadActivityTimeline";
import type { Lead } from "@/types/lead";

type LeadModalProps = {
  lead: Lead | null;
  onClose: () => void;
};

export default function LeadModal({ lead, onClose }: LeadModalProps) {
  const { getActivities, loadActivities, addNote } = useLeads();
  const activities = lead ? getActivities(lead.id) : [];

  useEffect(() => {
    if (!lead) return;
    loadActivities(lead.id).catch(() => undefined);
  }, [lead, loadActivities]);

  return (
    <div
      className={`modal ${lead ? "show" : ""}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {lead ? (
        <div
          className="modal-box modal-box-wide"
          role="dialog"
          aria-modal="true"
          aria-labelledby="lead-modal-title"
        >
          <div className="modal-head">
            <h3 id="lead-modal-title">Lead Details</h3>
            <button type="button" className="close" onClick={onClose} aria-label="Close">
              ×
            </button>
          </div>
          <div className="modal-body modal-body-split">
            <div className="modal-grid">
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
                <p>{lead.assigned}</p>
              </div>
              <div>
                <b>Lead Owner</b>
                <p>{lead.owner}</p>
              </div>
              <div>
                <b>Lead Status</b>
                <p>{lead.status}</p>
              </div>
              <div>
                <b>Follow-up Date</b>
                <p>{formatDate(lead.followup)}</p>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <b>Products</b>
                <p>{lead.products.join(", ")}</p>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <b>Key Dates / Meeting Details</b>
                <p>{lead.key || "—"}</p>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <b>Latest Notes</b>
                <p>{lead.notes || "—"}</p>
              </div>
            </div>

            <LeadActivityTimeline
              activities={activities}
              onAddNote={(message) => addNote(lead.id, message)}
              compact
            />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
            <Link
              href={`/leads/${lead.id}/edit`}
              className="btn btn-primary"
              onClick={onClose}
            >
              Edit Lead
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
