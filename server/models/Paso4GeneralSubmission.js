const mongoose = require("mongoose");

const responseSchema = new mongoose.Schema(
  {
    response: { type: String, default: "" },
    isDraft: { type: Boolean, default: true },
  },
  { _id: false }
);

const paso4GeneralSchema = new mongoose.Schema(
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
    q1_equitableAccess: responseSchema,
    q2_supportingEnglishLearners: responseSchema,
    q3_homeLanguageSupport: responseSchema,
    q4_culturalRelevance: responseSchema,
    q5_engagementRepresentation: responseSchema,
    q6_groupingForEquity: responseSchema,
    q7_essentialQuestionRelevance: responseSchema,
    status: {
      type: String,
      enum: ["draft", "completed"],
      default: "draft",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Paso4GeneralSubmission", paso4GeneralSchema);
