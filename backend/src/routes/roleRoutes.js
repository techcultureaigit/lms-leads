import { Router } from "express";
import {
  createRole,
  deleteRole,
  getRole,
  listRoles,
  updateRole,
} from "../controllers/roleController.js";
import { protect, requireAnyPermission, requirePermission } from "../middleware/auth.js";

const router = Router();

router.use(protect);

router.get("/", requireAnyPermission("users.view", "users.manage"), listRoles);
router.post("/", requirePermission("users.manage"), createRole);
router.get("/:id", requireAnyPermission("users.view", "users.manage"), getRole);
router.put("/:id", requirePermission("users.manage"), updateRole);
router.delete("/:id", requirePermission("users.manage"), deleteRole);

export default router;
