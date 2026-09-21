import { User } from "../models/User.js";
import { signToken } from "../utils/jwt.js";
import { toUserDto } from "../utils/mappers.js";
import { ROLE_PERMISSIONS } from "../utils/constants.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "name, email, password required" });
  }

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    return res.status(409).json({ message: "Email already registered" });
  }

  const user = await User.create({
    name,
    email,
    password,
    phone: phone || "",
    role: role || "Admin",
    permissions: ROLE_PERMISSIONS[role || "Admin"],
  });

  const token = signToken({ id: user._id });
  res.status(201).json({ token, user: toUserDto(user) });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "email and password required" });
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+password",
  );
  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const match = await user.comparePassword(password);
  if (!match) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  if (user.status === "Inactive") {
    return res.status(403).json({ message: "Account is inactive" });
  }

  const token = signToken({ id: user._id });
  res.json({ token, user: toUserDto(user) });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: toUserDto(req.user) });
});
