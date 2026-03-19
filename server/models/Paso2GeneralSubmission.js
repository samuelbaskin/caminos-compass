const mongoose = require("mongoose");

const responseSchema = new mongoose.Schema(
  {
    response: { type: String, default: "" },
    isDraft: { type: Boolean, default: true },
  },
  { _id: false }
);

const paso2GeneralSchema = new mongoose.Schema(
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
    q1_studentReadiness: responseSchema,
    q2_priorKnowledge: responseSchema,
    q3_retentionCheck: responseSchema,
    q4_academicSkills: responseSchema,
    q5_skillPatterns: responseSchema,
    q6_differentiation: responseSchema,
    q7_languageProficiency: responseSchema,
    q8_fundsOfKnowledge: responseSchema,
    q9_familyDynamics: responseSchema,
    q10_backgroundKnowledge: responseSchema,
    status: {
      type: String,
      enum: ["draft", "completed"],
      default: "draft",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Paso2GeneralSubmission", paso2GeneralSchema);
