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
const { normalizeStage, baseStageQuery } = require("../utils/stage");
const { getRubricBlock } = require("../utils/pasoRubric");
const { evaluatePasoResponse, STAGE_CONTEXT_LABELS } = require("../services/gemini");

const router = express.Router();

function stageFromReq(req) {
  return normalizeStage(req.query.stage ?? req.body?.stage);
}

function stripStageFromBody(body) {
  if (!body || typeof body !== "object") return body;
  const { stage: _s, ...rest } = body;
  return rest;
}

function submissionToCycleStatus(status) {
  if (status === "completed") return "completed";
  if (status === "draft") return "in_progress";
  return "not_started";
}

async function setCycleStagePaso(cycleId, stage, pasoKey, submissionStatus) {
  const st = normalizeStage(stage);
  const cycleStatus = submissionToCycleStatus(submissionStatus);
  const path = `stagePasoStatuses.${st}.${pasoKey}`;
  const update = { $set: { [path]: cycleStatus } };
  if (st === "pre") {
    update.$set[`pasoStatuses.${pasoKey}`] = cycleStatus;
  }
  await TeacherCycle.findByIdAndUpdate(cycleId, update);
}

async function setPaso3AggregateCycleStatus(cycleId, teacherId, stage) {
  const st = normalizeStage(stage);
  const filter = baseStageQuery(cycleId, teacherId, st);
  const [general, main] = await Promise.all([
    Paso3GeneralSubmission.findOne(filter),
    Paso3Submission.findOne(filter),
  ]);
  const g = general?.status;
  const m = main?.status;
  let cycleStatus = "not_started";
  if (g === "completed" && m === "completed") cycleStatus = "completed";
  else if (g === "draft" || m === "draft" || g === "completed" || m === "completed") cycleStatus = "in_progress";
  const path = `stagePasoStatuses.${st}.paso3`;
  const update = { $set: { [path]: cycleStatus } };
  if (st === "pre") update.$set["pasoStatuses.paso3"] = cycleStatus;
  await TeacherCycle.findByIdAndUpdate(cycleId, update);
}

async function setPaso4AggregateCycleStatus(cycleId, teacherId, stage) {
  const st = normalizeStage(stage);
  const filter = baseStageQuery(cycleId, teacherId, st);
  const [general, main] = await Promise.all([
    Paso4GeneralSubmission.findOne(filter),
    Paso4Submission.findOne(filter),
  ]);
  const g = general?.status;
  const m = main?.status;
  let cycleStatus = "not_started";
  if (g === "completed" && m === "completed") cycleStatus = "completed";
  else if (g === "draft" || m === "draft" || g === "completed" || m === "completed") cycleStatus = "in_progress";
  const path = `stagePasoStatuses.${st}.paso4`;
  const update = { $set: { [path]: cycleStatus } };
  if (st === "pre") update.$set["pasoStatuses.paso4"] = cycleStatus;
  await TeacherCycle.findByIdAndUpdate(cycleId, update);
}

async function recomputePaso2StageStatus(cycleId, teacherId, stage) {
  const st = normalizeStage(stage);
  const filter = baseStageQuery(cycleId, teacherId, st);
  const [general, students, subs] = await Promise.all([
    Paso2GeneralSubmission.findOne(filter),
    Student.find({ teacherCycleId: cycleId, teacherId }),
    Paso2Submission.find(filter),
  ]);
  const gOk = general?.status === "completed";
  const gProg = general?.status === "draft";
  let paso2Cycle = "not_started";
  if (students.length === 0) {
    if (gOk) paso2Cycle = "completed";
    else if (gProg) paso2Cycle = "in_progress";
  } else {
    const allDone = students.every((s) => {
      const sub = subs.find((x) => x.studentId.toString() === s._id.toString());
      return sub?.status === "completed";
    });
    const anyProg = students.some((s) => {
      const sub = subs.find((x) => x.studentId.toString() === s._id.toString());
      return sub?.status === "draft" || sub?.status === "completed";
    });
    if (gOk && allDone) paso2Cycle = "completed";
    else if (gProg || anyProg || gOk) paso2Cycle = "in_progress";
  }
  const path = `stagePasoStatuses.${st}.paso2`;
  const update = { $set: { [path]: paso2Cycle } };
  if (st === "pre") update.$set["pasoStatuses.paso2"] = paso2Cycle;
  await TeacherCycle.findByIdAndUpdate(cycleId, update);
}

