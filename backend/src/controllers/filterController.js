import { SavedFilter } from "../models/SavedFilter.js";
import { asyncHandler } from "../middleware/errorHandler.js";

function toDto(doc) {
  const o = typeof doc.toObject === "function" ? doc.toObject() : doc;
  return {
    id: String(o._id),
    name: o.name,
    visibility: o.visibility,
    createdBy: String(o.createdBy),
    conditions: o.conditions || [],
    joins: o.joins || [],
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  };
}

function isAdmin(user) {
  return user?.role === "Admin";
}

export const listFilters = asyncHandler(async (req, res) => {
  const admin = isAdmin(req.user);
  const query = admin
    ? {}
    : { visibility: "public" };

  const items = await SavedFilter.find(query).sort({ updatedAt: -1 });
  res.json({
    items: items.map(toDto),
    canManagePrivate: admin,
  });
});

export const createFilter = asyncHandler(async (req, res) => {
  const { name, visibility, conditions, joins } = req.body || {};
  if (!name?.trim()) {
    return res.status(400).json({ message: "Filter name required" });
  }
  if (!Array.isArray(conditions) || !conditions.length) {
    return res.status(400).json({ message: "At least one condition required" });
  }

  let vis = visibility === "public" ? "public" : "private";
  if (vis === "private" && !isAdmin(req.user)) {
    return res.status(403).json({
      message: "Only Admin can save private filters",
    });
  }

  const filter = await SavedFilter.create({
    name: name.trim(),
    visibility: vis,
    createdBy: req.user._id,
    conditions,
    joins: Array.isArray(joins) ? joins : [],
  });

  res.status(201).json({ filter: toDto(filter) });
});

export const updateFilter = asyncHandler(async (req, res) => {
  const filter = await SavedFilter.findById(req.params.id);
  if (!filter) return res.status(404).json({ message: "Filter not found" });

  const admin = isAdmin(req.user);
  if (filter.visibility === "private" && !admin) {
    return res.status(403).json({ message: "Cannot edit private filter" });
  }
  if (!admin && String(filter.createdBy) !== String(req.user._id)) {
    return res.status(403).json({ message: "Only creator or Admin can edit" });
  }

  const { name, visibility, conditions, joins } = req.body || {};
  if (name?.trim()) filter.name = name.trim();
  if (visibility) {
    if (visibility === "private" && !admin) {
      return res.status(403).json({ message: "Only Admin can set private" });
    }
    filter.visibility = visibility;
  }
  if (Array.isArray(conditions) && conditions.length) {
    filter.conditions = conditions;
  }
  if (Array.isArray(joins)) filter.joins = joins;

  await filter.save();
  res.json({ filter: toDto(filter) });
});

export const deleteFilter = asyncHandler(async (req, res) => {
  const filter = await SavedFilter.findById(req.params.id);
  if (!filter) return res.status(404).json({ message: "Filter not found" });

  const admin = isAdmin(req.user);
  if (filter.visibility === "private" && !admin) {
    return res.status(403).json({ message: "Cannot delete private filter" });
  }
  if (!admin && String(filter.createdBy) !== String(req.user._id)) {
    return res.status(403).json({ message: "Only creator or Admin can delete" });
  }

  await filter.deleteOne();
  res.json({ message: "Filter deleted", id: String(filter._id) });
});
