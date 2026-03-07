const mongoose = require("mongoose");

const lessonPlanSchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    teacherCycleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TeacherCycle",
      required: true,
      index: true,
    },
    content: { type: String, default: "" },
    paso1to5Input: { type: mongoose.Schema.Types.Mixed, default: {} },
    paso5Id: { type: mongoose.Schema.Types.ObjectId, ref: "Paso5Submission" },
    paso6Id: { type: mongoose.Schema.Types.ObjectId, ref: "Paso6Submission" },
    status: {
      type: String,
      enum: ["draft", "generated", "finalized"],
      default: "draft",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LessonPlan", lessonPlanSchema);
