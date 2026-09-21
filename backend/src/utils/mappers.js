export function buildKeyDates({
  status,
  meetingDate,
  meetingType,
  lostDate,
  wonDate,
}) {
  if (status === "Meeting" && meetingDate) {
    return `Meeting: ${meetingDate} (${meetingType || "Online"})`;
  }
  if (status === "Lost" && lostDate) {
    return `Lost: ${lostDate}`;
  }
  if (status === "Completed" && wonDate) {
    return `Won: ${wonDate}`;
  }
  return "";
}

export function toLeadDto(doc) {
  if (!doc) return null;
  const o = typeof doc.toObject === "function" ? doc.toObject() : doc;
  return {
    id: String(o._id),
    entity: o.entity,
    contact: o.contact,
    mobile: o.mobile,
    email: o.email || "",
    location: o.location || "",
    website: o.website || "",
    products: o.products || [],
    status: o.status,
    owner: o.owner,
    assigned: o.assigned,
    followup: o.followup || "",
    notes: o.notes || "",
    key: o.key || "",
    meetingDate: o.meetingDate || "",
    meetingType: o.meetingType || "",
    meetingLink: o.meetingLink || "",
    lostDate: o.lostDate || "",
    wonDate: o.wonDate || "",
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  };
}

export function toUserDto(doc) {
  if (!doc) return null;
  const o = typeof doc.toObject === "function" ? doc.toObject() : doc;
  return {
    id: String(o._id),
    name: o.name,
    role: o.role,
    email: o.email,
    phone: o.phone || "",
    status: o.status,
    initials: o.initials,
    permissions: o.permissions || [],
    notes: o.notes || "",
    reportingManager: o.reportingManager || "",
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  };
}

export function toActivityDto(doc) {
  if (!doc) return null;
  const o = typeof doc.toObject === "function" ? doc.toObject() : doc;
  return {
    id: String(o._id),
    leadId: String(o.leadId),
    type: o.type,
    message: o.message,
    actor: o.actor,
    meta: o.meta || {},
    createdAt: o.createdAt,
  };
}
