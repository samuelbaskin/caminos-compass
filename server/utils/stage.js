const STAGES = ["pre", "observation", "post"];

/**
 * Normalize stage from query/body; default "pre" for backward compatibility.
 */
function normalizeStage(value) {
  const s = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (STAGES.includes(s)) return s;
  return "pre";
}

/**
 * Mongo filter for submissions by stage. Legacy docs without `stage` count as "pre".
 */
function stageFilter(stage) {
  const s = normalizeStage(stage);
  if (s === "pre") {
    return { $or: [{ stage: "pre" }, { stage: { $exists: false } }, { stage: null }] };
  }
  return { stage: s };
}

/**
 * Base query: teacherCycleId + teacherId + stage semantics.
 */
function baseStageQuery(teacherCycleId, teacherId, stage) {
  return {
    teacherCycleId,
    teacherId,
    ...stageFilter(stage),
  };
}

module.exports = { STAGES, normalizeStage, stageFilter, baseStageQuery };
