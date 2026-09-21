import * as XLSX from "xlsx";
import type { LeadFormData, LeadStatus, MeetingType } from "@/types/lead";
import { LEAD_STATUSES } from "@/lib/constants";

export type ImportLeadRow = LeadFormData & { _row?: number };

type FieldKey = keyof LeadFormData;

const FIELD_ALIASES: Record<FieldKey, string[]> = {
  entity: [
    "entity",
    "entity name",
    "trade name",
    "trading name",
    "company",
    "company name",
    "firm",
    "firm name",
    "broker",
    "broker name",
    "brokerage",
    "organization",
    "organisation",
    "org",
    "business",
    "business name",
    "client",
    "client name",
    "shop",
    "shop name",
    "dealer",
    "dealer name",
  ],
  contact: [
    "contact person",
    "contact person name",
    "contact name",
    "person name",
    "person",
    "full name",
    "proprietor",
    "owner name",
    "customer name",
    "client person",
    "name of person",
    "contact",
    "name",
  ],
  mobile: [
    "mobile no",
    "mobile number",
    "mobile",
    "mob no",
    "mob",
    "phone no",
    "phone number",
    "phone",
    "telephone",
    "tel no",
    "tel",
    "cell",
    "cellphone",
    "cell no",
    "whatsapp",
    "whatsapp no",
    "contact no",
    "contact number",
    "contactno",
    "mobileno",
    "ph",
    "ph no",
  ],
  email: ["email id", "email address", "e mail", "email", "mail"],
  location: [
    "location",
    "city",
    "state",
    "address",
    "place",
    "area",
    "district",
    "town",
  ],
  website: ["website", "web site", "website url", "web url", "url"],
  products: ["products interested", "products", "product", "interest"],
  status: ["lead status", "status"],
  owner: ["lead owner", "owned by", "owner"],
  assigned: ["assigned user", "assigned to", "assignee", "assigned"],
  followup: [
    "follow-up date",
    "followup date",
    "follow up date",
    "follow-up",
    "follow up",
    "followup",
  ],
  notes: ["remarks", "notes", "note", "comments", "comment"],
  meetingDate: ["meeting date", "meetingdate", "meet date"],
  meetingType: ["meeting type", "meetingtype", "meet type"],
  meetingLink: ["meeting link", "meet link", "meet url"],
  lostDate: ["lost date", "lostdate"],
  wonDate: ["won date", "wondate", "completed date"],
};

/** Prefer these when multiple headers could match */
const FIELD_PRIORITY: FieldKey[] = [
  "mobile",
  "email",
  "entity",
  "contact",
  "location",
  "website",
  "products",
  "status",
  "owner",
  "assigned",
  "followup",
  "notes",
  "meetingDate",
  "meetingType",
  "meetingLink",
  "lostDate",
  "wonDate",
];

