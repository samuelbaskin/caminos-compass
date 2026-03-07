const mongoose = require("mongoose");

const teacherCycleSchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      default: "My Coaching Cycle",
      trim: true,
    },
    status: {
      type: String,
      enum: ["in_progress", "completed"],
      default: "in_progress",
    },
    pasoStatuses: {
      paso1: { type: String, enum: ["not_started", "in_progress", "completed"], default: "not_started" },
      paso2: { type: String, enum: ["not_started", "in_progress", "completed"], default: "not_started" },
      paso3: { type: String, enum: ["not_started", "in_progress", "completed"], default: "not_started" },
      paso4: { type: String, enum: ["not_started", "in_progress", "completed"], default: "not_started" },
      paso5: { type: String, enum: ["not_started", "in_progress", "completed"], default: "not_started" },
      paso6: { type: String, enum: ["not_started", "in_progress", "completed"], default: "not_started" },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TeacherCycle", teacherCycleSchema);
