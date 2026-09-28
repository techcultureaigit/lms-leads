import mongoose from "mongoose";
import { Lead } from "../models/Lead.js";
import { User } from "../models/User.js";
import { leadAccessFilter } from "../utils/leadScope.js";

/** Leads with an email are the LMS recipients for the email module. */
export function leadToStudent(lead) {
  const created = lead.createdAt ? new Date(lead.createdAt) : null;
  const enrollmentDate =
    created && !Number.isNaN(created.getTime())
      ? created.toISOString().slice(0, 10)
      : "";
  return {
    id: String(lead._id),
    name: lead.contact || lead.entity || "",
    email: String(lead.email || "").trim(),
    studentId: String(lead._id),
    mobile: lead.mobile || "",
    courseName: Array.isArray(lead.products) ? lead.products.join(", ") : "",
    batch: lead.leadSource || "",
    enrollmentDate,
    instructor: lead.assigned || lead.owner || "",
    company: lead.entity || "",
  };
}

function emailFilter(scope) {
  return {
    $and: [
      { email: { $exists: true, $nin: [null, ""] } },
      ...(scope ? [scope] : []),
    ],
  };
}

export async function listStudents(user, search = "") {
  const scope = await leadAccessFilter(user);
  const leads = await Lead.find(emailFilter(scope)).sort({ entity: 1, contact: 1 });
  let students = leads.map(leadToStudent).filter((student) => student.email.includes("@"));
  const q = String(search || "").trim().toLowerCase();
  if (q) {
    students = students.filter((student) =>
      [student.name, student.email, student.company, student.courseName, student.mobile, student.studentId]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }
  return students;
}

export async function findStudentsByIds(user, ids) {
  const valid = (Array.isArray(ids) ? ids : []).filter((id) =>
    mongoose.Types.ObjectId.isValid(id),
  );
  if (!valid.length) return [];
  const scope = await leadAccessFilter(user);
  const leads = await Lead.find({
    _id: { $in: valid },
    ...emailFilter(scope),
  });
  return leads.map(leadToStudent).filter((student) => student.email.includes("@"));
}

function userToRecipient(user) {
  const created = user.createdAt ? new Date(user.createdAt) : null;
  const enrollmentDate =
    created && !Number.isNaN(created.getTime())
      ? created.toISOString().slice(0, 10)
      : "";
  return {
    id: String(user._id),
    name: user.name || "",
    email: String(user.email || "").trim(),
    role: user.role || "",
    studentId: String(user._id),
    mobile: user.phone || "",
    courseName: "",
    batch: "",
    enrollmentDate,
    instructor: user.reportingManager || "",
    company: "",
  };
}

export async function listEmailUsers(search = "") {
  const users = await User.find({ email: { $exists: true, $nin: [null, ""] } }).sort({
    name: 1,
  });
  let items = users.map(userToRecipient).filter((user) => user.email.includes("@"));
  const q = String(search || "").trim().toLowerCase();
  if (q) {
    items = items.filter((user) =>
      [user.name, user.email, user.role, user.mobile].join(" ").toLowerCase().includes(q),
    );
  }
  return items;
}

export async function findEmailUsersByIds(ids) {
  const valid = (Array.isArray(ids) ? ids : []).filter((id) =>
    mongoose.Types.ObjectId.isValid(id),
  );
  if (!valid.length) return [];
  const users = await User.find({
    _id: { $in: valid },
    email: { $exists: true, $nin: [null, ""] },
  });
  return users.map(userToRecipient).filter((user) => user.email.includes("@"));
}

export function studentFromEmail(email) {
  const clean = String(email || "").trim().toLowerCase();
  const name = clean.split("@")[0] || clean;
  return {
    id: "",
    name,
    email: clean,
    studentId: "",
    mobile: "",
    courseName: "",
    batch: "",
    enrollmentDate: "",
    instructor: "",
    company: "",
  };
}
