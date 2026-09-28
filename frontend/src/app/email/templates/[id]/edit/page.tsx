"use client";

import { useParams } from "next/navigation";
import EmailTemplateEditor from "@/components/email/EmailTemplateEditor";

export default function EditEmailTemplatePage() {
  const params = useParams();
  const id = String(params?.id || "");
  return <EmailTemplateEditor templateId={id} />;
}
