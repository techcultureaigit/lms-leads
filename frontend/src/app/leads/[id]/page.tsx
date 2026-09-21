import ViewLeadPageClient from "@/components/leads/ViewLeadPageClient";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ViewLeadPage({ params }: Props) {
  const { id } = await params;
  return <ViewLeadPageClient leadId={id} />;
}
