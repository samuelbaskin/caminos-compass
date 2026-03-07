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

module.exports = mongoose.model("Paso2Submission", paso2Schema);
