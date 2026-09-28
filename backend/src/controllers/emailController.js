import fs from "fs";
import path from "path";
import crypto from "crypto";
import multer from "multer";
import { EmailTemplate } from "../models/EmailTemplate.js";
import { EmailBatch } from "../models/EmailBatch.js";
import { EmailHistory } from "../models/EmailHistory.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { renderDesign } from "../services/emailRender.js";
import {
  findEmailUsersByIds,
  listEmailUsers,
  studentFromEmail,
} from "../services/emailStudents.js";
import { kickBatch } from "../services/emailQueue.js";
import { ALL_PERMISSIONS } from "../utils/constants.js";
import { Role } from "../models/Role.js";
import { User } from "../models/User.js";

const uploadDir = path.resolve("uploads/email");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const safe = [".png", ".jpg", ".jpeg", ".gif", ".webp"].includes(ext) ? ext : ".png";
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${safe}`);
  },
});

export const emailImageUpload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!/^image\/(png|jpe?g|gif|webp)$/.test(file.mimetype || "")) {
      cb(new Error("Only image files are allowed"));
      return;
    }
    cb(null, true);
  },
});

const EMAIL_KEYS = ALL_PERMISSIONS.filter((key) => key.startsWith("email."));

export async function ensureEmailAdminAccess() {
  if (!EMAIL_KEYS.length) return;
  await Role.updateOne(
    { name: "Admin" },
    { $addToSet: { permissions: { $each: EMAIL_KEYS } } },
  );
  await User.updateMany(
    { role: "Admin" },
    { $addToSet: { permissions: { $each: EMAIL_KEYS } } },
  );
}

function toTemplateDto(doc) {
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    id: String(o._id),
    name: o.name,
    subject: o.subject,
    design: o.design || { blocks: [] },
    html: o.html || "",
    text: o.text || "",
    description: o.description || "",
    category: o.category || "general",
    createdBy: o.createdBy || "",
    updatedBy: o.updatedBy || "",
    isActive: Boolean(o.isActive),
    usageCount: o.usageCount || 0,
    lastUsedAt: o.lastUsedAt,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  };
}

function toBatchSummary(doc) {
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    id: String(o._id),
    templateId: o.templateId ? String(o.templateId) : "",
    templateName: o.templateName || "",
    mode: o.mode,
    status: o.status,
    total: o.total || 0,
    sent: o.sent || 0,
    failed: o.failed || 0,
    unsent: o.unsent || 0,
    remaining: o.remaining || 0,
    stopped: Boolean(o.stopped),
    createdBy: o.createdByName || o.createdBy || "",
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  };
}

async function logHistory({ action, message, req, templateId, batchId, meta }) {
  await EmailHistory.create({
    action,
    message,
    actor: req.user?.name || "System",
    actorId: req.user?._id ? String(req.user._id) : "",
    templateId: templateId ? String(templateId) : "",
    batchId: batchId ? String(batchId) : "",
    meta: meta || {},
  });
}

export const listTemplates = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.active === "1") filter.isActive = true;
  if (req.query.q) {
    const q = String(req.query.q).trim();
    filter.$or = [
      { name: new RegExp(q, "i") },
      { subject: new RegExp(q, "i") },
      { category: new RegExp(q, "i") },
    ];
  }
  const items = await EmailTemplate.find(filter).sort({ updatedAt: -1 });
  res.json({ items: items.map(toTemplateDto) });
});

export const getTemplate = asyncHandler(async (req, res) => {
  const template = await EmailTemplate.findById(req.params.id);
  if (!template) return res.status(404).json({ message: "Template not found" });
  res.json({ template: toTemplateDto(template) });
});

export const createTemplate = asyncHandler(async (req, res) => {
  const body = req.body || {};
  if (!body.name?.trim() || !body.subject?.trim()) {
    return res.status(400).json({ message: "Template name and subject are required" });
  }
  const rendered = body.html ? { html: body.html, text: body.text || "" } : renderDesign(body.design);
  const template = await EmailTemplate.create({
    name: body.name.trim(),
    subject: body.subject.trim(),
    design: body.design || { blocks: [] },
    html: rendered.html,
    text: body.text || rendered.text,
    description: body.description || "",
    category: body.category || "general",
    isActive: body.isActive !== false,
    createdBy: req.user?.name || "",
    updatedBy: req.user?.name || "",
  });
  await logHistory({
    action: "template.create",
    message: `Created template "${template.name}"`,
    req,
    templateId: template._id,
  });
  res.status(201).json({ template: toTemplateDto(template) });
});

export const updateTemplate = asyncHandler(async (req, res) => {
  const template = await EmailTemplate.findById(req.params.id);
  if (!template) return res.status(404).json({ message: "Template not found" });
  const body = req.body || {};
  if (body.name !== undefined) template.name = String(body.name).trim();
  if (body.subject !== undefined) template.subject = String(body.subject).trim();
  if (body.description !== undefined) template.description = body.description;
  if (body.category !== undefined) template.category = body.category || "general";
  if (body.isActive !== undefined) template.isActive = Boolean(body.isActive);
  if (body.design !== undefined) template.design = body.design;
  if (body.design !== undefined || body.html !== undefined) {
    const rendered = body.html ? { html: body.html, text: body.text || "" } : renderDesign(template.design);
    template.html = body.html || rendered.html;
    template.text = body.text || rendered.text;
  }
  if (!template.name || !template.subject) {
    return res.status(400).json({ message: "Template name and subject are required" });
  }
  template.updatedBy = req.user?.name || "";
  await template.save();
  await logHistory({
    action: "template.update",
    message: `Updated template "${template.name}"`,
    req,
    templateId: template._id,
  });
  res.json({ template: toTemplateDto(template) });
});

export const deleteTemplate = asyncHandler(async (req, res) => {
  const template = await EmailTemplate.findByIdAndDelete(req.params.id);
  if (template) {
    await logHistory({
      action: "template.delete",
      message: `Deleted template "${template.name}"`,
      req,
      templateId: template._id,
    });
  }
  res.json({ message: "Template deleted", id: String(req.params.id) });
});

export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Image file is required" });
  const origin = process.env.PUBLIC_API_URL || `http://localhost:${process.env.PORT || 5000}`;
  const filePath = `/api/email-templates/images/${req.file.filename}`;
  res.status(201).json({
    url: `${origin}${filePath}`,
    path: filePath,
    filename: req.file.filename,
  });
});

