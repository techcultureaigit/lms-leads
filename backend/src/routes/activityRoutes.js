import { Router } from "express";
import { addNote, listByLead } from "../controllers/activityController.js";
import { protect, requirePermission } from "../middleware/auth.js";

const router = Router();

router.use(protect);

router.get("/lead/:leadId", requirePermission("leads.view"), listByLead);
router.post("/lead/:leadId/notes", requirePermission("leads.edit"), addNote);

export default router;