function normHeader(h: unknown): string {
  return String(h || "")
    .trim()
    .toLowerCase()
    .replace(/[#*：:]/g, " ")
    .replace(/[_./\\()-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function scoreHeader(header: string, alias: string): number {
  if (!header || !alias) return 0;
  if (header === alias) return 100;
  if (header.startsWith(alias) || alias.startsWith(header)) return 80;
  // Avoid weak partials like "web" matching "web tech"
  if (alias.length <= 3 && header !== alias) return 0;
  if (header.includes(alias) && alias.length >= 4) return 60;
  if (alias.includes(header) && header.length >= 4) return 40;
  return 0;
}

function pickField(header: string): FieldKey | null {
  let best: { field: FieldKey; score: number } | null = null;
  for (const field of FIELD_PRIORITY) {
    for (const alias of FIELD_ALIASES[field]) {
      const score = scoreHeader(header, alias);
      if (score <= 0) continue;
      // Slight boost for earlier priority fields on equal score
      const pri = 20 - FIELD_PRIORITY.indexOf(field);
      const total = score + pri / 100;
      if (!best || total > best.score) {
        best = { field, score: total };
      }
    }
  }
  return best && best.score >= 40 ? best.field : null;
}

function cellStr(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "number") {
    if (!Number.isFinite(v)) return "";
    // Phone-like numbers (avoid scientific notation)
    if (Math.abs(v) >= 1e9 && Math.abs(v) < 1e13) {
      return String(Math.round(v));
    }
    if (Number.isInteger(v)) return String(v);
    return String(v);
  }
  if (v instanceof Date) {
    return v.toISOString().slice(0, 10);
  }
  return String(v).trim();
}

/** Pull first 10-digit Indian-style mobile from a value */
function extractMobile(v: unknown): string {
  let raw = "";
  if (typeof v === "number" && Number.isFinite(v)) {
    raw = String(Math.round(v));
  } else {
    raw = cellStr(v);
  }
  // keep digits only
  let digits = raw.replace(/\D/g, "");
  // strip leading 91 / 0
  if (digits.length >= 12 && digits.startsWith("91")) {
    digits = digits.slice(-10);
  } else if (digits.length === 11 && digits.startsWith("0")) {
    digits = digits.slice(1);
  } else if (digits.length > 10) {
    digits = digits.slice(-10);
  }
  if (digits.length === 10) return digits;
  return "";
}

function parseProducts(raw: string): string[] {
  return raw
    .split(/[,|;]/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function parseStatus(raw: string): LeadStatus {
  const s = raw.trim();
  const hit = LEAD_STATUSES.find((x) => x.toLowerCase() === s.toLowerCase());
  return hit || "New";
}

function parseMeetingType(raw: string): MeetingType {
  const s = raw.trim().toLowerCase();
  if (s === "offline") return "Offline";
  if (s === "online") return "Online";
  return "";
}

function excelDateToIso(v: unknown): string {
  if (v == null || v === "") return "";
  if (typeof v === "number" && Number.isFinite(v)) {
    const parsed = XLSX.SSF?.parse_date_code?.(v);
    if (parsed) {
      const mm = String(parsed.m).padStart(2, "0");
      const dd = String(parsed.d).padStart(2, "0");
      return `${parsed.y}-${mm}-${dd}`;
    }
  }
  const s = cellStr(v);
  const m1 = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (m1) {
    return `${m1[3]}-${m1[2].padStart(2, "0")}-${m1[1].padStart(2, "0")}`;
  }
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  return s;
}

function countMatches(headers: string[]): number {
  return headers.reduce((n, h) => (h && pickField(h) ? n + 1 : n), 0);
}

/** Find best header row in first few rows (skips title banners) */
function findHeaderRowIndex(raw: (string | number | Date | null)[][]): number {
  let bestIdx = 0;
  let bestScore = -1;
  const limit = Math.min(8, raw.length);
  for (let i = 0; i < limit; i += 1) {
    const headers = (raw[i] || []).map(normHeader);
    const nonEmpty = headers.filter(Boolean).length;
    if (nonEmpty < 2) continue;
    const score = countMatches(headers);
    if (score > bestScore) {
      bestScore = score;
      bestIdx = i;
    }
  }
  return bestIdx;
}

export function parseLeadImportFile(file: ArrayBuffer): {
  headers: string[];
  rows: ImportLeadRow[];
  mapped: Partial<Record<FieldKey, string>>;
  headerRow: number;
} {
  const wb = XLSX.read(file, { type: "array", cellDates: true });
  const sheetName = wb.SheetNames[0];
  if (!sheetName) {
    throw new Error("No sheet found in file");
  }
  const sheet = wb.Sheets[sheetName];
  const raw = XLSX.utils.sheet_to_json<(string | number | Date | null)[]>(
    sheet,
    {
      header: 1,
      defval: "",
      raw: true,
    },
  );

  if (!raw.length) {
    throw new Error("File is empty");
  }

  const headerRow = findHeaderRowIndex(raw);
  const headerRaw = raw[headerRow] || [];
  const headerCells = headerRaw.map(normHeader);
  const mapped: Partial<Record<FieldKey, string>> = {};
  const colIndex: Partial<Record<FieldKey, number>> = {};

  headerCells.forEach((h, idx) => {
    if (!h) return;
    const field = pickField(h);
    if (field && colIndex[field] === undefined) {
      colIndex[field] = idx;
      mapped[field] = String(headerRaw[idx] ?? h);
    }
  });

  // Fallbacks for entity-like columns
  if (colIndex.entity === undefined) {
    const companyIdx = headerCells.findIndex((h) =>
      /trade name|trading name|company|firm|broker|organi[sz]ation|client|dealer|shop|business/.test(
        h,
      ),
    );
    if (companyIdx >= 0) {
      colIndex.entity = companyIdx;
      mapped.entity = String(headerRaw[companyIdx] ?? "");
    }
  }

  // If still no contact, use a generic "name" column that isn't entity
  if (colIndex.contact === undefined) {
    const nameIdx = headerCells.findIndex(
      (h, idx) =>
        (h === "name" || h.endsWith(" name") || h.includes("person")) &&
        idx !== colIndex.entity,
    );
    if (nameIdx >= 0) {
      colIndex.contact = nameIdx;
      mapped.contact = String(headerRaw[nameIdx] ?? "");
    }
  }

  // Mobile fallback by header keywords
  if (colIndex.mobile === undefined) {
    const mobIdx = headerCells.findIndex((h) =>
      /mobile|phone|telephone|whatsapp|tel|cell|\bmob\b|\bph\b/.test(h),
    );
    if (mobIdx >= 0) {
      colIndex.mobile = mobIdx;
      mapped.mobile = String(headerRaw[mobIdx] ?? "");
    }
  }

  // Extra broker-list columns → notes (registration, exchange, validity, web tech, etc.)
  const mappedIndexes = new Set(
    Object.values(colIndex).filter((v): v is number => typeof v === "number"),
  );
  const extraCols = headerCells
    .map((h, idx) => ({ h, idx, label: String(headerRaw[idx] ?? h) }))
    .filter(
      ({ h, idx }) =>
        Boolean(h) &&
        !mappedIndexes.has(idx) &&
        !/^s\.?\s*no$|^sr$|^serial|^id$/.test(h),
    );

  const rows: ImportLeadRow[] = [];
  for (let r = headerRow + 1; r < raw.length; r += 1) {
    const line = raw[r] || [];
    const allEmpty = line.every((c) => cellStr(c) === "");
    if (allEmpty) continue;

    const get = (field: FieldKey) => {
      const idx = colIndex[field];
      if (idx === undefined) return "";
      return cellStr(line[idx]);
    };

    const getDate = (field: FieldKey) => {
      const idx = colIndex[field];
      if (idx === undefined) return "";
      return excelDateToIso(line[idx]);
    };

    let entity = get("entity").trim();
    let contact = get("contact").trim();
    let mobile = "";
    if (colIndex.mobile !== undefined) {
      mobile = extractMobile(line[colIndex.mobile!]);
    }

    // Scan row for a phone if column missing / empty
    if (!mobile) {
      for (const cell of line) {
        const m = extractMobile(cell);
        if (m) {
          mobile = m;
          break;
        }
      }
    }

    if (!entity && contact) entity = contact;
    if (!contact && entity) contact = entity;

    // skip completely useless rows
    if (!entity && !contact && !mobile) continue;

    const status = parseStatus(get("status") || "New");
    const meetingType =
      parseMeetingType(get("meetingType")) ||
      (status === "Meeting" ? "Online" : "");

    const extraNotes = extraCols
      .map(({ label, idx }) => {
        const val = cellStr(line[idx]);
        return val ? `${label}: ${val}` : "";
      })
      .filter(Boolean)
      .join(" · ");

    let website = get("website").trim();
    const websiteLooksValid =
      !website ||
      /^(https?:\/\/)?([\w-]+\.)+[\w-]+/i.test(website) ||
      website.includes(".");

    const noteParts = [get("notes"), extraNotes];
    if (website && !websiteLooksValid) {
      noteParts.push(`Web Tech: ${website}`);
      website = "";
    }

    rows.push({
      entity: entity || contact || `Lead ${mobile || r + 1}`,
      contact: contact || entity || "Unknown",
      mobile,
      email: get("email"),
      location: get("location"),
      website,
      products: parseProducts(get("products")),
      status,
      owner: get("owner"),
      assigned: get("assigned"),
      followup: getDate("followup"),
      notes: noteParts.filter(Boolean).join(" · "),
      meetingDate: getDate("meetingDate"),
      meetingType,
      meetingLink: get("meetingLink"),
      lostDate: getDate("lostDate"),
      wonDate: getDate("wonDate"),
      _row: r + 1,
    });
  }

  return {
    headers: headerCells.filter(Boolean),
    rows,
    mapped,
    headerRow: headerRow + 1,
  };
}

export function downloadSampleCsv() {
  const header = [
    "Entity Name",
    "Contact Person",
    "Mobile No",
    "Email",
    "Location",
    "Website",
    "Products",
    "Lead Status",
    "Lead Owner",
    "Assigned User",
    "Follow-up Date",
    "Notes",
  ].join(",");
  const sample = [
    "ABC Financial",
    "Rahul Mehta",
    "9876543210",
    "rahul@abc.com",
    "Delhi",
    "https://abc.com",
    "CRM, Website",
    "New",
    "Vivek Thakur",
    "Vivek Thakur",
    "2026-09-25",
    "Imported sample",
  ]
    .map((v) => `"${v}"`)
    .join(",");

  const blob = new Blob([`${header}\n${sample}\n`], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "leads-import-sample.csv";
  a.click();
  URL.revokeObjectURL(url);
}
