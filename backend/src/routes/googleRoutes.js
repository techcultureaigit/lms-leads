import { Router } from "express";
import { protect } from "../middleware/auth.js";
import {
  getStatus,
  getConnectUrl,
  oauthCallback,
  disconnect,
  syncLeads,
  listEvents,
} from "../controllers/googleController.js";

const router = Router();

// OAuth redirect from Google — no JWT header; state carries signed user id
router.get("/callback", oauthCallback);

router.use(protect);

router.get("/status", getStatus);
router.get("/connect", getConnectUrl);
router.post("/sync", syncLeads);
router.get("/events", listEvents);
router.delete("/disconnect", disconnect);

export default router;
