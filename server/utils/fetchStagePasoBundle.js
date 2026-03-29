const Paso1Submission = require("../models/Paso1Submission");
const Paso2Submission = require("../models/Paso2Submission");
const Paso2GeneralSubmission = require("../models/Paso2GeneralSubmission");
const Paso3Submission = require("../models/Paso3Submission");
const Paso3GeneralSubmission = require("../models/Paso3GeneralSubmission");
const Paso4Submission = require("../models/Paso4Submission");
const Paso4GeneralSubmission = require("../models/Paso4GeneralSubmission");
const Paso5Submission = require("../models/Paso5Submission");
const Paso6Submission = require("../models/Paso6Submission");
const Student = require("../models/Student");
const { baseStageQuery, normalizeStage } = require("./stage");

/**
 * Load all Paso submissions + Paso2 student bundle for one cycle/stage.
 */
async function fetchStagePasoBundle(teacherCycleId, teacherId, stage) {
  const st = normalizeStage(stage);
  const filter = baseStageQuery(teacherCycleId, teacherId, st);
  const [paso1, paso2General, paso3General, paso3, paso4General, paso4, paso5, paso6, students] = await Promise.all([
    Paso1Submission.findOne(filter),
    Paso2GeneralSubmission.findOne(filter),
    Paso3GeneralSubmission.findOne(filter),
    Paso3Submission.findOne(filter),
    Paso4GeneralSubmission.findOne(filter),
    Paso4Submission.findOne(filter),
    Paso5Submission.findOne(filter),
    Paso6Submission.findOne(filter),
    Student.find({ teacherCycleId, teacherId }),
  ]);
  const paso2Subs = await Paso2Submission.find(filter);
  const paso2Students = students.map((s) => ({
    student: s,
    submission: paso2Subs.find((sub) => sub.studentId.toString() === s._id.toString()),
  }));
  const paso1to5Input = {
    stage: st,
    paso1,
    paso2General,
    paso2Students,
    paso3General,
    paso3,
    paso4General,
    paso4,
    paso5,
    paso6,
  };
  return {
    stage: st,
    paso1,
    paso2General,
    paso2: paso2Subs,
    paso2Students,
    paso3General,
    paso3,
    paso4General,
    paso4,
    paso5,
    paso6,
    paso1to5Input,
  };
}

module.exports = { fetchStagePasoBundle, normalizeStage };
