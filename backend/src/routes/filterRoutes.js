import { Router } from "express";
import {
  createFilter,
  deleteFilter,
  listFilters,
  updateFilter,
} from "../controllers/filterController.js";
import { protect, requirePermission } from "../middleware/auth.js";

const router = Router();

router.use(protect);
router.use(requirePermission("leads.view"));

router.get("/", listFilters);
router.post("/", createFilter);
router.put("/:id", updateFilter);
router.delete("/:id", deleteFilter);

export default router;
