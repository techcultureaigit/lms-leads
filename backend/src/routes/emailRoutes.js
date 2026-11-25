import { Router } from "express";
import {
  createTemplate,
  deleteTemplate,
  emailImageUpload,
  getBatch,
  getImage,
  getTemplate,
  listBatches,
  listHistory,
  listLeadRecipients,
  listStudentRecipients,
  listTemplates,
  resendBatch,
  sendExternal,
  sendStatus,
  sendToLeads,
  sendToStudents,
  stopBatch,
  updateTemplate,
  uploadImage,
} from "../controllers/emailController.js";
import { protect, requireAnyPermission, requirePermission } from "../middleware/auth.js";

const router = Router();

router.get("/images/:file", getImage);

router.use(protect);

router.get(
  "/students/list",
  requirePermission("email.send"),
  listStudentRecipients,
);
router.get(
  "/leads/list",
  requirePermission("email.send"),
  listLeadRecipients,
);
router.post(
  "/upload-image",
  requirePermission("email.create"),
  emailImageUpload.single("image"),
  uploadImage,
);
router.post("/send", requirePermission("email.send"), sendToStudents);
router.post("/send-leads", requirePermission("email.send"), sendToLeads);
router.get("/send/status/:jobId", requirePermission("email.send"), sendStatus);
router.post("/send-external", requirePermission("email.send"), sendExternal);
router.get(
  "/send/batches",
  requireAnyPermission("email.reports", "email.send"),
  listBatches,
);
router.get(
  "/send/batches/:id",
  requireAnyPermission("email.reports", "email.send"),
  getBatch,
);
router.post(
  "/send/batches/:id/stop",
  requirePermission("email.reports"),
  stopBatch,
);
router.post(
  "/send/batches/:id/resend",
  requirePermission("email.reports"),
  resendBatch,
);
router.get("/", requireAnyPermission("email.list", "email.create", "email.send"), listTemplates);
router.post("/", requirePermission("email.create"), createTemplate);
router.get("/:id", requireAnyPermission("email.list", "email.create", "email.send"), getTemplate);
router.put("/:id", requirePermission("email.create"), updateTemplate);
router.delete("/:id", requirePermission("email.create"), deleteTemplate);

export default router;
