import { User } from "../models/User.js";
import { verifyToken } from "../utils/jwt.js";
import { asyncHandler } from "./errorHandler.js";

export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Login required" });
  }

  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id);
    if (!user || user.status === "Inactive") {
      return res.status(401).json({ message: "User not found or inactive" });
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
});

export function requirePermission(...permissions) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Login required" });
    }
    const ok = permissions.every((p) => req.user.permissions.includes(p));
    if (!ok) {
      return res.status(403).json({ message: "Permission denied" });
    }
    next();
  };
}
