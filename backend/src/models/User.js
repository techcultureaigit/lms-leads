import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import {
  ALL_PERMISSIONS,
  ROLE_PERMISSIONS,
  initialsFromName,
} from "../utils/constants.js";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6, select: false },
    phone: { type: String, default: "" },
    role: {
      type: String,
      default: "Account Executive",
      trim: true,
    },
    status: {
      type: String,
      enum: ["Active", "Away", "Inactive"],
      default: "Active",
    },
    initials: { type: String, default: "" },
    permissions: {
      type: [String],
      enum: ALL_PERMISSIONS,
      default: [],
    },
    notes: { type: String, default: "" },
    reportingManager: { type: String, default: "" },
    googleCalendar: {
      connected: { type: Boolean, default: false },
      email: { type: String, default: "" },
      accessToken: { type: String, default: "", select: false },
      refreshToken: { type: String, default: "", select: false },
      expiryDate: { type: Number, default: null },
      lastSyncedAt: { type: Date, default: null },
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function hashPassword() {
  if (!this.initials) {
    this.initials = initialsFromName(this.name);
  }
  if (!this.permissions?.length) {
    this.permissions = ROLE_PERMISSIONS[this.role] || [];
  }
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function comparePassword(plain) {
  return bcrypt.compare(plain, this.password);
};

export const User = mongoose.model("User", userSchema);
