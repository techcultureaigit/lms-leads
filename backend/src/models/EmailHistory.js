import mongoose from "mongoose";

const emailHistorySchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    message: { type: String, default: "" },
    actor: { type: String, default: "" },
    actorId: { type: String, default: "" },
    templateId: { type: String, default: "" },
    batchId: { type: String, default: "" },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

emailHistorySchema.index({ createdAt: -1 });

export const EmailHistory = mongoose.model("EmailHistory", emailHistorySchema);
