import { Router } from "express";
import { listHistory } from "../controllers/emailController.js";
import { protect, requirePermission } from "../middleware/auth.js";

const router = Router();

router.use(protect);
router.get("/", requirePermission("email.history"), listHistory);

export default router;
