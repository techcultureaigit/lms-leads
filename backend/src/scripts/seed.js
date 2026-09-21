import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { User } from "../models/User.js";
import { Lead } from "../models/Lead.js";
import { Activity } from "../models/Activity.js";
import { ROLE_PERMISSIONS, ROLE_DESCRIPTIONS } from "../utils/constants.js";
import { Role } from "../models/Role.js";

const sampleLeads = [
  {
    entity: "ABC Financial Services",
    contact: "Rahul Mehta",
    mobile: "9876543210",
    email: "rahul@abc.com",
    location: "Delhi",
    products: ["CRM", "Website", "Mobile App"],
    status: "New",
    owner: "Amit Sharma",
    assigned: "Amit Sharma",
    followup: "2026-09-10",
    notes: "Sent CRM brochure; call scheduled.",
  },
  {
    entity: "Growth Investments",
    contact: "Priya Sinha",
    mobile: "9812345678",
    email: "priya@growth.com",
    location: "Mumbai",
    products: ["Mutual Fund", "IPO"],
    status: "In Process",
    owner: "Neha Verma",
    assigned: "Neha Verma",
    followup: "2026-09-08",
    notes: "Waiting on KYC docs before proposal.",
  },
  {
    entity: "Sunrise Traders",
    contact: "Karan Malhotra",
    mobile: "9987654321",
    email: "karan@sunrise.com",
    location: "Bengaluru",
    products: ["Ecommerce", "SEO"],
    status: "Meeting",
    owner: "Rohit Kumar",
    assigned: "Rohit Kumar",
    followup: "2026-09-12",
    key: "Meeting: 2026-09-05 (Online)",
    meetingDate: "2026-09-05",
    meetingType: "Online",
  },
  {
    entity: "Wealth Discovery",
    contact: "Anil Gupta",
    mobile: "9876501234",
    email: "anil@wealth.com",
    location: "Noida",
    products: ["Mobile App", "LMS"],
    status: "Completed",
    owner: "Sneha Iyer",
    assigned: "Sneha Iyer",
    followup: "",
    key: "Won: 2026-09-03",
    wonDate: "2026-09-03",
  },
];

async function seed() {
  await connectDB();

  await Promise.all([
    User.deleteMany({}),
    Lead.deleteMany({}),
    Activity.deleteMany({}),
  ]);

  for (const [name, permissions] of Object.entries(ROLE_PERMISSIONS)) {
    await Role.findOneAndUpdate(
      { name },
      {
        name,
        description: ROLE_DESCRIPTIONS[name] || "",
        permissions,
        isSystem: true,
      },
      { upsert: true, new: true },
    );
  }

  const admin = await User.create({
    name: "Amit Sharma",
    email: "admin@techculture.com",
    password: "Admin@123",
    phone: "9876500001",
    role: "Admin",
    status: "Active",
    permissions: ROLE_PERMISSIONS.Admin,
  });

  await User.create([
    {
      name: "Neha Verma",
      email: "neha@techculture.com",
      password: "User@123",
      phone: "9876500002",
      role: "Sales Lead",
      status: "Active",
      permissions: ROLE_PERMISSIONS["Sales Lead"],
    },
    {
      name: "Rohit Kumar",
      email: "rohit@techculture.com",
      password: "User@123",
      phone: "9876500003",
      role: "Account Executive",
      status: "Active",
      permissions: ROLE_PERMISSIONS["Account Executive"],
    },
    {
      name: "Sneha Iyer",
      email: "sneha@techculture.com",
      password: "User@123",
      phone: "9876500004",
      role: "Relationship Manager",
      status: "Active",
      permissions: ROLE_PERMISSIONS["Relationship Manager"],
    },
  ]);

  const leads = await Lead.insertMany(sampleLeads);

  await Activity.insertMany(
    leads.map((lead) => ({
      leadId: lead._id,
      type: "created",
      message: `Lead created · ${lead.entity}`,
      actor: lead.owner,
    })),
  );

  console.log("Seed complete");
  console.log("Admin login:");
  console.log("  email:    admin@techculture.com");
  console.log("  password: Admin@123");
  console.log(`Admin id: ${admin._id}`);

  await mongoose.disconnect();
}

seed().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});
