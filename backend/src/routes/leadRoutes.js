import { Router } from "express";
import {
  bulkDelete,
  bulkUpdate,
  createLead,
  deleteLead,
  getLead,
  importLeads,
  listLeads,
  updateLead,
} from "../controllers/leadController.js";
import { protect, requirePermission } from "../middleware/auth.js";

const router = Router();

router.use(protect);

router.get("/", requirePermission("leads.view"), listLeads);
router.post("/", requirePermission("leads.create"), createLead);
router.post("/import", requirePermission("leads.create"), importLeads);
router.post("/bulk/update", requirePermission("leads.edit"), bulkUpdate);
router.post("/bulk/delete", requirePermission("leads.delete"), bulkDelete);
router.get("/:id", requirePermission("leads.view"), getLead);
router.put("/:id", requirePermission("leads.edit"), updateLead);
router.delete("/:id", requirePermission("leads.delete"), deleteLead);

export default router;
