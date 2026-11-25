// Removes duplicate leads (same entity + mobile, or entity + contact when no mobile).
// Keeps the oldest record in each group and deletes the rest along with their activities.
//
// Dry run (default, nothing deleted):  node src/scripts/dedupeLeads.js
// Apply deletion:                      node src/scripts/dedupeLeads.js --apply
import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { Lead } from "../models/Lead.js";
import { Activity } from "../models/Activity.js";

const APPLY = process.argv.includes("--apply");

const clean = (v) => String(v || "").trim().toLowerCase().replace(/\s+/g, " ");
const dupKeyOf = (l) => {
  const phone = l.mobile && l.mobile !== "—" ? clean(l.mobile) : "";
  return `${clean(l.entity)}|${phone || `contact:${clean(l.contact)}`}`;
};

async function run() {
  await connectDB();

  const leads = await Lead.find({})
    .sort({ createdAt: 1, _id: 1 })
    .select("_id entity contact mobile createdAt")
    .lean();

  const groups = new Map();
  for (const lead of leads) {
    const key = dupKeyOf(lead);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(lead);
  }

  const dupGroups = [...groups.values()].filter((g) => g.length > 1);
  const toDelete = dupGroups.flatMap((g) => g.slice(1));

  console.log(`Total leads: ${leads.length}`);
  console.log(`Duplicate groups: ${dupGroups.length}`);
  console.log(`Records to remove: ${toDelete.length}`);
  console.log(`Records to keep: ${leads.length - toDelete.length}`);
  console.log("");
  for (const g of dupGroups.slice(0, 20)) {
    const keep = g[0];
    console.log(`- "${keep.entity}" (${keep.mobile || "-"}) x${g.length} -> keep ${keep._id}`);
  }
  if (dupGroups.length > 20) console.log(`... and ${dupGroups.length - 20} more groups`);

  if (!APPLY) {
    console.log("\nDry run only. Re-run with --apply to delete.");
  } else if (toDelete.length) {
    const ids = toDelete.map((l) => l._id);
    const act = await Activity.deleteMany({ leadId: { $in: ids } });
    const res = await Lead.deleteMany({ _id: { $in: ids } });
    console.log(`\nDeleted leads: ${res.deletedCount}, activities: ${act.deletedCount}`);
  } else {
    console.log("\nNo duplicates to delete.");
  }

  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error("Dedupe failed:", err);
  await mongoose.disconnect();
  process.exit(1);
});
