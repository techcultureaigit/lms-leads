import { EmailBatch } from "../models/EmailBatch.js";
import { sendMail } from "../utils/mailer.js";
import { applyPlaceholders } from "./emailRender.js";

const CONCURRENCY = 5;
const running = new Set();

export function kickBatch(batchId) {
  const id = String(batchId);
  if (running.has(id)) return;
  running.add(id);
  processBatch(id)
    .catch((err) => {
      console.error("Email batch failed", id, err);
    })
    .finally(() => running.delete(id));
}

async function refreshCounts(id, forceStatus) {
  const batch = await EmailBatch.findById(id);
  if (!batch) return;
  const sent = batch.recipients.filter((r) => r.status === "sent").length;
  const failed = batch.recipients.filter((r) => r.status === "failed").length;
  const unsent = batch.recipients.filter((r) => r.status === "unsent").length;
  const pending = batch.recipients.filter((r) => r.status === "pending").length;
  batch.sent = sent;
  batch.failed = failed;
  batch.unsent = unsent;
  batch.remaining = pending;
  batch.total = batch.recipients.length;
  if (forceStatus) batch.status = forceStatus;
  else if (pending === 0) batch.status = batch.stopped ? "stopped" : "completed";
  await batch.save();
}

async function markPendingUnsent(id) {
  await EmailBatch.updateOne(
    { _id: id },
    { $set: { "recipients.$[p].status": "unsent" } },
    { arrayFilters: [{ "p.status": "pending" }] },
  );
}

async function processBatch(id) {
  const batch = await EmailBatch.findById(id);
  if (!batch) return;
  if (batch.stopped) {
    await markPendingUnsent(id);
    await refreshCounts(id, "stopped");
    return;
  }
  batch.status = "running";
  await batch.save();

  const pendingIndexes = [];
  batch.recipients.forEach((recipient, index) => {
    if (recipient.status === "pending") pendingIndexes.push(index);
  });

  let cursor = 0;
  async function worker() {
    while (cursor < pendingIndexes.length) {
      const index = pendingIndexes[cursor];
      cursor += 1;
      const fresh = await EmailBatch.findById(id).select("stopped");
      if (!fresh || fresh.stopped) {
        await markPendingUnsent(id);
        await refreshCounts(id, "stopped");
        return;
      }
      const recipient = batch.recipients[index];
      const student = recipient.snapshot || {
        name: recipient.name,
        email: recipient.email,
      };
      try {
        const subject = applyPlaceholders(batch.subject, student);
        const html = applyPlaceholders(batch.html, student);
        const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
        await sendMail({ to: recipient.email, subject, html, text });
        await EmailBatch.updateOne(
          { _id: id },
          {
            $set: {
              [`recipients.${index}.status`]: "sent",
              [`recipients.${index}.sentAt`]: new Date(),
              [`recipients.${index}.error`]: "",
            },
          },
        );
      } catch (err) {
        await EmailBatch.updateOne(
          { _id: id },
          {
            $set: {
              [`recipients.${index}.status`]: "failed",
              [`recipients.${index}.error`]: err?.message || "Send failed",
            },
          },
        );
      }
      await refreshCounts(id);
    }
  }

  const workers = Math.min(CONCURRENCY, pendingIndexes.length);
  if (workers > 0) {
    await Promise.all(Array.from({ length: workers }, () => worker()));
  }
  const latest = await EmailBatch.findById(id).select("stopped");
  await refreshCounts(id, latest?.stopped ? "stopped" : undefined);
}
