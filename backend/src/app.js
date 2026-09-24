import express from "express";
import cors from "cors";
import morgan from "morgan";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import leadRoutes from "./routes/leadRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import filterRoutes from "./routes/filterRoutes.js";
import googleRoutes from "./routes/googleRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import roleRoutes from "./routes/roleRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";

const app = express();

app.use(
  cors({
    origin: [
      process.env.CLIENT_URL || "http://localhost:3000",
      "http://localhost:3000",
      "http://localhost:3001",
    ],
    credentials: true,
  }),
);
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

app.get("/", (_req, res) => {
  res.json({
    ok: true,
    name: "TechCulture Lead API",
    version: "1.0.0",
  });
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/users", userRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/filters", filterRoutes);
app.use("/api/google", googleRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/settings", settingsRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
