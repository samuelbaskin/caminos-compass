const mongoose = require("mongoose");

const paso2Schema = new mongoose.Schema(
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
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    notes: { type: String, default: "" },
    knowledgeOfOther: { type: String, default: "" },
    learningGoals: { type: String, default: "" },
    supportNeeds: { type: String, default: "" },
    assessment: { type: String, default: "" },
    finalReview: { type: String, default: "" },
    status: {
      type: String,
      enum: ["draft", "completed"],
      default: "draft",
    },
  },
  { timestamps: true }
);

paso2Schema.index({ teacherCycleId: 1, teacherId: 1, studentId: 1, stage: 1 }, { unique: true });

module.exports = mongoose.model("Paso2Submission", paso2Schema);
