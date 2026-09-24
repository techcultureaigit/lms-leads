"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import Topbar from "@/components/layout/Topbar";
import LeadsTable from "@/components/leads/LeadsTable";
import PageHeader from "@/components/shared/PageHeader";
import { useLeads } from "@/context/LeadsContext";
import type { Lead } from "@/types/lead";

function exportLeadsCsv(rows: Lead[], filename: string) {
  const headers = [
    "Entity Name",
    "Contact Person",
    "Mobile No",
    "Email Id",
    "Location",
    "Products",
    "Lead Status",
    "Lead Source",
    "Lead Owner",
    "Assigned User",
    "Follow-up",
    "Key Dates",
  ];
  const body = rows.map((l) => [
    l.entity,
    l.contact,
    l.mobile,
    l.email,
    l.location,
    l.products.join("|"),
    l.status,
    l.leadSource || "",
    l.owner,
    l.assigned,
    l.followup,
    l.key,
  ]);
  const csv = [headers, ...body]
    .map((r) =>
      r.map((v) => `"${String(v || "").replace(/"/g, '""')}"`).join(","),
    )
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

function LeadsListInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    leads,
    deleteLead,
  } = useLeads();
  const [globalSearch, setGlobalSearch] = useState("");
  const [tableSearch, setTableSearch] = useState("");

  const initialFilters = useMemo(
    () => ({
      status: searchParams.get("status") || "",
      owner: searchParams.get("owner") || "",
      product: searchParams.get("product") || "",
      overdue: searchParams.get("overdue") === "1",
    }),
    [searchParams],
  );

  const query = (tableSearch || globalSearch).trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!query) return leads;
    return leads.filter((l) =>
      Object.values(l).join(" ").toLowerCase().includes(query),
    );
  }, [leads, query]);

  return (
    <AppShell>
      <Topbar
        title="Leads"
        subtitle="All opportunities in one list"
        search={globalSearch}
        onSearchChange={setGlobalSearch}
        searchPlaceholder="Search leads, company, contact..."
      />

      <section className="content leads-page">
        <PageHeader
          title="Leads List"
          subtitle="Filter, sort, paginate and manage every lead from here."
          crumbs={[{ label: "Leads" }, { label: "Leads List" }]}
          actions={
            <>
              <Link href="/leads/import" className="btn btn-secondary dash-cta">
                Import Leads
              </Link>
              <Link href="/leads/create" className="btn btn-primary dash-cta">
                Create Lead
              </Link>
            </>
          }
        />

        <LeadsTable
          key={searchParams.toString()}
          leads={filtered}
          tableSearch={tableSearch}
          onTableSearch={setTableSearch}
          initialFilters={initialFilters}
          onView={(id) => router.push(`/leads/${id}`)}
          onEdit={(id) => router.push(`/leads/${id}/edit`)}
          onDelete={(id) => {
            if (confirm("Delete this lead?")) deleteLead(id);
          }}
          onExport={() => exportLeadsCsv(filtered, "leads.csv")}
        />
      </section>
    </AppShell>
  );
}

export default function LeadsListPageClient() {
  return (
    <Suspense
      fallback={
        <AppShell>
          <Topbar title="Leads" subtitle="Loading…" showSearch={false} />
          <section className="content">
            <div className="panel">
              <div className="table-empty">
                <h3>Loading leads…</h3>
              </div>
            </div>
          </section>
        </AppShell>
      }
    >
      <LeadsListInner />
    </Suspense>
  );
}