function docProgress(doc) {
  if (!doc) return { pct: 0, status: "not_started" };
  if (doc.status === "completed") return { pct: 100, status: "completed" };
  if (doc.status === "draft") return { pct: 50, status: "in_progress" };
  return { pct: 0, status: "not_started" };
}

async function buildProgressPayload(cycleId, teacherId) {
  const stages = ["pre", "observation", "post"];
  const result = {};
  let totalSum = 0;
  for (const st of stages) {
    const filter = baseStageQuery(cycleId, teacherId, st);
    const [
      paso1,
      paso2General,
      paso3General,
      paso3,
      paso4General,
      paso4,
      paso5,
      paso6,
      students,
      paso2Subs,
    ] = await Promise.all([
      Paso1Submission.findOne(filter),
      Paso2GeneralSubmission.findOne(filter),
      Paso3GeneralSubmission.findOne(filter),
      Paso3Submission.findOne(filter),
      Paso4GeneralSubmission.findOne(filter),
      Paso4Submission.findOne(filter),
      Paso5Submission.findOne(filter),
      Paso6Submission.findOne(filter),
      Student.find({ teacherCycleId: cycleId, teacherId }),
      Paso2Submission.find(filter),
    ]);

    const p1 = docProgress(paso1);
    const p2g = docProgress(paso2General);
    let p2Pct;
    let p2Status;
    if (students.length === 0) {
      p2Pct = p2g.pct;
      p2Status = p2g.status;
    } else {
      const parts = [p2g.pct];
      for (const s of students) {
        const sub = paso2Subs.find((x) => x.studentId.toString() === s._id.toString());
        parts.push(docProgress(sub).pct);
      }
      p2Pct = Math.round(parts.reduce((a, b) => a + b, 0) / parts.length);
      const allComplete =
        p2g.status === "completed" &&
        students.every((s) => {
          const sub = paso2Subs.find((x) => x.studentId.toString() === s._id.toString());
          return sub?.status === "completed";
        });
      const anyStarted =
        p2g.status !== "not_started" ||
        students.some((s) => {
          const sub = paso2Subs.find((x) => x.studentId.toString() === s._id.toString());
          return sub && (sub.status === "draft" || sub.status === "completed");
        });
      if (allComplete) p2Status = "completed";
      else if (anyStarted) p2Status = "in_progress";
      else p2Status = "not_started";
    }

    const p3g = docProgress(paso3General);
    const p3 = docProgress(paso3);
    const p3Avg = Math.round((p3g.pct + p3.pct) / 2);
    const p3Status =
      p3g.status === "completed" && p3.status === "completed"
        ? "completed"
        : p3g.status !== "not_started" || p3.status !== "not_started"
          ? "in_progress"
          : "not_started";

    const p4g = docProgress(paso4General);
    const p4 = docProgress(paso4);
    const p4Avg = Math.round((p4g.pct + p4.pct) / 2);
    const p4Status =
      p4g.status === "completed" && p4.status === "completed"
        ? "completed"
        : p4g.status !== "not_started" || p4.status !== "not_started"
          ? "in_progress"
          : "not_started";

    const p5 = docProgress(paso5);
    const p6 = docProgress(paso6);

    const pasos = {
      paso1: { ...p1, pct: p1.pct },
      paso2: { pct: p2Pct, status: p2Status },
      paso3: { pct: p3Avg, status: p3Status },
      paso4: { pct: p4Avg, status: p4Status },
      paso5: { ...p5 },
      paso6: { ...p6 },
    };
    const stagePct = Math.round(
      (pasos.paso1.pct +
        pasos.paso2.pct +
        pasos.paso3.pct +
        pasos.paso4.pct +
        pasos.paso5.pct +
        pasos.paso6.pct) /
        6
    );
    totalSum += stagePct;
    result[st] = { pasos, stagePct };
  }
  return { stages: result, totalPct: Math.round(totalSum / 3) };
}

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