export const getImage = asyncHandler(async (req, res) => {
  const filename = path.basename(String(req.params.file || ""));
  if (!/^[\w.-]+$/.test(filename)) {
    return res.status(400).json({ message: "Invalid file" });
  }
  const full = path.join(uploadDir, filename);
  if (!full.startsWith(uploadDir) || !fs.existsSync(full)) {
    return res.status(404).json({ message: "Image not found" });
  }
  res.sendFile(full);
});

export const listStudentRecipients = asyncHandler(async (req, res) => {
  const items = await listEmailUsers(req.query.search);
  res.json({ items });
});

function parseEmails(value) {
  const raw = Array.isArray(value) ? value.join(",") : String(value || "");
  const found = raw.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || [];
  return [...new Set(found.map((email) => email.toLowerCase()))];
}

async function startSend({ req, template, students, mode }) {
  if (!template.isActive) {
    const error = new Error("Template is inactive");
    error.statusCode = 400;
    throw error;
  }
  if (!students.length) {
    const error = new Error("No recipients with an email address");
    error.statusCode = 400;
    throw error;
  }
  if (students.length > 2000) {
    const error = new Error("Maximum 2000 recipients per send");
    error.statusCode = 400;
    throw error;
  }
  const html = req.body?.customBody || template.html;
  const subject = req.body?.customSubject || template.subject;
  const batch = await EmailBatch.create({
    templateId: template._id,
    templateName: template.name,
    subject,
    html,
    mode,
    status: "queued",
    total: students.length,
    remaining: students.length,
    createdBy: req.user?._id ? String(req.user._id) : "",
    createdByName: req.user?.name || "",
    recipients: students.map((student) => ({
      studentId: student.id || student.studentId || "",
      email: student.email,
      name: student.name || "",
      status: "pending",
      snapshot: student,
    })),
  });
  template.usageCount = (template.usageCount || 0) + 1;
  template.lastUsedAt = new Date();
  await template.save();
  await logHistory({
    action: "email.send",
    message: `Started send of "${template.name}" to ${students.length} recipient(s)`,
    req,
    templateId: template._id,
    batchId: batch._id,
    meta: { mode, total: students.length },
  });
  kickBatch(batch._id);
  return batch;
}

