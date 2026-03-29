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
    stage: {
      type: String,
      enum: ["pre", "observation", "post"],
      default: "pre",
      index: true,
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

paso4Schema.index({ teacherCycleId: 1, teacherId: 1, stage: 1 }, { unique: true });

module.exports = mongoose.model("Paso4Submission", paso4Schema);
