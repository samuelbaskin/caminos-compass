const express = require("express");
const LessonPlan = require("../models/LessonPlan");
const { generateLessonPlan } = require("../services/gemini");
const { fetchStagePasoBundle, normalizeStage } = require("../utils/fetchStagePasoBundle");

const router = express.Router();

// GET /api/lesson-plans — list own lesson plans (optional ?stage=pre|observation|post)
router.get("/", async (req, res) => {
  try {
    const q = { teacherId: req.user.userId };
    if (req.query.stage) q.stage = normalizeStage(req.query.stage);
    const plans = await LessonPlan.find(q).sort({ createdAt: -1 });
    res.json({ lessonPlans: plans });
  } catch (err) {
    res.status(500).json({ message: "Internal server error." });
  }
});

// POST /api/lesson-plans — create blank draft (must be before GET /:id)
router.post("/", async (req, res) => {
  try {
    const { teacherCycleId, stage, content } = req.body;
    if (!teacherCycleId) return res.status(400).json({ message: "teacherCycleId is required." });
    const st = normalizeStage(stage);
    const plan = await LessonPlan.create({
      teacherCycleId,
      teacherId: req.user.userId,
      stage: st,
      content: typeof content === "string" ? content : "",
      paso1to5Input: { stage: st },
      status: "draft",
    });
    res.status(201).json({ lessonPlan: plan });
  } catch (err) {
    console.error("Create blank lesson plan error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
});

// POST /api/lesson-plans/generate — AI generate from current Paso data for a stage (no completion gating)
router.post("/generate", async (req, res) => {
  try {
    const { teacherCycleId, stage } = req.body;
    if (!teacherCycleId) return res.status(400).json({ message: "teacherCycleId is required." });

    const bundle = await fetchStagePasoBundle(teacherCycleId, req.user.userId, stage);
    const { paso1to5Input, paso5 } = bundle;

    const content = await generateLessonPlan(paso1to5Input);

    const plan = await LessonPlan.create({
      teacherCycleId,
      teacherId: req.user.userId,
      stage: bundle.stage,
      content,
      paso1to5Input,
      paso5Id: paso5?._id,
      paso6Id: bundle.paso6?._id,
      status: "generated",
    });

    res.json({ lessonPlan: plan });
  } catch (err) {
    console.error("Generate lesson plan error:", err);
    res.status(500).json({ message: err.message || "Internal server error." });
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

// DELETE /api/lesson-plans/:id — delete a lesson plan
router.delete("/:id", async (req, res) => {
  try {
    const plan = await LessonPlan.findOneAndDelete({ _id: req.params.id, teacherId: req.user.userId });
    if (!plan) return res.status(404).json({ message: "Lesson plan not found." });
    res.json({ message: "Lesson plan deleted." });
  } catch (err) {
    console.error("Delete lesson plan error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
});

module.exports = router;
