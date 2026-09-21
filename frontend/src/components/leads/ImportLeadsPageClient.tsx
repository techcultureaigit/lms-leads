"use client";

import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import Topbar from "@/components/layout/Topbar";
import ImportLeads from "@/components/leads/ImportLeads";
import PageHeader from "@/components/shared/PageHeader";

export default function ImportLeadsPageClient() {
  return (
    <AppShell>
      <Topbar
        title="Import Leads"
        subtitle="Upload CSV or Excel to create multiple leads"
        showSearch={false}
      />

      <section className="content">
        <PageHeader
          title="Import Leads"
          subtitle="Upload CSV or Excel — preview, then import to the pipeline."
          crumbs={[
            { label: "Leads", href: "/leads" },
            { label: "Import Leads" },
          ]}
          actions={
            <>
              <Link href="/leads" className="btn btn-secondary dash-cta">
                Back to List
              </Link>
              <Link href="/leads/create" className="btn btn-primary dash-cta">
                Create Manually
              </Link>
            </>
          }
        />

        <div className="panel">
          <ImportLeads />
        </div>
      </section>
    </AppShell>
  );
}
