import type { Lead, LeadStatus } from "@/types/lead";
import { DEMO_TODAY } from "@/lib/demoDate";

export type AgendaKind = "followup" | "meeting";

export type AgendaItem = {
  id: string;
  entity: string;
  contact: string;
  owner: string;
  status: LeadStatus;
  type: string;
  kind: AgendaKind;
  when: string;
  meetingType?: string;
};

export function getAgendaForDate(
  leads: Lead[],
  date: string = DEMO_TODAY,
): AgendaItem[] {
  const items: AgendaItem[] = [];

  for (const l of leads) {
    if (l.followup === date) {
      items.push({
        id: l.id,
        entity: l.entity,
        contact: l.contact,
        owner: l.owner,
        status: l.status,
        type: "Follow-up",
        kind: "followup",
        when: l.followup,
      });
    }
    if (l.meetingDate === date) {
      items.push({
        id: l.id,
        entity: l.entity,
        contact: l.contact,
        owner: l.owner,
        status: l.status,
        type: l.meetingType ? `Meeting · ${l.meetingType}` : "Meeting",
        kind: "meeting",
        when: l.meetingDate,
        meetingType: l.meetingType,
      });
    }
  }

  return items.sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === "meeting" ? -1 : 1;
    return a.entity.localeCompare(b.entity);
  });
}