// GET /api/cycles/:id/progress — per-stage and total Paso completion (must be before /:id)
router.get("/:id/progress", async (req, res) => {
  try {
    const cycle = await TeacherCycle.findOne({ _id: req.params.id, teacherId: req.user.userId });
    if (!cycle) return res.status(404).json({ message: "Cycle not found." });
    const payload = await buildProgressPayload(cycle._id, req.user.userId);
    res.json(payload);
  } catch (err) {
    console.error("Cycle progress error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
});

const PASO_REVIEW_SECTIONS = new Set(["main", "general", "plan", "guidelines", "advocacy"]);

// POST /api/cycles/:id/paso-response-review — AI sufficiency score + optional follow-up (must be before /:id)
router.post("/:id/paso-response-review", async (req, res) => {
  try {
    const cycle = await TeacherCycle.findOne({ _id: req.params.id, teacherId: req.user.userId });
    if (!cycle) return res.status(404).json({ message: "Cycle not found." });

    const stage = normalizeStage(req.body?.stage);
    const pasoNum = Number(req.body?.pasoNum);
    const sectionRaw = typeof req.body?.section === "string" ? req.body.section.trim() : "";
    const section = sectionRaw || "main";
    const fieldKey = typeof req.body?.fieldKey === "string" ? req.body.fieldKey.trim() : "";
    const responseText = typeof req.body?.responseText === "string" ? req.body.responseText : "";
    const questionLabel = typeof req.body?.questionLabel === "string" ? req.body.questionLabel.trim() : "";

    if (![1, 2, 3, 4, 5, 6].includes(pasoNum)) {
      return res.status(400).json({ message: "pasoNum must be 1–6." });
    }
    if (!PASO_REVIEW_SECTIONS.has(section)) {
      return res.status(400).json({ message: "Invalid section." });
    }
    if (!fieldKey) return res.status(400).json({ message: "fieldKey is required." });
    if (!questionLabel) return res.status(400).json({ message: "questionLabel is required." });

    const trimmed = responseText.trim();
    if (!trimmed) {
      return res.json({
        score: 0,
        feedback: "Add a written response before submitting for AI review.",
        followUpQuestion: "What detail from your context could you share to begin answering this prompt?",
      });
    }

    const rubricBlock = getRubricBlock(stage, pasoNum, section, fieldKey);
    const stageLabel = STAGE_CONTEXT_LABELS[stage] || stage;

    const out = await evaluatePasoResponse({
      stageLabel,
      questionLabel,
      teacherResponse: trimmed,
      rubricBlock,
    });
    res.json(out);
  } catch (err) {
    console.error("Paso response review error:", err);
    res.status(500).json({ message: err.message || "Review failed." });
  }
});

// GET /api/cycles/:id — get cycle with roster and lesson plans (Paso payloads are stage-scoped; use /paso/*?stage=)
router.get("/:id", async (req, res) => {
  try {
    const cycle = await TeacherCycle.findOne({ _id: req.params.id, teacherId: req.user.userId });
    if (!cycle) return res.status(404).json({ message: "Cycle not found." });

    const [students, lessonPlans] = await Promise.all([
      Student.find({ teacherCycleId: cycle._id }),
      LessonPlan.find({ teacherCycleId: cycle._id }).sort({ updatedAt: -1 }),
    ]);

    const lessonPlan = lessonPlans[0] || null;

    res.json({
      cycle,
      students,
      lessonPlan,
      lessonPlans,
    });
  } catch (err) {
    console.error("Get cycle error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
});

// ---- Paso 1 ----
router.get("/:id/paso/1", async (req, res) => {
  try {
    const stage = stageFromReq(req);
    const sub = await Paso1Submission.findOne(baseStageQuery(req.params.id, req.user.userId, stage));
    res.json({ paso1: sub, stage });
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
    const stage = stageFromReq(req);
    const body = stripStageFromBody(req.body);
    const normalized = normalizePaso1Body(body);
    const data = {
      teacherCycleId: req.params.id,
      teacherId: req.user.userId,
      stage,
      ...normalized,
    };
    const filter = baseStageQuery(req.params.id, req.user.userId, stage);
    const sub = await Paso1Submission.findOneAndUpdate(filter, data, { upsert: true, new: true, runValidators: true });
    await setCycleStagePaso(req.params.id, stage, "paso1", sub.status);
    res.json({ paso1: sub, stage });
  } catch (err) {
    console.error("Paso1 save error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
});

// ---- Paso 2 General Questions (Section 1) ----
router.get("/:id/paso/2/general", async (req, res) => {
  try {
    const stage = stageFromReq(req);
    const sub = await Paso2GeneralSubmission.findOne(baseStageQuery(req.params.id, req.user.userId, stage));
    res.json({ paso2General: sub, stage });
  } catch (err) {
    res.status(500).json({ message: "Internal server error." });
  }
});

router.put("/:id/paso/2/general", async (req, res) => {
  try {
    const stage = stageFromReq(req);
    const body = stripStageFromBody(req.body);
    const normalized = normalizeResponseBody(body, PASO2_GENERAL_KEYS);
    const data = {
      teacherCycleId: req.params.id,
      teacherId: req.user.userId,
      stage,
      ...normalized,
    };
    const filter = baseStageQuery(req.params.id, req.user.userId, stage);
    const sub = await Paso2GeneralSubmission.findOneAndUpdate(filter, data, { upsert: true, new: true, runValidators: true });
    await recomputePaso2StageStatus(req.params.id, req.user.userId, stage);
    res.json({ paso2General: sub, stage });
  } catch (err) {
    console.error("Paso2 general save error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
});

// ---- Paso 2 Knowledge of Learner/Student Profiles (Section 2) ----
router.get("/:id/paso/2", async (req, res) => {
  try {
    const stage = stageFromReq(req);
    const filter = baseStageQuery(req.params.id, req.user.userId, stage);
    const [students, submissions, general] = await Promise.all([
      Student.find({ teacherCycleId: req.params.id, teacherId: req.user.userId }),
      Paso2Submission.find(filter),
      Paso2GeneralSubmission.findOne(filter),
    ]);
    res.json({ students, submissions, paso2General: general, stage });
  } catch (err) {
    res.status(500).json({ message: "Internal server error." });
  }
});

router.put("/:id/paso/2", async (req, res) => {
  try {
    const stage = stageFromReq(req);
    const body = normalizeStatus({ ...stripStageFromBody(req.body) });
    const { studentId, ...fields } = body;
    if (!studentId) return res.status(400).json({ message: "studentId is required." });
    const data = {
      teacherCycleId: req.params.id,
      teacherId: req.user.userId,
      stage,
      studentId,
      ...fields,
    };
    const filter = { ...baseStageQuery(req.params.id, req.user.userId, stage), studentId };
    const sub = await Paso2Submission.findOneAndUpdate(filter, data, { upsert: true, new: true, runValidators: true });
    await recomputePaso2StageStatus(req.params.id, req.user.userId, stage);
    res.json({ paso2: sub, stage });
  } catch (err) {
    console.error("Paso2 save error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
});

// ---- Paso 3 General Questions (Section 1) ----
router.get("/:id/paso/3/general", async (req, res) => {
  try {
    const stage = stageFromReq(req);
    const sub = await Paso3GeneralSubmission.findOne(baseStageQuery(req.params.id, req.user.userId, stage));
    res.json({ paso3General: sub, stage });
  } catch (err) {
    res.status(500).json({ message: "Internal server error." });
  }
});

router.put("/:id/paso/3/general", async (req, res) => {
  try {
    const stage = stageFromReq(req);
    const body = stripStageFromBody(req.body);
    const normalized = normalizeResponseBody(body, PASO3_GENERAL_KEYS);
    const data = {
      teacherCycleId: req.params.id,
      teacherId: req.user.userId,
      stage,
      ...normalized,
    };
    const filter = baseStageQuery(req.params.id, req.user.userId, stage);
    const sub = await Paso3GeneralSubmission.findOneAndUpdate(filter, data, { upsert: true, new: true, runValidators: true });
    await setPaso3AggregateCycleStatus(req.params.id, req.user.userId, stage);
    res.json({ paso3General: sub, stage });
  } catch (err) {
    console.error("Paso3 general save error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
});

// ---- Paso 3 Preliminary Lesson Plan (Section 2) ----
router.get("/:id/paso/3", async (req, res) => {
  try {
    const stage = stageFromReq(req);
    const filter = baseStageQuery(req.params.id, req.user.userId, stage);
    const [sub, general] = await Promise.all([
      Paso3Submission.findOne(filter),
      Paso3GeneralSubmission.findOne(filter),
    ]);
    res.json({ paso3: sub, paso3General: general, stage });
  } catch (err) {
    res.status(500).json({ message: "Internal server error." });
  }
});

router.put("/:id/paso/3", async (req, res) => {
  try {
    const stage = stageFromReq(req);
    const body = stripStageFromBody(req.body);
    const data = { teacherCycleId: req.params.id, teacherId: req.user.userId, stage, ...normalizeStatus({ ...body }) };
    const filter = baseStageQuery(req.params.id, req.user.userId, stage);
    const sub = await Paso3Submission.findOneAndUpdate(filter, data, { upsert: true, new: true, runValidators: true });
    await setPaso3AggregateCycleStatus(req.params.id, req.user.userId, stage);
    res.json({ paso3: sub, stage });
  } catch (err) {
    console.error("Paso3 save error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
});

// ---- Paso 4 General Questions (Section 1) ----
router.get("/:id/paso/4/general", async (req, res) => {
  try {
    const stage = stageFromReq(req);
    const sub = await Paso4GeneralSubmission.findOne(baseStageQuery(req.params.id, req.user.userId, stage));
    res.json({ paso4General: sub, stage });
  } catch (err) {
    res.status(500).json({ message: "Internal server error." });
  }
});

router.put("/:id/paso/4/general", async (req, res) => {
  try {
    const stage = stageFromReq(req);
    const body = stripStageFromBody(req.body);
    const normalized = normalizeResponseBody(body, PASO4_GENERAL_KEYS);
    const data = {
      teacherCycleId: req.params.id,
      teacherId: req.user.userId,
      stage,
      ...normalized,
    };
    const filter = baseStageQuery(req.params.id, req.user.userId, stage);
    const sub = await Paso4GeneralSubmission.findOneAndUpdate(filter, data, { upsert: true, new: true, runValidators: true });
    await setPaso4AggregateCycleStatus(req.params.id, req.user.userId, stage);
    res.json({ paso4General: sub, stage });
  } catch (err) {
    console.error("Paso4 general save error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
});

// ---- Paso 4 District Guidelines (Section 2) ----
router.get("/:id/paso/4", async (req, res) => {
  try {
    const stage = stageFromReq(req);
    const filter = baseStageQuery(req.params.id, req.user.userId, stage);
    const [sub, general] = await Promise.all([
      Paso4Submission.findOne(filter),
      Paso4GeneralSubmission.findOne(filter),
    ]);
    res.json({ paso4: sub, paso4General: general, stage });
  } catch (err) {
    res.status(500).json({ message: "Internal server error." });
  }
});

router.put("/:id/paso/4", async (req, res) => {
  try {
    const stage = stageFromReq(req);
    const body = stripStageFromBody(req.body);
    const data = { teacherCycleId: req.params.id, teacherId: req.user.userId, stage, ...normalizeStatus({ ...body }) };
    const filter = baseStageQuery(req.params.id, req.user.userId, stage);
    const sub = await Paso4Submission.findOneAndUpdate(filter, data, { upsert: true, new: true, runValidators: true });
    await setPaso4AggregateCycleStatus(req.params.id, req.user.userId, stage);
    res.json({ paso4: sub, stage });
  } catch (err) {
    console.error("Paso4 save error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
});

// ---- Paso 5 ----
router.get("/:id/paso/5", async (req, res) => {
  try {
    const stage = stageFromReq(req);
    const sub = await Paso5Submission.findOne(baseStageQuery(req.params.id, req.user.userId, stage));
    res.json({ paso5: sub, stage });
  } catch (err) {
    res.status(500).json({ message: "Internal server error." });
  }
});

router.put("/:id/paso/5", async (req, res) => {
  try {
    const stage = stageFromReq(req);
    const body = normalizeStatus({ ...stripStageFromBody(req.body) });
    const data = { teacherCycleId: req.params.id, teacherId: req.user.userId, stage, ...body };
    const filter = baseStageQuery(req.params.id, req.user.userId, stage);
    const sub = await Paso5Submission.findOneAndUpdate(filter, data, { upsert: true, new: true, runValidators: true });
    await setCycleStagePaso(req.params.id, stage, "paso5", sub.status);
    res.json({ paso5: sub, stage });
  } catch (err) {
    console.error("Paso5 save error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
});

// ---- Paso 6 ----
router.get("/:id/paso/6", async (req, res) => {
  try {
    const stage = stageFromReq(req);
    const sub = await Paso6Submission.findOne(baseStageQuery(req.params.id, req.user.userId, stage));
    res.json({ paso6: sub, stage });
  } catch (err) {
    res.status(500).json({ message: "Internal server error." });
  }
});

router.put("/:id/paso/6", async (req, res) => {
  try {
    const stage = stageFromReq(req);
    const body = stripStageFromBody(req.body);
    const data = { teacherCycleId: req.params.id, teacherId: req.user.userId, stage, ...normalizeStatus({ ...body }) };
    const filter = baseStageQuery(req.params.id, req.user.userId, stage);
    const sub = await Paso6Submission.findOneAndUpdate(filter, data, { upsert: true, new: true, runValidators: true });
    await setCycleStagePaso(req.params.id, stage, "paso6", sub.status);
    res.json({ paso6: sub, stage });
  } catch (err) {
    console.error("Paso6 save error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
});

module.exports = router;
