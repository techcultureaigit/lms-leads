import { LEAD_STATUSES, PRODUCTS } from "@/lib/constants";
import type {
  FilterCondition,
  FilterFieldDef,
  FilterJoin,
  FilterOperator,
} from "@/types/filter";
import type { Lead } from "@/types/lead";

export function getFilterFields(leadSources: string[] = []): FilterFieldDef[] {
  return [
    { key: "entity", label: "Entity Name", type: "text" },
    { key: "contact", label: "Contact Person", type: "text" },
    { key: "mobile", label: "Mobile No", type: "text" },
    { key: "email", label: "Email Id", type: "text" },
    { key: "location", label: "Location", type: "text" },
    { key: "website", label: "Website", type: "text" },
    { key: "status", label: "Lead Status", type: "select", options: [...LEAD_STATUSES] },
    {
      key: "leadSource",
      label: "Lead Source",
      type: "select",
      options: leadSources.length ? leadSources : ["Self", "Google", "Facebook", "Campaign"],
    },
    { key: "owner", label: "Lead Owner", type: "text" },
    { key: "assigned", label: "Assigned User", type: "text" },
    { key: "products", label: "Products", type: "select", options: [...PRODUCTS] },
    { key: "followup", label: "Follow-up Date", type: "date" },
    { key: "meetingDate", label: "Meeting Date", type: "date" },
    { key: "meetingType", label: "Meeting Type", type: "select", options: ["Online", "Offline"] },
    { key: "notes", label: "Notes", type: "text" },
    { key: "lostDate", label: "Lost Date", type: "date" },
    { key: "wonDate", label: "Won Date", type: "date" },
  ];
}

/** @deprecated Prefer getFilterFields(leadSources) for dynamic sources */
export const FILTER_FIELDS: FilterFieldDef[] = getFilterFields();

export const FILTER_OPERATORS: { value: FilterOperator; label: string }[] = [
  { value: "contains", label: "Contains" },
  { value: "equals", label: "Equals" },
  { value: "not_equals", label: "Not equals" },
  { value: "starts_with", label: "Starts with" },
  { value: "is_empty", label: "Is empty" },
  { value: "is_not_empty", label: "Is not empty" },
  { value: "gt", label: "Greater than" },
  { value: "lt", label: "Less than" },
];

function fieldValue(lead: Lead, field: string): string {
  const raw = (lead as unknown as Record<string, unknown>)[field];
  if (Array.isArray(raw)) return raw.join(" ").toLowerCase();
  return String(raw ?? "").toLowerCase();
}

function matchCondition(lead: Lead, c: FilterCondition): boolean {
  const left = fieldValue(lead, c.field);
  const right = (c.value || "").toLowerCase().trim();

  switch (c.operator) {
    case "contains":
      return right ? left.includes(right) : true;
    case "equals":
      if (c.field === "products") {
        return (lead.products || []).some(
          (p) => p.toLowerCase() === right,
        );
      }
      return left === right;
    case "not_equals":
      return left !== right;
    case "starts_with":
      return right ? left.startsWith(right) : true;
    case "is_empty":
      return !left.trim();
    case "is_not_empty":
      return Boolean(left.trim());
    case "gt":
      return Boolean(right) && left > right;
    case "lt":
      return Boolean(right) && left < right && Boolean(left);
    default:
      return true;
  }
}

/** Evaluate conditions with pairwise AND/OR joins (left-to-right). */
export function applySavedFilter(
  leads: Lead[],
  conditions: FilterCondition[],
  joins: FilterJoin[] = [],
): Lead[] {
  if (!conditions.length) return leads;

  return leads.filter((lead) => {
    let result = matchCondition(lead, conditions[0]);
    for (let i = 1; i < conditions.length; i++) {
      const join = joins[i - 1] || "AND";
      const next = matchCondition(lead, conditions[i]);
      result = join === "OR" ? result || next : result && next;
    }
    return result;
  });
}

export function emptyCondition(): FilterCondition {
  return {
    field: "entity",
    operator: "contains",
    value: "",
  };
}
