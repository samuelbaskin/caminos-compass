const mongoose = require("mongoose");

const coachEvaluationSchema = new mongoose.Schema(
  {
    coachId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    lessonPlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LessonPlan",
      required: true,
    },
    strengths: { type: String, default: "" },
    areasForImprovement: { type: String, default: "" },
    suggestions: { type: String, default: "" },
    additionalNotes: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CoachEvaluation", coachEvaluationSchema);
