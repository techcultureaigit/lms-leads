import { User } from "../models/User.js";

function roleKey(user) {
  return String(user?.role || "").trim().toLowerCase();
}

export function isAdminRole(user) {
  return roleKey(user) === "admin";
}

export function isSalesManagerRole(user) {
  const key = roleKey(user);
  return key === "sales manager" || key === "sales lead";
}

export function seesAllLeads(user) {
  return isAdminRole(user);
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** null means every lead. Otherwise the owner/assigned names this user may see. */
export async function getVisibleNames(user) {
  if (seesAllLeads(user)) return null;
  const name = String(user?.name || "").trim();
  if (!name) return [];
  if (!isSalesManagerRole(user)) return [name];

  const team = await User.find({
    reportingManager: new RegExp(`^${escapeRegex(name)}$`, "i"),
  }).select("name");
  return [
    ...new Set([name, ...team.map((member) => String(member.name || "").trim()).filter(Boolean)]),
  ];
}

export async function leadAccessFilter(user) {
  const names = await getVisibleNames(user);
  if (names === null) return null;
  if (!names.length) return { _id: null };
  return { $or: [{ assigned: { $in: names } }, { owner: { $in: names } }] };
}

export async function canAccessLead(lead, user) {
  if (!lead) return false;
  const names = await getVisibleNames(user);
  if (names === null) return true;
  return names.includes(lead.assigned) || names.includes(lead.owner);
}
