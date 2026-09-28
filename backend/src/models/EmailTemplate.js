import mongoose from "mongoose";

const emailTemplateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    design: { type: mongoose.Schema.Types.Mixed, default: { blocks: [] } },
    html: { type: String, default: "" },
    text: { type: String, default: "" },
    description: { type: String, default: "", trim: true },
    category: { type: String, default: "general", trim: true },
    createdBy: { type: String, default: "" },
    updatedBy: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    usageCount: { type: Number, default: 0 },
    lastUsedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

emailTemplateSchema.index({ name: "text", subject: "text", description: "text" });

export const EmailTemplate = mongoose.model("EmailTemplate", emailTemplateSchema);
