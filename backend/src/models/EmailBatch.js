import mongoose from "mongoose";

const recipientSchema = new mongoose.Schema(
  {
    studentId: { type: String, default: "" },
    email: { type: String, required: true },
    name: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "sent", "failed", "unsent"],
      default: "pending",
    },
    error: { type: String, default: "" },
    sentAt: { type: Date, default: null },
    snapshot: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { _id: false },
);

const emailBatchSchema = new mongoose.Schema(
  {
    templateId: { type: mongoose.Schema.Types.ObjectId, ref: "EmailTemplate" },
    templateName: { type: String, default: "" },
    subject: { type: String, default: "" },
    html: { type: String, default: "" },
    mode: {
      type: String,
      enum: ["students", "csv", "manual"],
      default: "students",
    },
    status: {
      type: String,
      enum: ["queued", "running", "completed", "stopped", "failed"],
      default: "queued",
    },
    total: { type: Number, default: 0 },
    sent: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
    unsent: { type: Number, default: 0 },
    remaining: { type: Number, default: 0 },
    stopped: { type: Boolean, default: false },
    createdBy: { type: String, default: "" },
    createdByName: { type: String, default: "" },
    recipients: { type: [recipientSchema], default: [] },
  },
  { timestamps: true },
);

emailBatchSchema.index({ createdAt: -1 });
emailBatchSchema.index({ status: 1 });

export const EmailBatch = mongoose.model("EmailBatch", emailBatchSchema);
