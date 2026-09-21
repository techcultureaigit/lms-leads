export type LeadActivityType =
  | "created"
  | "note"
  | "status_change"
  | "followup"
  | "meeting"
  | "assignment"
  | "system";

export interface LeadActivity {
  id: string;
  leadId: string;
  type: LeadActivityType;
  message: string;
  createdAt: string;
  actor: string;
  meta?: {
    from?: string;
    to?: string;
  };
}
