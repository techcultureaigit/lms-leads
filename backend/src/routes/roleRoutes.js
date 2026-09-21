import { Router } from "express";
import {
  createRole,
  deleteRole,
  getRole,
  listRoles,
  updateRole,
} from "../controllers/roleController.js";
import { protect, requirePermission } from "../middleware/auth.js";

const router = Router();

router.use(protect);

router.get("/", requirePermission("users.view"), listRoles);
router.post("/", requirePermission("users.manage"), createRole);
router.get("/:id", requirePermission("users.view"), getRole);
router.put("/:id", requirePermission("users.manage"), updateRole);
router.delete("/:id", requirePermission("users.manage"), deleteRole);

export default router;
