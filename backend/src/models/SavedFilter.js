import mongoose from "mongoose";

const conditionSchema = new mongoose.Schema(
  {
    field: { type: String, required: true },
    operator: { type: String, required: true },
    value: { type: String, default: "" },
  },
  { _id: false },
);

const savedFilterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    visibility: {
      type: String,
      enum: ["private", "public"],
      default: "private",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    conditions: {
      type: [conditionSchema],
      validate: [(v) => v.length > 0, "At least one condition required"],
    },
    /** Join between condition i and i+1: AND | OR */
    joins: {
      type: [{ type: String, enum: ["AND", "OR"] }],
      default: [],
    },
  },
  { timestamps: true },
);

export const SavedFilter = mongoose.model("SavedFilter", savedFilterSchema);
