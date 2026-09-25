import { Role } from "../models/Role.js";
import { User } from "../models/User.js";
import {
  ALL_PERMISSIONS,
  ROLE_DESCRIPTIONS,
  ROLE_PERMISSIONS,
} from "../utils/constants.js";
import { asyncHandler } from "../middleware/errorHandler.js";

function toRoleDto(doc) {
  if (!doc) return null;
  const o = typeof doc.toObject === "function" ? doc.toObject() : doc;
  return {
    id: String(o._id),
    name: o.name,
    description: o.description || "",
    permissions: o.permissions || [],
    isSystem: Boolean(o.isSystem),
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  };
}

async function ensureSystemRoles() {
  const manager = await Role.findOne({ name: "Sales Manager" });
  const legacy = await Role.findOne({ name: "Sales Lead" });
  if (legacy && !manager) {
    legacy.name = "Sales Manager";
    legacy.description = ROLE_DESCRIPTIONS["Sales Manager"];
    await legacy.save();
    await User.updateMany(
      { role: "Sales Lead" },
      { $set: { role: "Sales Manager" } },
    );
  }

  const hierarchy = ["Admin", "Sales Manager", "Business Development"];
  for (const name of hierarchy) {
    const exists = await Role.findOne({ name });
    if (exists) continue;
    await Role.create({
      name,
      description: ROLE_DESCRIPTIONS[name] || "",
      permissions: ROLE_PERMISSIONS[name] || [],
      isSystem: true,
    });
  }
}

export const listRoles = asyncHandler(async (_req, res) => {
  await ensureSystemRoles();
  const roles = await Role.find().sort({ name: 1 });
  res.json({ items: roles.map(toRoleDto) });
});

export const getRole = asyncHandler(async (req, res) => {
  const role = await Role.findById(req.params.id);
  if (!role) return res.status(404).json({ message: "Role not found" });
  res.json({ role: toRoleDto(role) });
});

export const createRole = asyncHandler(async (req, res) => {
  const { name, description, permissions } = req.body || {};
  if (!name?.trim()) {
    return res.status(400).json({ message: "Role name is required" });
  }

  const escaped = name.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const exists = await Role.findOne({
    name: new RegExp(`^${escaped}$`, "i"),
  });
  if (exists) {
    return res.status(409).json({ message: "Role name already exists" });
  }

  const perms = Array.isArray(permissions)
    ? permissions.filter((p) => ALL_PERMISSIONS.includes(p))
    : [];

  const role = await Role.create({
    name: name.trim(),
    description: description?.trim() || "",
    permissions: perms,
    isSystem: false,
  });

  res.status(201).json({ role: toRoleDto(role) });
});

export const updateRole = asyncHandler(async (req, res) => {
  const role = await Role.findById(req.params.id);
  if (!role) return res.status(404).json({ message: "Role not found" });

  const { name, description, permissions } = req.body || {};
  const previousName = role.name;

  if (name?.trim() && name.trim() !== role.name) {
    if (role.isSystem) {
      return res
        .status(400)
        .json({ message: "System role name cannot be changed" });
    }
    const escaped = name.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const exists = await Role.findOne({
      name: new RegExp(`^${escaped}$`, "i"),
      _id: { $ne: role._id },
    });
    if (exists) {
      return res.status(409).json({ message: "Role name already exists" });
    }
    role.name = name.trim();
  }

  if (description !== undefined) role.description = String(description).trim();
  if (Array.isArray(permissions)) {
    role.permissions = permissions.filter((p) => ALL_PERMISSIONS.includes(p));
  }

  await role.save();
  await User.updateMany(
    { role: previousName },
    { $set: { role: role.name, permissions: role.permissions } },
  );
  res.json({ role: toRoleDto(role) });
});

export const deleteRole = asyncHandler(async (req, res) => {
  const role = await Role.findById(req.params.id);
  if (!role) return res.status(404).json({ message: "Role not found" });
  if (role.name === "Admin") {
    return res.status(400).json({ message: "Admin role cannot be deleted" });
  }
  const inUse = await User.countDocuments({ role: role.name });
  if (inUse) {
    return res.status(400).json({
      message: `${inUse} user(s) still have this role. Reassign them before deleting.`,
    });
  }
  await role.deleteOne();
  res.json({ message: "Role deleted", id: String(role._id) });
});
