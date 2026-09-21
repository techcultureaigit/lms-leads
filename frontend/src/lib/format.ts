import type { Lead, LeadFormData, LeadStatus } from "@/types/lead";

export function formatDate(d?: string) {
  if (!d) return "—";
  const [y, m, day] = d.split("-");
  if (!y || !m || !day) return d;
  return `${day}-${m}-${y}`;
}

export function statusClass(status: LeadStatus) {
  return status.toLowerCase().replace(" ", "");
}

export function buildKeyDates(data: Pick<
  LeadFormData,
  "status" | "meetingDate" | "meetingType" | "lostDate" | "wonDate"
>) {
  if (data.status === "Meeting" && data.meetingDate) {
    return `Meeting: ${data.meetingDate} (${data.meetingType || "Online"})`;
  }
  if (data.status === "Lost" && data.lostDate) {
    return `Lost: ${data.lostDate}`;
  }
  if (data.status === "Completed" && data.wonDate) {
    return `Won: ${data.wonDate}`;
  }
  return "";
}

export function emptyForm(): LeadFormData {
  return {
    assigned: "",
    location: "",
    status: "New",
    entity: "",
    website: "",
    owner: "",
    contact: "",
    products: [],
    followup: "",
    mobile: "",
    notes: "",
    email: "",
    meetingDate: "",
    meetingType: "",
    meetingLink: "",
    lostDate: "",
    wonDate: "",
  };
}

export function leadToForm(lead: Lead): LeadFormData {
  return {
    assigned: lead.assigned,
    location: lead.location,
    status: lead.status,
    entity: lead.entity,
    website: lead.website || "",
    owner: lead.owner,
    contact: lead.contact,
    products: [...lead.products],
    followup: lead.followup,
    mobile: lead.mobile,
    notes: lead.notes || "",
    email: lead.email,
    meetingDate: lead.meetingDate || "",
    meetingType: lead.meetingType || "",
    meetingLink: lead.meetingLink || "",
    lostDate: lead.lostDate || "",
    wonDate: lead.wonDate || "",
  };
}

export function formToLead(data: LeadFormData, id: string): Lead {
  return {
    id,
    entity: data.entity.trim(),
    contact: data.contact.trim(),
    mobile: data.mobile.trim(),
    email: data.email.trim(),
    location: data.location.trim(),
    website: data.website.trim(),
    products: data.products,
    status: data.status,
    owner: data.owner,
    assigned: data.assigned,
    followup: data.followup,
    notes: data.notes.trim(),
    key: buildKeyDates(data),
    meetingDate: data.meetingDate,
    meetingType: data.meetingType,
    meetingLink: data.meetingLink,
    lostDate: data.lostDate,
    wonDate: data.wonDate,
  };
}
