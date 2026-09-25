import { Router } from "express";
import {
  createUser,
  deleteUser,
  getUser,
  listUsers,
  updateUser,
} from "../controllers/userController.js";
import { protect, requireAnyPermission, requirePermission } from "../middleware/auth.js";

const router = Router();

router.use(protect);

router.get("/", requireAnyPermission("users.view", "leads.create", "leads.edit"), listUsers);
router.post("/", requirePermission("users.manage"), createUser);
router.get("/:id", requirePermission("users.view"), getUser);
router.put("/:id", requirePermission("users.manage"), updateUser);
router.delete("/:id", requirePermission("users.manage"), deleteUser);

export default router;
