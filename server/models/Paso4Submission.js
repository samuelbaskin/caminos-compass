const mongoose = require("mongoose");

const paso4Schema = new mongoose.Schema(
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
    districtStandards: { type: String, default: "" },
    curriculumRequirements: { type: String, default: "" },
    assessmentGuidelines: { type: String, default: "" },
    accommodationPolicies: { type: String, default: "" },
    additionalNotes: { type: String, default: "" },
    status: {
      type: String,
      enum: ["draft", "completed"],
      default: "draft",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Paso4Submission", paso4Schema);
