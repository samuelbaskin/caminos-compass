const mongoose = require("mongoose");

const paso3Schema = new mongoose.Schema(
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
    lessonTitle: { type: String, default: "" },
    gradeLevel: { type: String, default: "" },
    subjectArea: { type: String, default: "" },
    lessonObjectives: { type: String, default: "" },
    lessonStructure: { type: String, default: "" },
    materialsResources: { type: String, default: "" },
    uploadedFilePath: { type: String, default: "" },
    status: {
      type: String,
      enum: ["draft", "completed"],
      default: "draft",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Paso3Submission", paso3Schema);
