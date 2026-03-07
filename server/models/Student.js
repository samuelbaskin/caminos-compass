const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
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
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    grade: { type: String, default: "" },
    demographics: {
      ethnicity: { type: String, default: "" },
      homeLanguage: { type: String, default: "" },
      elpLevel: { type: String, default: "" },
      specialPrograms: { type: String, default: "" },
      notes: { type: String, default: "" },
    },
    writingSamplePre: { type: String, default: "" },
    writingSamplePreFile: { type: String, default: "" },
    writingSamplePost: { type: String, default: "" },
    llmEvaluation: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);
