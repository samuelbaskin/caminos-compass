const mongoose = require("mongoose");

const responseSchema = new mongoose.Schema(
  {
    response: { type: String, default: "" },
    isDraft: { type: Boolean, default: true },
  },
  { _id: false }
);

const paso3GeneralSchema = new mongoose.Schema(
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
    q1_humanizingPedagogy: responseSchema,
    q2_presentLearningObjective: responseSchema,
    q3_barriers: responseSchema,
    q4_accommodations: responseSchema,
    q5_resourcesMaterials: responseSchema,
    q6_studentEngagement: responseSchema,
    q7_classroomEnvironment: responseSchema,
    q8_relateToLives: responseSchema,
    q9_backgroundKnowledge: responseSchema,
    status: {
      type: String,
      enum: ["draft", "completed"],
      default: "draft",
    },
  },
  { timestamps: true }
);

paso3GeneralSchema.index({ teacherCycleId: 1, teacherId: 1, stage: 1 }, { unique: true });

module.exports = mongoose.model("Paso3GeneralSubmission", paso3GeneralSchema);
