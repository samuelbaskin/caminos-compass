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
    positionality: subQuestionnaireSchema,
    assumptions: subQuestionnaireSchema,
    relationshipToStudents: subQuestionnaireSchema,
    awarenessOfBias: subQuestionnaireSchema,
    instructionalIntention: subQuestionnaireSchema,
    status: {
      type: String,
      enum: ["draft", "completed"],
      default: "draft",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Paso1Submission", paso1Schema);
