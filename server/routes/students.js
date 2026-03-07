const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Student = require("../models/Student");
const { evaluateWritingSample } = require("../services/gemini");

const router = express.Router();

const uploadsDir = process.env.VERCEL
  ? path.join("/tmp", "uploads")
  : path.join(__dirname, "..", "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// POST /api/students — create student for a cycle
router.post("/", async (req, res) => {
  try {
    const { teacherCycleId, firstName, lastName, grade, demographics } = req.body;
    if (!teacherCycleId || !firstName || !lastName) {
      return res.status(400).json({ message: "teacherCycleId, firstName, and lastName are required." });
    }
    const student = await Student.create({
      teacherId: req.user.userId,
      teacherCycleId,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      grade: grade || "",
      demographics: demographics || {},
    });
    res.status(201).json({ student });
  } catch (err) {
    console.error("Create student error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
});

// GET /api/students?cycleId=xxx — list students for a cycle
router.get("/", async (req, res) => {
  try {
    const filter = { teacherId: req.user.userId };
    if (req.query.cycleId) filter.teacherCycleId = req.query.cycleId;
    const students = await Student.find(filter).sort({ createdAt: -1 });
    res.json({ students });
  } catch (err) {
    res.status(500).json({ message: "Internal server error." });
  }
});

// PUT /api/students/:id — update student info
router.put("/:id", async (req, res) => {
  try {
    const student = await Student.findOneAndUpdate(
      { _id: req.params.id, teacherId: req.user.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!student) return res.status(404).json({ message: "Student not found." });
    res.json({ student });
  } catch (err) {
    console.error("Update student error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
});

// POST /api/students/:id/writing-sample — upload writing sample + trigger LLM eval
router.post("/:id/writing-sample", upload.single("file"), async (req, res) => {
  try {
    const student = await Student.findOne({ _id: req.params.id, teacherId: req.user.userId });
    if (!student) return res.status(404).json({ message: "Student not found." });

    let sampleText = req.body.text || "";
    if (req.file) {
      student.writingSamplePreFile = req.file.filename;
      if (!sampleText) {
        sampleText = fs.readFileSync(req.file.path, "utf-8").substring(0, 10000);
      }
    }

    student.writingSamplePre = sampleText;

    if (sampleText) {
      try {
        const evaluation = await evaluateWritingSample(sampleText, student);
        student.llmEvaluation = evaluation;
      } catch (llmErr) {
        console.error("LLM evaluation error:", llmErr.message);
        student.llmEvaluation = "LLM evaluation unavailable. Error: " + llmErr.message;
      }
    }

    await student.save();
    res.json({ student });
  } catch (err) {
    console.error("Writing sample error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
});

module.exports = router;
