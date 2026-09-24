import { Router } from "express";
import {
  addLeadSource,
  getSettings,
  removeLeadSource,
  updateLeadSources,
} from "../controllers/settingsController.js";
import { protect, requirePermission } from "../middleware/auth.js";

const router = Router();

router.use(protect);

router.get("/", getSettings);
router.put(
  "/lead-sources",
  requirePermission("settings.manage"),
  updateLeadSources,
);
router.post(
  "/lead-sources",
  requirePermission("settings.manage"),
  addLeadSource,
);
router.delete(
  "/lead-sources/:name",
  requirePermission("settings.manage"),
  removeLeadSource,
);

export default router;
