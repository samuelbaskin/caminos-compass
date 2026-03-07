const mongoose = require("mongoose");

const paso5Schema = new mongoose.Schema(
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
    homeLanguageSupport: { type: String, default: "" },
    equitableTreatment: { type: String, default: "" },
    engagementAtProficiencyLevel: { type: String, default: "" },
    partnerWithStudentsAndFamilies: { type: String, default: "" },
    additionalNotes: { type: String, default: "" },
    status: {
      type: String,
      enum: ["draft", "completed"],
      default: "draft",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Paso5Submission", paso5Schema);
