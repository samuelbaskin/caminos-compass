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
    stage: {
      type: String,
      enum: ["pre", "observation", "post"],
      default: "pre",
      index: true,
    },
    q1_partnerConnect: { type: String, default: "" },
    q2_greetStudents: { type: String, default: "" },
    q3_comfortableParticipate: { type: String, default: "" },
    q4_teamBuilding: { type: String, default: "" },
    q5_getToKnowStudents: { type: String, default: "" },
    q6_topicRelevant: { type: String, default: "" },
    q7_learningModalities: { type: String, default: "" },
    q8_activitiesToLearn: { type: String, default: "" },
    status: {
      type: String,
      enum: ["draft", "completed"],
      default: "draft",
    },
  },
  { timestamps: true }
);

paso5Schema.index({ teacherCycleId: 1, teacherId: 1, stage: 1 }, { unique: true });

module.exports = mongoose.model("Paso5Submission", paso5Schema);
