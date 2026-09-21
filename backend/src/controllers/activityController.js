import { Activity } from "../models/Activity.js";
import { Lead } from "../models/Lead.js";
import { toActivityDto } from "../utils/mappers.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const listByLead = asyncHandler(async (req, res) => {
  const { leadId } = req.params;
  const lead = await Lead.findById(leadId);
  if (!lead) return res.status(404).json({ message: "Lead not found" });

  const items = await Activity.find({ leadId }).sort({ createdAt: -1 });
  res.json({ items: items.map(toActivityDto) });
});

export const addNote = asyncHandler(async (req, res) => {
  const { leadId } = req.params;
  const { message } = req.body || {};
  if (!message?.trim()) {
    return res.status(400).json({ message: "message required" });
  }

  const lead = await Lead.findById(leadId);
  if (!lead) return res.status(404).json({ message: "Lead not found" });

  lead.notes = message.trim();
  await lead.save();

  const activity = await Activity.create({
    leadId,
    type: "note",
    message: message.trim(),
    actor: req.user?.name || "System",
  });

  res.status(201).json({ activity: toActivityDto(activity) });
});