export const sendToStudents = asyncHandler(async (req, res) => {
  const { templateId, studentIds } = req.body || {};
  const template = await EmailTemplate.findById(templateId);
  if (!template) return res.status(404).json({ message: "Template not found" });
  const students = await findEmailUsersByIds(studentIds);
  const batch = await startSend({ req, template, students, mode: "students" });
  res.status(202).json({ jobId: String(batch._id), batch: toBatchSummary(batch) });
});

export const sendExternal = asyncHandler(async (req, res) => {
  const { templateId, emails } = req.body || {};
  const template = await EmailTemplate.findById(templateId);
  if (!template) return res.status(404).json({ message: "Template not found" });
  const mode = req.body?.mode === "csv" ? "csv" : "manual";
  const students = parseEmails(emails).map(studentFromEmail);
  const batch = await startSend({ req, template, students, mode });
  res.status(202).json({ jobId: String(batch._id), batch: toBatchSummary(batch) });
});

export const sendStatus = asyncHandler(async (req, res) => {
  const batch = await EmailBatch.findById(req.params.jobId);
  if (!batch) return res.status(404).json({ message: "Batch not found" });
  res.json({ batch: toBatchSummary(batch) });
});

export const listBatches = asyncHandler(async (_req, res) => {
  const items = await EmailBatch.find()
    .sort({ createdAt: -1 })
    .select("-html -recipients.snapshot")
    .limit(100);
  res.json({
    items: items.map((batch) => ({
      ...toBatchSummary(batch),
      failures: (batch.recipients || [])
        .filter((recipient) => recipient.status === "failed")
        .slice(0, 20)
        .map((recipient) => ({
          email: recipient.email,
          error: recipient.error,
        })),
    })),
  });
});

export const getBatch = asyncHandler(async (req, res) => {
  const batch = await EmailBatch.findById(req.params.id).select("-html");
  if (!batch) return res.status(404).json({ message: "Batch not found" });
  res.json({
    batch: {
      ...toBatchSummary(batch),
      recipients: batch.recipients.map((recipient) => ({
        email: recipient.email,
        name: recipient.name,
        status: recipient.status,
        error: recipient.error,
        studentId: recipient.studentId,
      })),
    },
  });
});

export const stopBatch = asyncHandler(async (req, res) => {
  const batch = await EmailBatch.findById(req.params.id);
  if (!batch) return res.status(404).json({ message: "Batch not found" });
  batch.stopped = true;
  if (batch.status === "queued" || batch.status === "running") batch.status = "stopped";
  await batch.save();
  await logHistory({
    action: "email.stop",
    message: `Stopped send batch for "${batch.templateName}"`,
    req,
    templateId: batch.templateId,
    batchId: batch._id,
  });
  res.json({ batch: toBatchSummary(batch) });
});

export const resendBatch = asyncHandler(async (req, res) => {
  const batch = await EmailBatch.findById(req.params.id);
  if (!batch) return res.status(404).json({ message: "Batch not found" });
  if (batch.status === "running") {
    return res.status(400).json({ message: "Batch is still running" });
  }
  let reset = 0;
  batch.recipients.forEach((recipient) => {
    if (recipient.status === "failed" || recipient.status === "unsent") {
      recipient.status = "pending";
      recipient.error = "";
      recipient.sentAt = null;
      reset += 1;
    }
  });
  if (!reset) return res.status(400).json({ message: "Nothing to resend" });
  batch.stopped = false;
  batch.status = "queued";
  batch.remaining = reset;
  await batch.save();
  await logHistory({
    action: "email.resend",
    message: `Resending ${reset} recipient(s) for "${batch.templateName}"`,
    req,
    templateId: batch.templateId,
    batchId: batch._id,
  });
  kickBatch(batch._id);
  res.status(202).json({ jobId: String(batch._id), batch: toBatchSummary(batch) });
});

export const listHistory = asyncHandler(async (_req, res) => {
  const items = await EmailHistory.find().sort({ createdAt: -1 }).limit(300);
  res.json({
    items: items.map((row) => ({
      id: String(row._id),
      action: row.action,
      message: row.message,
      actor: row.actor,
      templateId: row.templateId,
      batchId: row.batchId,
      createdAt: row.createdAt,
    })),
  });
});
