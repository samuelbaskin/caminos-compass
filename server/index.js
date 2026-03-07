require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const cycleRoutes = require("./routes/cycles");
const studentRoutes = require("./routes/students");
const lessonPlanRoutes = require("./routes/lessonPlans");
const coachRoutes = require("./routes/coach");
const adminRoutes = require("./routes/admin");
const { requireAuth, requireRole } = require("./middleware/auth");

const app = express();

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
app.use("/api/auth", authRoutes);

// Teacher routes (require auth + teacher or admin role)
app.use("/api/cycles", requireAuth, requireRole(["teacher", "admin"]), cycleRoutes);
app.use("/api/students", requireAuth, requireRole(["teacher", "admin"]), studentRoutes);
app.use("/api/lesson-plans", requireAuth, requireRole(["teacher", "admin"]), lessonPlanRoutes);

// Coach routes
app.use("/api/coaches", requireAuth, requireRole(["coach", "admin"]), coachRoutes);

// Admin routes
app.use("/api/admin", requireAuth, requireRole(["admin"]), adminRoutes);

// Health check
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

// ---------------------------------------------------------------------------
// Database + server startup
// ---------------------------------------------------------------------------
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/caminos-compass";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB:", MONGO_URI);
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });
