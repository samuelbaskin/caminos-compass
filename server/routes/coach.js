const express = require("express");
const User = require("../models/User");
const TeacherCycle = require("../models/TeacherCycle");
const Paso1Submission = require("../models/Paso1Submission");
const Paso2Submission = require("../models/Paso2Submission");
const Paso3Submission = require("../models/Paso3Submission");
const Paso4Submission = require("../models/Paso4Submission");
const Student = require("../models/Student");
const LessonPlan = require("../models/LessonPlan");
const CoachEvaluation = require("../models/CoachEvaluation");

const router = express.Router();

// GET /api/coaches/teachers — list all teachers with latest cycle info
router.get("/teachers", async (req, res) => {
  try {
    const teachers = await User.find({ role: "teacher" }).select("-passwordHash");
    const result = [];
    for (const t of teachers) {
      const latestCycle = await TeacherCycle.findOne({ teacherId: t._id }).sort({ createdAt: -1 });
      const lessonPlan = latestCycle
        ? await LessonPlan.findOne({ teacherCycleId: latestCycle._id })
        : null;
      result.push({
        teacher: t.toPublic(),
        latestCycle: latestCycle || null,
        hasLessonPlan: !!lessonPlan,
      });
    }
    res.json({ teachers: result });
  } catch (err) {
    console.error("Coach list teachers error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
});

// GET /api/coaches/teachers/:teacherId — full Paso 1-4 + lesson plan
router.get("/teachers/:teacherId", async (req, res) => {
  try {
    const teacher = await User.findOne({ _id: req.params.teacherId, role: "teacher" });
    if (!teacher) return res.status(404).json({ message: "Teacher not found." });

    const latestCycle = await TeacherCycle.findOne({ teacherId: teacher._id }).sort({ createdAt: -1 });
    if (!latestCycle) return res.json({ teacher: teacher.toPublic(), cycle: null });

    const cid = latestCycle._id;
    const [paso1, paso3, paso4, students, lessonPlan] = await Promise.all([
      Paso1Submission.findOne({ teacherCycleId: cid }),
      Paso3Submission.findOne({ teacherCycleId: cid }),
      Paso4Submission.findOne({ teacherCycleId: cid }),
      Student.find({ teacherCycleId: cid }),
      LessonPlan.findOne({ teacherCycleId: cid }),
    ]);
    const paso2 = await Paso2Submission.find({ teacherCycleId: cid });

    const evaluations = await CoachEvaluation.find({ teacherId: teacher._id }).sort({ createdAt: -1 });

    res.json({
      teacher: teacher.toPublic(),
      cycle: latestCycle,
      paso1,
      paso2,
      paso3,
      paso4,
      students,
      lessonPlan,
      evaluations,
    });
  } catch (err) {
    console.error("Coach teacher detail error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
});

// POST /api/coaches/evaluations — create evaluation
router.post("/evaluations", async (req, res) => {
  try {
    const { teacherId, lessonPlanId, strengths, areasForImprovement, suggestions, additionalNotes } = req.body;
    if (!teacherId || !lessonPlanId) {
      return res.status(400).json({ message: "teacherId and lessonPlanId are required." });
    }
    const evaluation = await CoachEvaluation.create({
      coachId: req.user.userId,
      teacherId,
      lessonPlanId,
      strengths: strengths || "",
      areasForImprovement: areasForImprovement || "",
      suggestions: suggestions || "",
      additionalNotes: additionalNotes || "",
    });
    res.status(201).json({ evaluation });
  } catch (err) {
    console.error("Create evaluation error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
});

// GET /api/coaches/evaluations — list coach's evaluations
router.get("/evaluations", async (req, res) => {
  try {
    const evaluations = await CoachEvaluation.find({ coachId: req.user.userId })
      .populate("teacherId", "firstName lastName email")
      .sort({ createdAt: -1 });
    res.json({ evaluations });
  } catch (err) {
    res.status(500).json({ message: "Internal server error." });
  }
});

module.exports = router;
