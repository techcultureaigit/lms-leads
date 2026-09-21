import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "created",
        "note",
        "status_change",
        "followup",
        "meeting",
        "assignment",
        "system",
      ],
      required: true,
    },
    message: { type: String, required: true, trim: true },
    actor: { type: String, default: "System" },
    meta: {
      from: String,
      to: String,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const Activity = mongoose.model("Activity", activitySchema);
