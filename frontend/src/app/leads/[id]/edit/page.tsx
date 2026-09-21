import EditLeadPageClient from "@/components/leads/EditLeadPageClient";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditLeadPage({ params }: Props) {
  const { id } = await params;
  return <EditLeadPageClient leadId={id} />;
}
