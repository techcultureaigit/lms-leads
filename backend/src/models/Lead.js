import mongoose from "mongoose";
import { LEAD_STATUSES } from "../utils/constants.js";

const leadSchema = new mongoose.Schema(
  {
    entity: { type: String, required: true, trim: true },
    contact: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    email: { type: String, default: "", trim: true },
    location: { type: String, default: "", trim: true },
    website: { type: String, default: "", trim: true },
    products: { type: [String], default: [] },
    status: {
      type: String,
      enum: LEAD_STATUSES,
      default: "New",
    },
    owner: { type: String, required: true, trim: true },
    assigned: { type: String, required: true, trim: true },
    followup: { type: String, default: "" },
    notes: { type: String, default: "" },
    key: { type: String, default: "" },
    meetingDate: { type: String, default: "" },
    meetingType: {
      type: String,
      enum: ["Online", "Offline", ""],
      default: "",
    },
    meetingLink: { type: String, default: "" },
    lostDate: { type: String, default: "" },
    wonDate: { type: String, default: "" },
    googleMeetingEventId: { type: String, default: "" },
    googleFollowupEventId: { type: String, default: "" },
  },
  { timestamps: true },
);

leadSchema.index({ entity: "text", contact: "text", email: "text", mobile: "text" });
leadSchema.index({ status: 1 });
leadSchema.index({ owner: 1 });
leadSchema.index({ followup: 1 });

export const Lead = mongoose.model("Lead", leadSchema);
