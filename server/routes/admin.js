const express = require("express");
const User = require("../models/User");
const TeacherCycle = require("../models/TeacherCycle");
const LessonPlan = require("../models/LessonPlan");
const CoachEvaluation = require("../models/CoachEvaluation");
const Student = require("../models/Student");
const { hashPassword } = require("../utils/auth");
const { fetchStagePasoBundle } = require("../utils/fetchStagePasoBundle");

const STAGES = ["pre", "observation", "post"];

const router = express.Router();

// ---- User CRUD ----

// GET /api/admin/users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-passwordHash").sort({ createdAt: -1 });
    res.json({ users: users.map((u) => u.toPublic()) });
  } catch (err) {
    res.status(500).json({ message: "Internal server error." });
  }
});

// PUT /api/admin/users/:id
router.put("/users/:id", async (req, res) => {
  try {
    const updates = {};
    const { firstName, lastName, email, role, password } = req.body;
    if (firstName) updates.firstName = firstName.trim();
    if (lastName) updates.lastName = lastName.trim();
    if (email) updates.email = email.trim().toLowerCase();
    if (role && ["teacher", "coach", "admin"].includes(role)) updates.role = role;
    if (password) updates.passwordHash = await hashPassword(password);

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json({ user: user.toPublic() });
  } catch (err) {
    console.error("Admin update user error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
});

// DELETE /api/admin/users/:id
router.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json({ message: "User deleted." });
  } catch (err) {
    res.status(500).json({ message: "Internal server error." });
  }
});

// POST /api/admin/users — create any user (including admin)
router.post("/users", async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;
    if (!firstName || !lastName || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required." });
    }
    const existing = await User.findOne({ email: email.trim().toLowerCase() });
    if (existing) return res.status(409).json({ message: "Email already exists." });

    const passwordHash = await hashPassword(password);
    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      role,
    });
    res.status(201).json({ user: user.toPublic() });
  } catch (err) {
    console.error("Admin create user error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
});

// ---- Data browsing ----

// GET /api/admin/cycles — all cycles
router.get("/cycles", async (req, res) => {
  try {
    const cycles = await TeacherCycle.find().populate("teacherId", "firstName lastName email").sort({ createdAt: -1 });
    res.json({ cycles });
  } catch (err) {
    res.status(500).json({ message: "Internal server error." });
  }
});

// GET /api/admin/cycles/:id — full cycle data (any teacher)
router.get("/cycles/:id", async (req, res) => {
  try {
    const cycle = await TeacherCycle.findById(req.params.id);
    if (!cycle) return res.status(404).json({ message: "Cycle not found." });

    const cid = cycle._id;
    const tid = cycle.teacherId;
    const pasosByStage = {};
    for (const st of STAGES) {
      pasosByStage[st] = await fetchStagePasoBundle(cid, tid, st);
    }
    const pre = pasosByStage.pre;
    const {
      paso1,
      paso2General,
      paso2,
      paso3General,
      paso3,
      paso4General,
      paso4,
      paso5,
      paso6,
    } = pre;
    const [students, lessonPlans] = await Promise.all([
      Student.find({ teacherCycleId: cid }),
      LessonPlan.find({ teacherCycleId: cid }).sort({ updatedAt: -1 }),
    ]);
    const lessonPlan = lessonPlans[0] || null;
    const evaluations = await CoachEvaluation.find({ teacherId: cycle.teacherId });

    res.json({
      cycle,
      paso1,
      paso2General,
      paso2,
      paso3General,
      paso3,
      paso4General,
      paso4,
      paso5,
      paso6,
      students,
      lessonPlan,
      lessonPlans,
      evaluations,
      pasosByStage,
    });
  } catch (err) {
    res.status(500).json({ message: "Internal server error." });
  }
});

// GET /api/admin/lesson-plans
router.get("/lesson-plans", async (req, res) => {
  try {
    const plans = await LessonPlan.find()
      .populate("teacherId", "firstName lastName email")
      .sort({ createdAt: -1 });
    res.json({ lessonPlans: plans });
  } catch (err) {
    res.status(500).json({ message: "Internal server error." });
  }
});

// GET /api/admin/evaluations
router.get("/evaluations", async (req, res) => {
  try {
    const evaluations = await CoachEvaluation.find()
      .populate("coachId", "firstName lastName email")
      .populate("teacherId", "firstName lastName email")
      .sort({ createdAt: -1 });
    res.json({ evaluations });
  } catch (err) {
    res.status(500).json({ message: "Internal server error." });
  }
});

module.exports = router;
