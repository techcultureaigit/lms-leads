import EditUserPageClient from "@/components/users/EditUserPageClient";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditUserPage({ params }: Props) {
  const { id } = await params;
  return <EditUserPageClient userId={id} />;
}
