import { Lead } from "../models/Lead.js";
import { Activity } from "../models/Activity.js";
import { buildKeyDates, toLeadDto } from "../utils/mappers.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { syncOnlineMeetingLink } from "../services/meetingLink.js";

async function logActivity({ leadId, type, message, actor, meta }) {
  await Activity.create({
    leadId,
    type,
    message,
    actor: actor || "System",
    meta,
  });
}

export const listLeads = asyncHandler(async (req, res) => {
  const {
    q,
    status,
    owner,
    product,
    followupFrom,
    followupTo,
    overdue,
    page = 1,
    limit = 20,
    sort = "-createdAt",
  } = req.query;

  const filter = {};

  if (status) filter.status = status;
  if (owner) filter.owner = owner;
  if (product) filter.products = product;
  if (followupFrom || followupTo) {
    filter.followup = {};
    if (followupFrom) filter.followup.$gte = followupFrom;
    if (followupTo) filter.followup.$lte = followupTo;
  }
  if (overdue === "1") {
    const today = new Date().toISOString().slice(0, 10);
    filter.followup = { ...(filter.followup || {}), $lt: today, $ne: "" };
  }
  if (q) {
    filter.$or = [
      { entity: new RegExp(q, "i") },
      { contact: new RegExp(q, "i") },
      { email: new RegExp(q, "i") },
      { mobile: new RegExp(q, "i") },
      { location: new RegExp(q, "i") },
    ];
  }

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [items, total] = await Promise.all([
    Lead.find(filter).sort(sort).skip(skip).limit(limitNum),
    Lead.countDocuments(filter),
  ]);

  res.json({
    items: items.map(toLeadDto),
    total,
    page: pageNum,
    limit: limitNum,
    pages: Math.ceil(total / limitNum) || 1,
  });
});

export const getLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ message: "Lead not found" });
  res.json({ lead: toLeadDto(lead) });
});

export const createLead = asyncHandler(async (req, res) => {
  const body = req.body || {};
  if (!body.entity || !body.contact || !body.mobile || !body.owner || !body.assigned) {
    return res.status(400).json({
      message: "entity, contact, mobile, owner, assigned are required",
    });
  }
  if (!Array.isArray(body.products) || !body.products.length) {
    return res.status(400).json({ message: "Select at least one product" });
  }

  const meetingType =
    body.status === "Meeting"
      ? body.meetingType || "Online"
      : body.meetingType || "";

  const key =
    body.key ||
    buildKeyDates({
      status: body.status || "New",
      meetingDate: body.meetingDate,
      meetingType,
      lostDate: body.lostDate,
      wonDate: body.wonDate,
    });

  let lead = await Lead.create({
    entity: body.entity,
    contact: body.contact,
    mobile: body.mobile,
    email: body.email || "",
    location: body.location || "",
    website: body.website || "",
    products: body.products,
    status: body.status || "New",
    owner: body.owner,
    assigned: body.assigned,
    followup: body.followup || "",
    notes: body.notes || "",
    meetingDate: body.meetingDate || "",
    meetingType,
    meetingLink: body.meetingLink || "",
    lostDate: body.lostDate || "",
    wonDate: body.wonDate || "",
    key,
  });
  const actor = req.user?.name || "System";

  await logActivity({
    leadId: lead._id,
    type: "created",
    message: `Lead created · ${lead.entity}`,
    actor,
  });

  if (lead.followup) {
    await logActivity({
      leadId: lead._id,
      type: "followup",
      message: "Follow-up scheduled",
      actor,
      meta: { to: lead.followup },
    });
  }

  const meetResult = await syncOnlineMeetingLink(req.user._id, lead);
  lead = meetResult.lead;

  if (lead.meetingLink) {
    await logActivity({
      leadId: lead._id,
      type: "meeting",
      message: "Online meeting link created",
      actor,
      meta: { to: lead.meetingLink },
    });
  }

  res.status(201).json({
    lead: toLeadDto(lead),
    meetWarning: meetResult.meetWarning,
  });
});

