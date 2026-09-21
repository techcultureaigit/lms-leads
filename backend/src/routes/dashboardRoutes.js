import { Router } from "express";
import { getDashboard } from "../controllers/dashboardController.js";
import { protect, requirePermission } from "../middleware/auth.js";

const router = Router();

router.use(protect);
router.get("/", requirePermission("leads.view"), getDashboard);

export default router;
