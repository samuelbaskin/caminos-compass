const express = require("express");
const TeacherCycle = require("../models/TeacherCycle");
const Paso1Submission = require("../models/Paso1Submission");
const Paso2Submission = require("../models/Paso2Submission");
const Paso2GeneralSubmission = require("../models/Paso2GeneralSubmission");
const Paso3Submission = require("../models/Paso3Submission");
const Paso3GeneralSubmission = require("../models/Paso3GeneralSubmission");
const Paso4Submission = require("../models/Paso4Submission");
const Paso4GeneralSubmission = require("../models/Paso4GeneralSubmission");
const Paso5Submission = require("../models/Paso5Submission");
const Paso6Submission = require("../models/Paso6Submission");
const Student = require("../models/Student");
const LessonPlan = require("../models/LessonPlan");

const router = express.Router();

// GET /api/cycles — list all cycles for the logged-in teacher
router.get("/", async (req, res) => {
  try {
    const cycles = await TeacherCycle.find({ teacherId: req.user.userId }).sort({ createdAt: -1 });
    res.json({ cycles });
  } catch (err) {
    console.error("List cycles error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
});

// POST /api/cycles — create a new cycle
router.post("/", async (req, res) => {
  try {
    const cycle = await TeacherCycle.create({
      teacherId: req.user.userId,
      name: req.body.name || "My Coaching Cycle",
    });
    res.status(201).json({ cycle });
  } catch (err) {
    console.error("Create cycle error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
});

// GET /api/cycles/:id — get cycle with all paso data
router.get("/:id", async (req, res) => {
  try {
    const cycle = await TeacherCycle.findOne({ _id: req.params.id, teacherId: req.user.userId });
    if (!cycle) return res.status(404).json({ message: "Cycle not found." });

    const [paso1, paso3, paso4, paso5, paso6, students, lessonPlan] = await Promise.all([
      Paso1Submission.findOne({ teacherCycleId: cycle._id }),
      Paso3Submission.findOne({ teacherCycleId: cycle._id }),
      Paso4Submission.findOne({ teacherCycleId: cycle._id }),
      Paso5Submission.findOne({ teacherCycleId: cycle._id }),
      Paso6Submission.findOne({ teacherCycleId: cycle._id }),
      Student.find({ teacherCycleId: cycle._id }),
      LessonPlan.findOne({ teacherCycleId: cycle._id }),
    ]);

    const paso2List = await Paso2Submission.find({ teacherCycleId: cycle._id });

    res.json({
      cycle,
      paso1,
      paso2: paso2List,
      paso3,
      paso4,
      paso5,
      paso6,
      students,
      lessonPlan,
    });
  } catch (err) {
    console.error("Get cycle error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
});

// ---- Paso 1 ----
router.get("/:id/paso/1", async (req, res) => {
  try {
    const sub = await Paso1Submission.findOne({ teacherCycleId: req.params.id, teacherId: req.user.userId });
    res.json({ paso1: sub });
  } catch (err) {
    res.status(500).json({ message: "Internal server error." });
  }
});

function normalizeStatus(body) {
  if (body.status === "complete") body.status = "completed";
  return body;
}

const PASO1_KEYS = ["q1_positionality", "q2_hiddenCurriculum", "q3_explicitTeaching", "q4_contentKnowledge", "q5_learningProcess", "q6_studentRelationship", "q7_diversityAffirmation", "q8_learnerModeling", "q9_growthMindset", "q10_preparedness"];

const PASO2_GENERAL_KEYS = ["q1_studentReadiness", "q2_priorKnowledge", "q3_retentionCheck", "q4_academicSkills", "q5_skillPatterns", "q6_differentiation", "q7_languageProficiency", "q8_fundsOfKnowledge", "q9_familyDynamics", "q10_backgroundKnowledge"];

const PASO3_GENERAL_KEYS = ["q1_humanizingPedagogy", "q2_presentLearningObjective", "q3_barriers", "q4_accommodations", "q5_resourcesMaterials", "q6_studentEngagement", "q7_classroomEnvironment", "q8_relateToLives", "q9_backgroundKnowledge"];

const PASO4_GENERAL_KEYS = ["q1_equitableAccess", "q2_supportingEnglishLearners", "q3_homeLanguageSupport", "q4_culturalRelevance", "q5_engagementRepresentation", "q6_groupingForEquity", "q7_essentialQuestionRelevance"];

function normalizeResponseBody(body, keys) {
  const out = { status: body.status === "complete" ? "completed" : (body.status || "draft") };
  for (const key of keys) {
    const val = body[key];
    if (val === undefined) continue;
    if (typeof val === "object" && val !== null && "response" in val) {
      out[key] = { response: val.response || "", isDraft: val.isDraft !== false };
    } else {
      out[key] = { response: typeof val === "string" ? val : "", isDraft: true };
    }
  }
  return out;
}

function normalizePaso1Body(body) {
  const out = { status: body.status === "complete" ? "completed" : (body.status || "draft") };
  for (const key of PASO1_KEYS) {
    const val = body[key];
    if (val === undefined) continue;
    if (typeof val === "object" && val !== null && "response" in val) {
      out[key] = { response: val.response || "", isDraft: val.isDraft !== false };
    } else {
      out[key] = { response: typeof val === "string" ? val : "", isDraft: true };
    }
  }
  return out;
}

router.put("/:id/paso/1", async (req, res) => {
  try {
    const normalized = normalizePaso1Body(req.body);
    const data = {
      teacherCycleId: req.params.id,
      teacherId: req.user.userId,
      ...normalized,
    };
    const sub = await Paso1Submission.findOneAndUpdate(
      { teacherCycleId: req.params.id, teacherId: req.user.userId },
      data,
      { upsert: true, new: true, runValidators: true }
    );
    await TeacherCycle.findByIdAndUpdate(req.params.id, { "pasoStatuses.paso1": sub.status === "completed" ? "completed" : "in_progress" });
    res.json({ paso1: sub });
  } catch (err) {
    console.error("Paso1 save error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
});

// ---- Paso 2 General Questions (Section 1) ----
router.get("/:id/paso/2/general", async (req, res) => {
  try {
    const sub = await Paso2GeneralSubmission.findOne({ teacherCycleId: req.params.id, teacherId: req.user.userId });
    res.json({ paso2General: sub });
  } catch (err) {
    res.status(500).json({ message: "Internal server error." });
  }
});

router.put("/:id/paso/2/general", async (req, res) => {
  try {
    const normalized = normalizeResponseBody(req.body, PASO2_GENERAL_KEYS);
    const data = {
      teacherCycleId: req.params.id,
      teacherId: req.user.userId,
      ...normalized,
    };
    const sub = await Paso2GeneralSubmission.findOneAndUpdate(
      { teacherCycleId: req.params.id, teacherId: req.user.userId },
      data,
      { upsert: true, new: true, runValidators: true }
    );
    res.json({ paso2General: sub });
  } catch (err) {
    console.error("Paso2 general save error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
});

// ---- Paso 2 Knowledge of Learner/Student Profiles (Section 2) ----
router.get("/:id/paso/2", async (req, res) => {
  try {
    const [students, submissions, general] = await Promise.all([
      Student.find({ teacherCycleId: req.params.id, teacherId: req.user.userId }),
      Paso2Submission.find({ teacherCycleId: req.params.id, teacherId: req.user.userId }),
      Paso2GeneralSubmission.findOne({ teacherCycleId: req.params.id, teacherId: req.user.userId }),
    ]);
    res.json({ students, submissions, paso2General: general });
  } catch (err) {
    res.status(500).json({ message: "Internal server error." });
  }
});

router.put("/:id/paso/2", async (req, res) => {
  try {
    const body = normalizeStatus({ ...req.body });
    const { studentId, ...fields } = body;
    if (!studentId) return res.status(400).json({ message: "studentId is required." });
    const data = {
      teacherCycleId: req.params.id,
      teacherId: req.user.userId,
      studentId,
      ...fields,
    };
    const sub = await Paso2Submission.findOneAndUpdate(
      { teacherCycleId: req.params.id, teacherId: req.user.userId, studentId },
      data,
      { upsert: true, new: true, runValidators: true }
    );
    await TeacherCycle.findByIdAndUpdate(req.params.id, { "pasoStatuses.paso2": sub.status === "completed" ? "completed" : "in_progress" });
    res.json({ paso2: sub });
  } catch (err) {
    console.error("Paso2 save error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
});

// ---- Paso 3 General Questions (Section 1) ----
router.get("/:id/paso/3/general", async (req, res) => {
  try {
    const sub = await Paso3GeneralSubmission.findOne({ teacherCycleId: req.params.id, teacherId: req.user.userId });
    res.json({ paso3General: sub });
  } catch (err) {
    res.status(500).json({ message: "Internal server error." });
  }
});

router.put("/:id/paso/3/general", async (req, res) => {
  try {
    const normalized = normalizeResponseBody(req.body, PASO3_GENERAL_KEYS);
    const data = {
      teacherCycleId: req.params.id,
      teacherId: req.user.userId,
      ...normalized,
    };
    const sub = await Paso3GeneralSubmission.findOneAndUpdate(
      { teacherCycleId: req.params.id, teacherId: req.user.userId },
      data,
      { upsert: true, new: true, runValidators: true }
    );
    res.json({ paso3General: sub });
  } catch (err) {
    console.error("Paso3 general save error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
});

// ---- Paso 3 Preliminary Lesson Plan (Section 2) ----
router.get("/:id/paso/3", async (req, res) => {
  try {
    const [sub, general] = await Promise.all([
      Paso3Submission.findOne({ teacherCycleId: req.params.id, teacherId: req.user.userId }),
      Paso3GeneralSubmission.findOne({ teacherCycleId: req.params.id, teacherId: req.user.userId }),
    ]);
    res.json({ paso3: sub, paso3General: general });
  } catch (err) {
    res.status(500).json({ message: "Internal server error." });
  }
});

router.put("/:id/paso/3", async (req, res) => {
  try {
    const data = { teacherCycleId: req.params.id, teacherId: req.user.userId, ...normalizeStatus({ ...req.body }) };
    const sub = await Paso3Submission.findOneAndUpdate(
      { teacherCycleId: req.params.id, teacherId: req.user.userId },
      data,
      { upsert: true, new: true, runValidators: true }
    );
    await TeacherCycle.findByIdAndUpdate(req.params.id, { "pasoStatuses.paso3": sub.status === "completed" ? "completed" : "in_progress" });
    res.json({ paso3: sub });
  } catch (err) {
    console.error("Paso3 save error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
});

// ---- Paso 4 General Questions (Section 1) ----
router.get("/:id/paso/4/general", async (req, res) => {
  try {
    const sub = await Paso4GeneralSubmission.findOne({ teacherCycleId: req.params.id, teacherId: req.user.userId });
    res.json({ paso4General: sub });
  } catch (err) {
    res.status(500).json({ message: "Internal server error." });
  }
});

router.put("/:id/paso/4/general", async (req, res) => {
  try {
    const normalized = normalizeResponseBody(req.body, PASO4_GENERAL_KEYS);
    const data = {
      teacherCycleId: req.params.id,
      teacherId: req.user.userId,
      ...normalized,
    };
    const sub = await Paso4GeneralSubmission.findOneAndUpdate(
      { teacherCycleId: req.params.id, teacherId: req.user.userId },
      data,
      { upsert: true, new: true, runValidators: true }
    );
    res.json({ paso4General: sub });
  } catch (err) {
    console.error("Paso4 general save error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
});

// ---- Paso 4 District Guidelines (Section 2) ----
router.get("/:id/paso/4", async (req, res) => {
  try {
    const [sub, general] = await Promise.all([
      Paso4Submission.findOne({ teacherCycleId: req.params.id, teacherId: req.user.userId }),
      Paso4GeneralSubmission.findOne({ teacherCycleId: req.params.id, teacherId: req.user.userId }),
    ]);
    res.json({ paso4: sub, paso4General: general });
  } catch (err) {
    res.status(500).json({ message: "Internal server error." });
  }
});

router.put("/:id/paso/4", async (req, res) => {
  try {
    const data = { teacherCycleId: req.params.id, teacherId: req.user.userId, ...normalizeStatus({ ...req.body }) };
    const sub = await Paso4Submission.findOneAndUpdate(
      { teacherCycleId: req.params.id, teacherId: req.user.userId },
      data,
      { upsert: true, new: true, runValidators: true }
    );
    await TeacherCycle.findByIdAndUpdate(req.params.id, { "pasoStatuses.paso4": sub.status === "completed" ? "completed" : "in_progress" });
    res.json({ paso4: sub });
  } catch (err) {
    console.error("Paso4 save error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
});

// ---- Paso 5 ----
router.get("/:id/paso/5", async (req, res) => {
  try {
    const sub = await Paso5Submission.findOne({ teacherCycleId: req.params.id, teacherId: req.user.userId });
    res.json({ paso5: sub });
  } catch (err) {
    res.status(500).json({ message: "Internal server error." });
  }
});

router.put("/:id/paso/5", async (req, res) => {
  try {
    const body = normalizeStatus({ ...req.body });
    const data = { teacherCycleId: req.params.id, teacherId: req.user.userId, ...body };
    const sub = await Paso5Submission.findOneAndUpdate(
      { teacherCycleId: req.params.id, teacherId: req.user.userId },
      data,
      { upsert: true, new: true, runValidators: true }
    );
    await TeacherCycle.findByIdAndUpdate(req.params.id, { "pasoStatuses.paso5": sub.status === "completed" ? "completed" : "in_progress" });
    res.json({ paso5: sub });
  } catch (err) {
    console.error("Paso5 save error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
});

// ---- Paso 6 ----
router.get("/:id/paso/6", async (req, res) => {
  try {
    const sub = await Paso6Submission.findOne({ teacherCycleId: req.params.id, teacherId: req.user.userId });
    res.json({ paso6: sub });
  } catch (err) {
    res.status(500).json({ message: "Internal server error." });
  }
});

router.put("/:id/paso/6", async (req, res) => {
  try {
    const data = { teacherCycleId: req.params.id, teacherId: req.user.userId, ...normalizeStatus({ ...req.body }) };
    const sub = await Paso6Submission.findOneAndUpdate(
      { teacherCycleId: req.params.id, teacherId: req.user.userId },
      data,
      { upsert: true, new: true, runValidators: true }
    );
    await TeacherCycle.findByIdAndUpdate(req.params.id, { "pasoStatuses.paso6": sub.status === "completed" ? "completed" : "in_progress" });
    res.json({ paso6: sub });
  } catch (err) {
    console.error("Paso6 save error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
});

module.exports = router;