export const updateLead = asyncHandler(async (req, res) => {
  const leadDoc = await Lead.findById(req.params.id);
  if (!leadDoc) return res.status(404).json({ message: "Lead not found" });

  const prev = leadDoc.toObject();
  const body = req.body || {};
  const actor = req.user?.name || "System";

  const nextStatus = body.status ?? leadDoc.status;
  const meetingType =
    nextStatus === "Meeting"
      ? (body.meetingType ?? leadDoc.meetingType) || "Online"
      : body.meetingType ?? leadDoc.meetingType;

  Object.assign(leadDoc, {
    entity: body.entity ?? leadDoc.entity,
    contact: body.contact ?? leadDoc.contact,
    mobile: body.mobile ?? leadDoc.mobile,
    email: body.email ?? leadDoc.email,
    location: body.location ?? leadDoc.location,
    website: body.website ?? leadDoc.website,
    products: body.products ?? leadDoc.products,
    status: nextStatus,
    owner: body.owner ?? leadDoc.owner,
    assigned: body.assigned ?? leadDoc.assigned,
    followup: body.followup ?? leadDoc.followup,
    notes: body.notes ?? leadDoc.notes,
    meetingDate: body.meetingDate ?? leadDoc.meetingDate,
    meetingType,
    meetingLink:
      body.meetingLink !== undefined ? body.meetingLink : leadDoc.meetingLink,
    lostDate: body.lostDate ?? leadDoc.lostDate,
    wonDate: body.wonDate ?? leadDoc.wonDate,
  });

  leadDoc.key =
    body.key ||
    buildKeyDates({
      status: leadDoc.status,
      meetingDate: leadDoc.meetingDate,
      meetingType: leadDoc.meetingType,
      lostDate: leadDoc.lostDate,
      wonDate: leadDoc.wonDate,
    });

  await leadDoc.save();

  if (prev.status !== leadDoc.status) {
    await logActivity({
      leadId: leadDoc._id,
      type: "status_change",
      message: "Status updated",
      actor,
      meta: { from: prev.status, to: leadDoc.status },
    });
  }
  if (prev.owner !== leadDoc.owner || prev.assigned !== leadDoc.assigned) {
    await logActivity({
      leadId: leadDoc._id,
      type: "assignment",
      message: "Assignment updated",
      actor,
      meta: { from: prev.owner, to: leadDoc.owner },
    });
  }
  if (prev.followup !== leadDoc.followup) {
    await logActivity({
      leadId: leadDoc._id,
      type: "followup",
      message: leadDoc.followup ? "Follow-up updated" : "Follow-up cleared",
      actor,
      meta: {
        from: prev.followup || undefined,
        to: leadDoc.followup || undefined,
      },
    });
  }
  if ((prev.notes || "") !== (leadDoc.notes || "") && leadDoc.notes) {
    await logActivity({
      leadId: leadDoc._id,
      type: "note",
      message: leadDoc.notes,
      actor,
    });
  }

  const meetResult = await syncOnlineMeetingLink(req.user._id, leadDoc);
  const lead = meetResult.lead;

  if (lead.meetingLink && lead.meetingLink !== (prev.meetingLink || "")) {
    await logActivity({
      leadId: lead._id,
      type: "meeting",
      message: "Online meeting link updated",
      actor,
      meta: { to: lead.meetingLink },
    });
  }

  res.json({
    lead: toLeadDto(lead),
    meetWarning: meetResult.meetWarning,
  });
});

export const deleteLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findByIdAndDelete(req.params.id);
  if (!lead) return res.status(404).json({ message: "Lead not found" });
  await Activity.deleteMany({ leadId: lead._id });
  res.json({ message: "Lead deleted", id: String(lead._id) });
});

