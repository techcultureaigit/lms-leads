import mongoose from "mongoose";
import { LEAD_SOURCES } from "../utils/constants.js";

const settingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "workspace",
    },
    leadSources: {
      type: [String],
      default: () => [...LEAD_SOURCES],
    },
  },
  { timestamps: true },
);

export const Settings = mongoose.model("Settings", settingsSchema);

export async function getWorkspaceSettings() {
  let doc = await Settings.findOne({ key: "workspace" });
  if (!doc) {
    doc = await Settings.create({
      key: "workspace",
      leadSources: [...LEAD_SOURCES],
    });
  }
  if (!Array.isArray(doc.leadSources) || !doc.leadSources.length) {
    doc.leadSources = [...LEAD_SOURCES];
    await doc.save();
  }
  return doc;
}
