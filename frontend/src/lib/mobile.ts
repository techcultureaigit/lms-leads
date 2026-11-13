/** Keep digits and hyphens (for landline like 012345-2721727). */
export function normalizePhone(value: unknown): string {
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(Math.round(value));
  }
  const raw = String(value ?? "").trim();
  if (!raw) return "";

  const cleaned = raw
    .replace(/[^\d-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  const digits = cleaned.replace(/\D/g, "");

  // +91 / 91 mobile → 10 digits
  if (digits.length === 12 && digits.startsWith("91") && /^[6-9]/.test(digits.slice(2))) {
    return digits.slice(2);
  }
  // 0 + 10-digit mobile
  if (digits.length === 11 && digits.startsWith("0") && /^[6-9]/.test(digits.slice(1))) {
    return digits.slice(1);
  }

  return cleaned || digits;
}

export function phoneDigits(value: unknown): string {
  return String(value ?? "").replace(/\D/g, "");
}

/** Indian mobile: exactly 10 digits starting 6–9. */
export function isValidMobile(value: unknown): boolean {
  const digits = phoneDigits(value);
  let d = digits;
  if (d.length === 12 && d.startsWith("91")) d = d.slice(2);
  if (d.length === 11 && d.startsWith("0") && /^[6-9]/.test(d.slice(1))) d = d.slice(1);
  return d.length === 10 && /^[6-9]/.test(d);
}

/** Landline / telephone: has digits but is not a 10-digit mobile. */
export function isTelephone(value: unknown): boolean {
  const digits = phoneDigits(value);
  if (!digits) return false;
  return !isValidMobile(value);
}

export type PhoneTypeFilter = "" | "mobile" | "telephone";

export function matchesPhoneType(value: unknown, type: PhoneTypeFilter): boolean {
  if (!type) return true;
  if (type === "mobile") return isValidMobile(value);
  return isTelephone(value);
}
