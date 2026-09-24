import type { LeadSource, LeadStatus } from "@/types/lead";

export const USERS = [
  "Amit Sharma",
  "Neha Verma",
  "Rohit Kumar",
  "Sneha Iyer",
] as const;

export const PRODUCTS = [
  "Mobile App",
  "Mutual Fund",
  "Website",
  "IPO",
  "LMS",
  "Ecommerce",
  "CRM",
  "Digital Market",
  "Ticketing System",
  "SEO",
  "Client Onboarding",
  "Client Modifications Tools",
] as const;

export const LEAD_STATUSES: LeadStatus[] = [
  "New",
  "In Process",
  "Meeting",
  "Lost",
  "Completed",
];

export const LEAD_SOURCES: Exclude<LeadSource, "">[] = [
  "Self",
  "Google",
  "Facebook",
  "Campaign",
];

export const TEAM_USERS = [
  {
    id: 1,
    name: "Amit Sharma",
    role: "Sales Lead",
    email: "amit@techculture.in",
    phone: "9876500001",
    status: "Active",
    leads: 18,
    initials: "AS",
  },
  {
    id: 2,
    name: "Neha Verma",
    role: "Account Executive",
    email: "neha@techculture.in",
    phone: "9876500002",
    status: "Active",
    leads: 14,
    initials: "NV",
  },
  {
    id: 3,
    name: "Rohit Kumar",
    role: "Business Development",
    email: "rohit@techculture.in",
    phone: "9876500003",
    status: "Active",
    leads: 11,
    initials: "RK",
  },
  {
    id: 4,
    name: "Sneha Iyer",
    role: "Relationship Manager",
    email: "sneha@techculture.in",
    phone: "9876500004",
    status: "Away",
    leads: 9,
    initials: "SI",
  },
] as const;
