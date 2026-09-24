export type LeadStatus =
  | "New"
  | "In Process"
  | "Meeting"
  | "Lost"
  | "Completed";

export type LeadSource = "Self" | "Google" | "Facebook" | "Campaign" | "";

export type MeetingType = "Online" | "Offline" | "";

export interface Lead {
  id: string;
  entity: string;
  contact: string;
  mobile: string;
  email: string;
  location: string;
  website?: string;
  products: string[];
  status: LeadStatus;
  leadSource?: LeadSource | string;
  owner: string;
  assigned: string;
  followup: string;
  notes?: string;
  key: string;
  meetingDate?: string;
  meetingType?: MeetingType;
  meetingLink?: string;
  lostDate?: string;
  wonDate?: string;
}

export type LeadFormData = {
  assigned: string;
  location: string;
  status: LeadStatus;
  entity: string;
  website: string;
  owner: string;
  contact: string;
  products: string[];
  followup: string;
  mobile: string;
  notes: string;
  email: string;
  leadSource: LeadSource | string;
  meetingDate: string;
  meetingType: MeetingType;
  meetingLink: string;
  lostDate: string;
  wonDate: string;
};
