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
    understandingProficiency: { type: String, default: "" },
    understandingProgress: { type: Number, default: 0, min: 0, max: 100 },
    instructionalAdjustments: { type: String, default: "" },
    instructionalProgress: { type: Number, default: 0, min: 0, max: 100 },
    equitableAdvocacy: { type: String, default: "" },
    equitableProgress: { type: Number, default: 0, min: 0, max: 100 },
    parentInclusion: { type: String, default: "" },
    parentProgress: { type: Number, default: 0, min: 0, max: 100 },
    studentParentFeedback: { type: String, default: "" },
    status: {
      type: String,
      enum: ["draft", "completed"],
      default: "draft",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Paso6Submission", paso6Schema);
