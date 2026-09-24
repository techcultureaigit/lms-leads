import { getWorkspaceSettings } from "../models/Settings.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { LEAD_SOURCES } from "../utils/constants.js";

function normalizeSources(list) {
  const seen = new Set();
  const out = [];
  for (const raw of list || []) {
    const name = String(raw || "").trim();
    if (!name) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(name);
  }
  return out;
}

export const getSettings = asyncHandler(async (_req, res) => {
  const doc = await getWorkspaceSettings();
  res.json({
    leadSources: doc.leadSources?.length ? doc.leadSources : [...LEAD_SOURCES],
  });
});

export const updateLeadSources = asyncHandler(async (req, res) => {
  const next = normalizeSources(req.body?.leadSources);
  if (!next.length) {
    return res.status(400).json({
      message: "Add at least one lead source",
    });
  }

  const doc = await getWorkspaceSettings();
  doc.leadSources = next;
  await doc.save();

  res.json({ leadSources: doc.leadSources });
});

export const addLeadSource = asyncHandler(async (req, res) => {
  const name = String(req.body?.name || "").trim();
  if (!name) {
    return res.status(400).json({ message: "Source name is required" });
  }

  const doc = await getWorkspaceSettings();
  const exists = doc.leadSources.some(
    (s) => s.toLowerCase() === name.toLowerCase(),
  );
  if (exists) {
    return res.status(400).json({ message: "This lead source already exists" });
  }

  doc.leadSources = [...doc.leadSources, name];
  await doc.save();
  res.status(201).json({ leadSources: doc.leadSources });
});

export const removeLeadSource = asyncHandler(async (req, res) => {
  const name = decodeURIComponent(req.params.name || "").trim();
  if (!name) {
    return res.status(400).json({ message: "Source name is required" });
  }

  const doc = await getWorkspaceSettings();
  const next = doc.leadSources.filter(
    (s) => s.toLowerCase() !== name.toLowerCase(),
  );
  if (next.length === doc.leadSources.length) {
    return res.status(404).json({ message: "Lead source not found" });
  }
  if (!next.length) {
    return res.status(400).json({
      message: "Keep at least one lead source",
    });
  }

  doc.leadSources = next;
  await doc.save();
  res.json({ leadSources: doc.leadSources });
});
