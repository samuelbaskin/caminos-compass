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

module.exports = mongoose.model("Paso5Submission", paso5Schema);
