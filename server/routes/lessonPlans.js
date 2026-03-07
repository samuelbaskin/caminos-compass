const express = require("express");
const LessonPlan = require("../models/LessonPlan");
const Paso1Submission = require("../models/Paso1Submission");
const Paso2Submission = require("../models/Paso2Submission");
const Paso3Submission = require("../models/Paso3Submission");
const Paso4Submission = require("../models/Paso4Submission");
const Paso5Submission = require("../models/Paso5Submission");
const Student = require("../models/Student");
const { generateLessonPlan } = require("../services/gemini");

const router = express.Router();

// GET /api/lesson-plans — list own lesson plans
router.get("/", async (req, res) => {
  try {
    const plans = await LessonPlan.find({ teacherId: req.user.userId }).sort({ createdAt: -1 });
    res.json({ lessonPlans: plans });
  } catch (err) {
    res.status(500).json({ message: "Internal server error." });
  }
});

// GET /api/lesson-plans/:id — get a single lesson plan
router.get("/:id", async (req, res) => {
  try {
    const plan = await LessonPlan.findOne({ _id: req.params.id, teacherId: req.user.userId });
    if (!plan) return res.status(404).json({ message: "Lesson plan not found." });
    res.json({ lessonPlan: plan });
  } catch (err) {
    res.status(500).json({ message: "Internal server error." });
  }
});

// PUT /api/lesson-plans/:id — update lesson plan content
router.put("/:id", async (req, res) => {
  try {
    const { content, status } = req.body;
    const update = {};
    if (content !== undefined) update.content = content;
    if (status && ["draft", "generated", "finalized"].includes(status)) update.status = status;
    if (Object.keys(update).length === 0) return res.status(400).json({ message: "Nothing to update." });

    const plan = await LessonPlan.findOneAndUpdate(
      { _id: req.params.id, teacherId: req.user.userId },
      update,
      { new: true, runValidators: true }
    );
    if (!plan) return res.status(404).json({ message: "Lesson plan not found." });
    res.json({ lessonPlan: plan });
  } catch (err) {
    console.error("Update lesson plan error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
});

// POST /api/lesson-plans/generate — generate lesson plan from Paso 1-5
router.post("/generate", async (req, res) => {
  try {
    const { teacherCycleId } = req.body;
    if (!teacherCycleId) return res.status(400).json({ message: "teacherCycleId is required." });

    const [paso1, paso3, paso4, paso5, students] = await Promise.all([
      Paso1Submission.findOne({ teacherCycleId, teacherId: req.user.userId }),
      Paso3Submission.findOne({ teacherCycleId, teacherId: req.user.userId }),
      Paso4Submission.findOne({ teacherCycleId, teacherId: req.user.userId }),
      Paso5Submission.findOne({ teacherCycleId, teacherId: req.user.userId }),
      Student.find({ teacherCycleId, teacherId: req.user.userId }),
    ]);

    const paso2Subs = await Paso2Submission.find({ teacherCycleId, teacherId: req.user.userId });

    const paso2Students = students.map((s) => ({
      student: s,
      submission: paso2Subs.find((sub) => sub.studentId.toString() === s._id.toString()),
    }));

    const paso1to5Input = { paso1, paso2Students, paso3, paso4, paso5 };

    const content = await generateLessonPlan(paso1to5Input);

    const plan = await LessonPlan.findOneAndUpdate(
      { teacherCycleId, teacherId: req.user.userId },
      {
        teacherCycleId,
        teacherId: req.user.userId,
        content,
        paso1to5Input,
        paso5Id: paso5?._id,
        status: "generated",
      },
      { upsert: true, new: true }
    );

    res.json({ lessonPlan: plan });
  } catch (err) {
    console.error("Generate lesson plan error:", err);
    res.status(500).json({ message: err.message || "Internal server error." });
  }
});

module.exports = router;
