import dns from "dns";
import mongoose from "mongoose";

// Windows / some networks break Node's SRV DNS lookups
dns.setDefaultResultOrder("ipv4first");

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is missing in .env");
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 15000,
  });
  console.log("MongoDB connected");
}
