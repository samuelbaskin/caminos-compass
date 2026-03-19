const mongoose = require("mongoose");

const subQuestionnaireSchema = new mongoose.Schema(
  {
    response: { type: String, default: "" },
    isDraft: { type: Boolean, default: true },
  },
  { _id: false }
);

const paso1Schema = new mongoose.Schema(
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
    q1_positionality: subQuestionnaireSchema,
    q2_hiddenCurriculum: subQuestionnaireSchema,
    q3_explicitTeaching: subQuestionnaireSchema,
    q4_contentKnowledge: subQuestionnaireSchema,
    q5_learningProcess: subQuestionnaireSchema,
    q6_studentRelationship: subQuestionnaireSchema,
    q7_diversityAffirmation: subQuestionnaireSchema,
    q8_learnerModeling: subQuestionnaireSchema,
    q9_growthMindset: subQuestionnaireSchema,
    q10_preparedness: subQuestionnaireSchema,
    status: {
      type: String,
      enum: ["draft", "completed"],
      default: "draft",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Paso1Submission", paso1Schema);
