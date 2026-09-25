import { User } from "../models/User.js";
import { Role } from "../models/Role.js";
import { ROLE_PERMISSIONS } from "../utils/constants.js";
import { initialsFromName } from "../utils/constants.js";
import { toUserDto } from "../utils/mappers.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { getVisibleNames } from "../utils/leadScope.js";

async function permissionsForRole(roleName) {
  const fallback = ROLE_PERMISSIONS[roleName] || [];
  const escaped = String(roleName).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const role = await Role.findOne({ name: new RegExp(`^${escaped}$`, "i") });
  return role?.permissions?.length ? role.permissions : fallback;
}

export const listUsers = asyncHandler(async (req, res) => {
  const names = await getVisibleNames(req.user);
  const users = await User.find(names ? { name: { $in: names } } : {})
    .sort({ name: 1 });
  res.json({ items: users.map(toUserDto) });
});

export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  const names = await getVisibleNames(req.user);
  if (names && !names.includes(user.name)) {
    return res.status(404).json({ message: "User not found" });
  }
  res.json({ user: toUserDto(user) });
});

export const createUser = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    phone,
    role,
    status,
    notes,
    permissions,
    reportingManager,
  } = req.body || {};

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "name, email, password are required" });
  }

  const roleName = role || "Account Executive";
  const user = await User.create({
    name,
    email,
    password,
    phone: phone || "",
    role: roleName,
    status: status || "Active",
    notes: notes || "",
    reportingManager: reportingManager || "",
    permissions: permissions?.length
      ? permissions
      : await permissionsForRole(roleName),
    initials: initialsFromName(name),
  });

  res.status(201).json({ user: toUserDto(user) });
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("+password");
  if (!user) return res.status(404).json({ message: "User not found" });

  const {
    name,
    email,
    password,
    phone,
    role,
    status,
    notes,
    permissions,
    reportingManager,
  } = req.body || {};

  if (name) {
    user.name = name;
    user.initials = initialsFromName(name);
  }
  if (email) user.email = email;
  if (phone !== undefined) user.phone = phone;
  if (role) {
    user.role = role;
    if (!permissions) user.permissions = await permissionsForRole(role);
  }
  if (status) user.status = status;
  if (notes !== undefined) user.notes = notes;
  if (reportingManager !== undefined) user.reportingManager = reportingManager;
  if (permissions) user.permissions = permissions;
  if (password) user.password = password;

  await user.save();
  res.json({ user: toUserDto(user) });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ message: "User deleted", id: String(user._id) });
});
