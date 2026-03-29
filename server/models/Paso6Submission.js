const mongoose = require("mongoose");

const paso6Schema = new mongoose.Schema(
  {
    teacherCycleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TeacherCycle",
      required: true,
      index: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    stage: {
      type: String,
      enum: ["pre", "observation", "post"],
      default: "pre",
      index: true,
    },
    understandingProficiency: { type: String, default: "" },
    understandingProgress: { type: Number, default: 0, min: 0, max: 100 },
    instructionalAdjustments: { type: String, default: "" },
    instructionalProgress: { type: Number, default: 0, min: 0, max: 100 },
    equitableAdvocacy: { type: String, default: "" },
    equitableProgress: { type: Number, default: 0, min: 0, max: 100 },
    parentInclusion: { type: String, default: "" },
    parentProgress: { type: Number, default: 0, min: 0, max: 100 },
    q1_advocateEquity: { type: String, default: "" },
    q2_scaffolding: { type: String, default: "" },
    q3_fitWithinUnit: { type: String, default: "" },
    q4_assessmentData: { type: String, default: "" },
    q5_barriersChallenges: { type: String, default: "" },
    q6_showLearningWays: { type: String, default: "" },
    status: {
      type: String,
      enum: ["draft", "completed"],
      default: "draft",
    },
  },
  { timestamps: true }
);

paso6Schema.index({ teacherCycleId: 1, teacherId: 1, stage: 1 }, { unique: true });

module.exports = mongoose.model("Paso6Submission", paso6Schema);
