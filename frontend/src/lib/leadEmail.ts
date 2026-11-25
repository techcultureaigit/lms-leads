const KEY = "lms-email-lead-ids";

export function queueLeadEmail(ids: string[] | "all") {
  sessionStorage.setItem(KEY, ids === "all" ? "all" : JSON.stringify(ids));
}

export function takeQueuedLeadEmail(): string[] | "all" | null {
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return null;
  sessionStorage.removeItem(KEY);
  if (raw === "all") return "all";
  try {
    const ids = JSON.parse(raw);
    return Array.isArray(ids) ? ids.filter((id) => typeof id === "string") : null;
  } catch {
    return null;
  }
}
