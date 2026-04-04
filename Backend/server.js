import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";

import authRoutes from "./Routers/authRoutes.js";
import codeRoutes from "./Routers/codeRoutes.js";
import userRoutes from "./Routers/userRoutes.js";
import adminRoutes from "./Routers/adminRoutes.js";
import problemRoutes from "./Routers/problemRoutes.js";
import setterRequestRoutes from "./Routers/SetterRequestRoute.js";
import hrRoutes from "./Routers/hrRoutes.js";
import planRoutes from "./Routers/planRoutes.js";
import paymentRoutes from "./Routers/paymentRoutes.js"; // ✅ ADDED
import "./cron/subscriptionExpiry.js";


const app = express();

// Security
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/code", codeRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/setter-requests", setterRequestRoutes);
app.use("/api/hr", hrRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/payment", paymentRoutes); 


// Health
app.get("/api/health", (req, res) =>
  res.json({ status: "ok", time: new Date() }),
);

// 404
app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

// Error
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error.",
  });
});

// DB + Server Start
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ DB error:", err.message);
    process.exit(1);
  });
