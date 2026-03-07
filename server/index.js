if (!process.env.VERCEL) {
  require("dotenv").config();
}
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
const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(",").map((s) => s.trim())
  : ["http://localhost:3000"];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin) || process.env.VERCEL) return cb(null, true);
    cb(new Error("CORS not allowed"));
  },
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));

// ---------------------------------------------------------------------------
// Database connection (serverless: lazy connect per request)
// ---------------------------------------------------------------------------
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/caminos-compass";
let isConnected = false;
async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) return;
  isConnected = false;
  try {
    await mongoose.connect(MONGO_URI);
    isConnected = true;
    console.log("Connected to MongoDB");
  } catch (err) {
    isConnected = false;
    console.error("MongoDB connection error:", err.message);
    throw err;
  }
}

if (process.env.VERCEL) {
  app.use(async (_req, _res, next) => {
    try { await connectDB(); } catch (err) { return next(err); }
    next();
  });
}

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

// Health / diagnostics
app.get("/api/health", async (_req, res) => {
  const mongoState = mongoose.connection.readyState;
  const states = { 0: "disconnected", 1: "connected", 2: "connecting", 3: "disconnecting" };
  res.json({
    status: mongoState === 1 ? "ok" : "degraded",
    mongo: states[mongoState] || "unknown",
    env: {
      MONGO_URI: process.env.MONGO_URI ? "set (" + process.env.MONGO_URI.substring(0, 20) + "...)" : "NOT SET",
      JWT_SECRET: process.env.JWT_SECRET ? "set" : "NOT SET",
      GEMINI_API_KEY: process.env.GEMINI_API_KEY ? "set" : "NOT SET",
      VERCEL: process.env.VERCEL || "not set",
    },
  });
});

// Global JSON error handler (prevents Express from returning HTML error pages)
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: err.message || "Internal server error." });
});

// ---------------------------------------------------------------------------
// Server startup (local dev only; Vercel uses the export below)
// ---------------------------------------------------------------------------
const PORT = process.env.PORT || 5000;

module.exports = app;

if (!process.env.VERCEL) {
  mongoose
    .connect(MONGO_URI)
    .then(() => {
      isConnected = true;
      console.log("Connected to MongoDB:", MONGO_URI);
      app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
      });
    })
    .catch((err) => {
      console.error("Failed to connect to MongoDB:", err.message);
      process.exit(1);
    });
}