export const bulkUpdate = asyncHandler(async (req, res) => {
  const { ids, status, owner, followup } = req.body || {};
  if (!Array.isArray(ids) || !ids.length) {
    return res.status(400).json({ message: "ids array required" });
  }

  const actor = req.user?.name || "System";
  const leads = await Lead.find({ _id: { $in: ids } });
  const updated = [];

  for (const lead of leads) {
    const prev = lead.toObject();
    if (status) lead.status = status;
    if (owner) {
      lead.owner = owner;
      lead.assigned = owner;
    }
    if (followup !== undefined) lead.followup = followup;
    await lead.save();
    updated.push(toLeadDto(lead));

    if (status && prev.status !== status) {
      await logActivity({
        leadId: lead._id,
        type: "status_change",
        message: "Bulk status change",
        actor,
        meta: { from: prev.status, to: status },
      });
    }
    if (owner && prev.owner !== owner) {
      await logActivity({
        leadId: lead._id,
        type: "assignment",
        message: "Bulk reassignment",
        actor,
        meta: { from: prev.owner, to: owner },
      });
    }
    if (followup !== undefined && prev.followup !== followup) {
      await logActivity({
        leadId: lead._id,
        type: "followup",
        message: "Bulk follow-up update",
        actor,
        meta: { from: prev.followup || undefined, to: followup || undefined },
      });
    }
  }

  res.json({ items: updated, count: updated.length });
});

export const bulkDelete = asyncHandler(async (req, res) => {
  const { ids } = req.body || {};
  if (!Array.isArray(ids) || !ids.length) {
    return res.status(400).json({ message: "ids array required" });
  }
  await Activity.deleteMany({ leadId: { $in: ids } });
  const result = await Lead.deleteMany({ _id: { $in: ids } });
  res.json({ deleted: result.deletedCount });
});

export const importLeads = asyncHandler(async (req, res) => {
  const rows = req.body?.leads;
  if (!Array.isArray(rows) || !rows.length) {
    return res.status(400).json({ message: "leads array required" });
  }
  if (rows.length > 500) {
    return res.status(400).json({ message: "Max 500 leads per import" });
  }

  const actor = req.user?.name || "System";
  const defaultOwner = req.user?.name || "Admin";
  const created = [];
  const errors = [];

  function normalizeMobile(value) {
    let digits = String(value ?? "").replace(/\D/g, "");
    if (digits.length >= 12 && digits.startsWith("91")) digits = digits.slice(-10);
    else if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
    else if (digits.length > 10) digits = digits.slice(-10);
    return digits;
  }

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i] || {};
    const rowNum = i + 2; // header is row 1
    try {
      const entity = String(row.entity || "").trim();
      const contact = String(row.contact || row.entity || "").trim();
      const mobile = normalizeMobile(row.mobile);

      if (!entity || !contact || mobile.length < 10) {
        errors.push({
          row: rowNum,
          message: `Need entity, contact and 10-digit mobile (got entity="${entity || "-"}", contact="${contact || "-"}", mobile="${mobile || "-"}")`,
        });
        continue;
      }

      const products = Array.isArray(row.products)
        ? row.products.map((p) => String(p).trim()).filter(Boolean)
        : String(row.products || "")
            .split(/[,|;]/)
            .map((p) => p.trim())
            .filter(Boolean);

      const status = row.status || "New";
      const meetingType =
        status === "Meeting"
          ? row.meetingType || "Online"
          : row.meetingType || "";

      const key =
        row.key ||
        buildKeyDates({
          status,
          meetingDate: row.meetingDate,
          meetingType,
          lostDate: row.lostDate,
          wonDate: row.wonDate,
        });

      const lead = await Lead.create({
        entity,
        contact,
        mobile,
        email: String(row.email || "").trim(),
        location: String(row.location || "").trim(),
        website: String(row.website || "").trim(),
        products: products.length ? products : ["CRM"],
        status,
        owner: String(row.owner || defaultOwner).trim(),
        assigned: String(row.assigned || row.owner || defaultOwner).trim(),
        followup: String(row.followup || "").trim(),
        notes: String(row.notes || "").trim(),
        meetingDate: String(row.meetingDate || "").trim(),
        meetingType,
        meetingLink: String(row.meetingLink || "").trim(),
        lostDate: String(row.lostDate || "").trim(),
        wonDate: String(row.wonDate || "").trim(),
        key,
      });

      await logActivity({
        leadId: lead._id,
        type: "created",
        message: `Lead imported · ${lead.entity}`,
        actor,
      });

      created.push(toLeadDto(lead));
    } catch (e) {
      errors.push({
        row: rowNum,
        message: e.message || "Failed to import row",
      });
    }
  }

  res.status(201).json({
    created: created.length,
    failed: errors.length,
    items: created,
    errors: errors.slice(0, 50),
  });
});
