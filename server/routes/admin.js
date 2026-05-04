const express = require("express");
const path = require("path");
const fs = require("fs");
const User = require("../models/User");
const TeacherCycle = require("../models/TeacherCycle");
const LessonPlan = require("../models/LessonPlan");
const CoachEvaluation = require("../models/CoachEvaluation");
const Student = require("../models/Student");
const Paso1Submission = require("../models/Paso1Submission");
const Paso2GeneralSubmission = require("../models/Paso2GeneralSubmission");
const Paso2Submission = require("../models/Paso2Submission");
const Paso3GeneralSubmission = require("../models/Paso3GeneralSubmission");
const Paso3Submission = require("../models/Paso3Submission");
const Paso4GeneralSubmission = require("../models/Paso4GeneralSubmission");
const Paso4Submission = require("../models/Paso4Submission");
const Paso5Submission = require("../models/Paso5Submission");
const Paso6Submission = require("../models/Paso6Submission");
const { hashPassword } = require("../utils/auth");
const { fetchStagePasoBundle } = require("../utils/fetchStagePasoBundle");

const STAGES = ["pre", "observation", "post"];

// Every Paso submission collection that scopes rows by `teacherId`. Keep this
// list in sync if a new Paso schema is added so cascade deletes stay correct.
const TEACHER_PASO_MODELS = [
  Paso1Submission,
  Paso2GeneralSubmission,
  Paso2Submission,
  Paso3GeneralSubmission,
  Paso3Submission,
  Paso4GeneralSubmission,
  Paso4Submission,
  Paso5Submission,
  Paso6Submission,
];

// Same uploads directory the writing-sample upload route writes into.
const uploadsDir = process.env.VERCEL
  ? path.join("/tmp", "uploads")
  : path.join(__dirname, "..", "uploads");

// Best-effort: remove a writing-sample file if it still exists on disk. We
// never let a missing file (e.g. ephemeral storage on Vercel) block the
// database cascade.
function unlinkUploadIfExists(filename) {
  if (!filename) return;
  const fullPath = path.join(uploadsDir, filename);
  fs.unlink(fullPath, () => {});
}

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
//
// Cascades any data the user owned. Scope of the cascade depends on role:
//   - teacher → their cycles, students (+ uploaded writing samples on disk),
//               every Paso 1-6 submission, every lesson plan, and every
//               coach evaluation written about them.
//   - coach   → every evaluation they authored.
//   - admin   → nothing additional (admins don't create domain data).
//
// The user record itself is deleted last so a partial failure leaves a
// recoverable state (the admin can retry the delete).
router.delete("/users/:id", async (req, res) => {
  try {
    const targetId = req.params.id;

    // Guard: never let an admin nuke their own account from this panel —
    // it would log them out mid-action and could leave the system without
    // any admin if they were the last one.
    if (req.user?.userId === targetId) {
      return res.status(400).json({
        message:
          "You cannot delete your own admin account from the admin panel.",
      });
    }

    const user = await User.findById(targetId);
    if (!user) return res.status(404).json({ message: "User not found." });

    const counts = {
      students: 0,
      cycles: 0,
      pasoSubmissions: 0,
      lessonPlans: 0,
      evaluations: 0,
    };

    if (user.role === "teacher") {
      // Pull writing-sample filenames first so we can wipe them from disk
      // even after the Student rows are gone.
      const students = await Student.find({ teacherId: targetId }).select(
        "writingSamplePreFile"
      );
      students.forEach((s) => unlinkUploadIfExists(s.writingSamplePreFile));

      const [
        studentsRes,
        cyclesRes,
        lessonPlansRes,
        evalsRes,
        ...pasoResults
      ] = await Promise.all([
        Student.deleteMany({ teacherId: targetId }),
        TeacherCycle.deleteMany({ teacherId: targetId }),
        LessonPlan.deleteMany({ teacherId: targetId }),
        // Evaluations OF this teacher — the lesson plans they referenced
        // are also being deleted, so the evaluations would be unreachable.
        CoachEvaluation.deleteMany({ teacherId: targetId }),
        ...TEACHER_PASO_MODELS.map((M) =>
          M.deleteMany({ teacherId: targetId })
        ),
      ]);

      counts.students = studentsRes.deletedCount || 0;
      counts.cycles = cyclesRes.deletedCount || 0;
      counts.lessonPlans = lessonPlansRes.deletedCount || 0;
      counts.evaluations = evalsRes.deletedCount || 0;
      counts.pasoSubmissions = pasoResults.reduce(
        (sum, r) => sum + (r.deletedCount || 0),
        0
      );
    } else if (user.role === "coach") {
      const evalsRes = await CoachEvaluation.deleteMany({ coachId: targetId });
      counts.evaluations = evalsRes.deletedCount || 0;
    }

    await User.findByIdAndDelete(targetId);

    res.json({ message: "User and associated data deleted.", counts });
  } catch (err) {
    console.error("Admin delete user cascade error:", err);
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
