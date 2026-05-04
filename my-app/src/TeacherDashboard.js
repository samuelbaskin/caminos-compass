import React, { useState, useEffect, useCallback } from "react";
import {
  listCycles,
  createCycle,
  getCycle,
  getPaso,
  savePaso,
  getPaso2General,
  savePaso2General,
  getPaso3General,
  savePaso3General,
  getPaso4General,
  savePaso4General,
  listStudents,
  createStudent,
  uploadWritingSample,
  generateLessonPlan,
  getCycleProgress,
  listLessonPlans,
  getLessonPlan,
  updateLessonPlan,
  deleteLessonPlan,
  reviewPasoResponse,
} from "./api/cycles";

const PASO_META = [
  { num: 1, displayNum: 1, label: "Paso 1", name: "Knowledge of Self", section: "pre" },
  { num: 2, displayNum: 2, label: "Paso 2", name: "Knowledge of Learner/Student Profile", section: "pre" },
  // NOTE: `num` is the internal data identifier (matches API routes /paso3, /paso4 and
  // Paso3*/Paso4*Submission schemas). `displayNum` and `label` are what the user sees.
  // The two below are intentionally swapped: sociopolitical content (stored under paso4*)
  // is now displayed as Paso 3, and lesson-plan content (stored under paso3*) as Paso 4.
  { num: 4, displayNum: 3, label: "Paso 3", name: "Knowledge of Sociopolitical Dynamics", section: "pre" },
  { num: 3, displayNum: 4, label: "Paso 4", name: "Practice of Teaching/Preliminary Lesson Plan", section: "pre" },
  { num: 5, displayNum: 5, label: "Paso 5", name: "Practice of Knowing Learners, Families & Communities", section: "post" },
  { num: 6, displayNum: 6, label: "Paso 6", name: "Practice of Advocacy", section: "post" },
];

const STAGE_NAV = [
  { id: "pre", short: "Pre", label: "Pre Conference", theme: "stage-pre" },
  { id: "observation", short: "Obs", label: "Observation", theme: "stage-observation" },
  { id: "post", short: "Post", label: "Post Conference / Reflection", theme: "stage-post" },
];

const STAGE_LABELS = { pre: "Pre Conference", observation: "Observation", post: "Post Conference" };

/* Observation phase — prompts from docs/observation-phase.md; keys match existing schema fields. */
const PASO1_FIELDS_OBSERVATION = [
  { key: "q1_positionality", label: "1. What aspects of your knowledge of self are you working on through this lesson?", placeholder: "Describe what you are focusing on for this lesson…" },
  { key: "q2_hiddenCurriculum", label: "2. What evidence can be gathered about your positionality in teaching?", placeholder: "Note observable evidence related to your positionality…" },
  { key: "q3_explicitTeaching", label: "3. What components of the lesson are informed by your knowledge of self?", placeholder: "Connect lesson design choices to your self-knowledge…" },
];

const PASO2_GENERAL_FIELDS_OBSERVATION = [
  { key: "q1_studentReadiness", label: "1. Which students should be observed during the lesson?", placeholder: "Name or describe focus students or groups…" },
  { key: "q2_priorKnowledge", label: "2. What data can be collected about student performance?", placeholder: "List data sources or evidence you plan to gather…" },
  { key: "q3_retentionCheck", label: "3. How can patterns in student academic performance be investigated?", placeholder: "Describe how you will look for patterns in performance…" },
];

const PASO3_GENERAL_FIELDS_OBSERVATION = [
  { key: "q1_humanizingPedagogy", label: "1. What should the observer focus on (student engagement, delivery, discourse, wait time)?", placeholder: "Prioritize what the observer should watch and note…" },
  { key: "q2_presentLearningObjective", label: "2. How will student success with the learning objective be monitored?", placeholder: "Describe success indicators and how they will be tracked…" },
  { key: "q3_barriers", label: "3. How will pacing and engagement be evaluated?", placeholder: "Explain how pacing and engagement will be assessed…" },
];

const PASO4_GENERAL_FIELDS_OBSERVATION = [
  { key: "q1_equitableAccess", label: "1. What data will show whether students have equitable access to learning?", placeholder: "Specify evidence of equitable access…" },
  { key: "q2_supportingEnglishLearners", label: "2. What data will show classroom power dynamics among students?", placeholder: "Describe what to look for regarding power dynamics…" },
  { key: "q3_homeLanguageSupport", label: "3. Which groups of students should be focused on for additional support?", placeholder: "Identify students or groups needing focused observation…" },
];

const PASO5_FIELDS_OBSERVATION = [
  { key: "q1_partnerConnect", label: "1. How can engagement levels be observed for each student or group?", placeholder: "Describe how you will observe engagement…" },
  { key: "q2_greetStudents", label: "2. What evidence shows students connecting with the content?", placeholder: "Note signals of connection to the content…" },
  { key: "q3_comfortableParticipate", label: "3. How can classroom relationships and rapport be observed?", placeholder: "Describe what indicates positive rapport and relationships…" },
];

const PASO6_ADVOCACY_FIELDS_OBSERVATION = [
  { key: "q1_advocateEquity", label: "1. What evidence will show advocacy for equitable learning opportunities?", placeholder: "Describe observable advocacy for equity…" },
  { key: "q2_scaffolding", label: "2. How can teacher talk support marginalized groups?", placeholder: "Focus on language and moves that support marginalized students…" },
  { key: "q3_fitWithinUnit", label: "3. How can equitable participation be observed?", placeholder: "Describe what equitable participation looks like in this lesson…" },
];

/* Post-conference phase — prompts from docs/post-conference-phase.md; keys match existing schema fields. */
const PASO1_FIELDS_POST = [
  { key: "q1_positionality", label: "1. How did your positionality play a role in lesson delivery?", placeholder: "Reflect on how your identity and position shaped delivery…" },
  { key: "q2_hiddenCurriculum", label: "2. What did you learn about the content through teaching this lesson?", placeholder: "Note new insights about the content from teaching it…" },
  { key: "q3_explicitTeaching", label: "3. What did you learn about how students learn this content?", placeholder: "Describe what you learned about student learning for this content…" },
  { key: "q4_contentKnowledge", label: "4. Where did you succeed in this lesson?", placeholder: "Identify strengths and successes from the lesson…" },
  { key: "q5_learningProcess", label: "5. What would you adjust or do differently next time?", placeholder: "What will you change or refine for next time?" },
];

const PASO2_GENERAL_FIELDS_POST = [
  { key: "q1_studentReadiness", label: "1. What additional information did you learn about student readiness?", placeholder: "Summarize new readiness insights from the lesson…" },
  { key: "q2_priorKnowledge", label: "2. In what ways were students successful?", placeholder: "Describe student successes you observed…" },
  { key: "q3_retentionCheck", label: "3. Where did students struggle or need support?", placeholder: "Note challenges and where support was needed…" },
  { key: "q4_academicSkills", label: "4. What does the data suggest about next steps?", placeholder: "Connect evidence to instructional next steps…" },
];

const PASO3_GENERAL_FIELDS_POST = [
  { key: "q1_humanizingPedagogy", label: "1. How did the lesson go overall?", placeholder: "Give an overall reflection on how the lesson went…" },
  { key: "q2_presentLearningObjective", label: "2. What would you do differently next time?", placeholder: "What would you adjust in planning or delivery?" },
  { key: "q3_barriers", label: "3. What are your next steps for improving instruction?", placeholder: "Outline concrete next steps for your practice…" },
];

const PASO4_GENERAL_FIELDS_POST = [
  { key: "q1_equitableAccess", label: "1. Did all students have equitable access to learning?", placeholder: "Reflect on access and participation for all students…" },
  { key: "q2_supportingEnglishLearners", label: "2. Were any groups marginalized or excluded?", placeholder: "Note any marginalization or exclusion and context…" },
  { key: "q3_homeLanguageSupport", label: "3. How effective were strategies to support equity?", placeholder: "Evaluate strategies aimed at equitable outcomes…" },
];

const PASO5_FIELDS_POST = [
  { key: "q1_partnerConnect", label: "1. How did you connect with students during the lesson?", placeholder: "Describe connections you made with students…" },
  { key: "q2_greetStudents", label: "2. What additional information did you learn about students’ backgrounds?", placeholder: "Note new learning about students’ backgrounds…" },
  { key: "q3_comfortableParticipate", label: "3. How did students use their home languages to access the content?", placeholder: "Describe home language use and access to content…" },
  { key: "q4_teamBuilding", label: "4. How did the lesson build relationships?", placeholder: "Reflect on relationship-building during the lesson…" },
];

const PASO6_ADVOCACY_FIELDS_POST = [
  { key: "q1_advocateEquity", label: "1. What did you learn about student learning needs?", placeholder: "Summarize learning needs that emerged…" },
  { key: "q2_scaffolding", label: "2. How will you advocate for support for students?", placeholder: "Describe how you will advocate for needed supports…" },
  { key: "q3_fitWithinUnit", label: "3. How will you communicate with families about learning?", placeholder: "Outline family communication plans related to learning…" },
  { key: "q4_assessmentData", label: "4. What supports do you need moving forward?", placeholder: "Identify supports you need for yourself or your practice…" },
];

function navFromApiStatus(apiStatus) {
  if (apiStatus === "completed") return "completed";
  if (apiStatus === "in_progress") return "draft";
  return "pending";
}

function cardClassFromApiStatus(apiStatus) {
  if (apiStatus === "completed") return "completed";
  if (apiStatus === "in_progress") return "in_progress";
  return "locked";
}

function labelFromApiStatus(apiStatus) {
  if (apiStatus === "completed") return "COMPLETED";
  if (apiStatus === "in_progress") return "IN PROGRESS";
  return "NOT STARTED";
}

function getPasoApiStatus(progressData, stageId, num) {
  const key = `paso${num}`;
  return progressData?.stages?.[stageId]?.pasos?.[key]?.status || "not_started";
}

function getStageAggregate(progressData, stageId) {
  const nums = [1, 2, 3, 4, 5, 6];
  const statuses = nums.map((n) => getPasoApiStatus(progressData, stageId, n));
  const allDone = statuses.every((s) => s === "completed");
  const anyStarted = statuses.some((s) => s === "in_progress" || s === "completed");
  const nav = allDone ? "completed" : anyStarted ? "draft" : "pending";
  const statusClass = allDone ? "completed" : anyStarted ? "in_progress" : "locked";
  const displayStatus = allDone ? "Completed" : anyStarted ? "In Progress" : "Not Started";
  return { nav, statusClass, displayStatus, stagePct: progressData?.stages?.[stageId]?.stagePct ?? 0 };
}

/* ─── Toast ──────────────────────────────────────────────────────────── */

function isAiServiceError(msg) {
  if (!msg || typeof msg !== "string") return false;
  return /AI service/i.test(msg);
}

function Toast({ msg, type, onDone, onRetry }) {
  const hasRetry = typeof onRetry === "function";
  useEffect(() => {
    if (hasRetry) return undefined;
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [onDone, hasRetry]);
  return (
    <div className={`paso-toast paso-toast--${type}`} role={type === "error" ? "alert" : "status"}>
      <span className="paso-toast__msg">
        {type === "success" ? "✓" : "⚠"} {msg}
      </span>
      {hasRetry && (
        <button
          type="button"
          className="paso-toast__action"
          onClick={() => {
            onRetry();
            onDone();
          }}
        >
          Retry
        </button>
      )}
      {hasRetry && (
        <button
          type="button"
          className="paso-toast__close"
          onClick={onDone}
          aria-label="Dismiss"
        >
          ×
        </button>
      )}
    </div>
  );
}

/** One reflection field with AI sufficiency review (Submit + feedback pane). */
function PasoReviewRow({
  cycleId,
  stage,
  pasoNum,
  section = "main",
  fieldKey,
  questionLabel,
  value,
  onChange,
  placeholder,
  rows = 4,
  multiline = true,
  useHeading = true,
}) {
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState(null);

  async function handleSubmit() {
    if (!cycleId) {
      setErr("Save your cycle first, then try again.");
      return;
    }
    setSubmitting(true);
    setErr(null);
    try {
      const r = await reviewPasoResponse(cycleId, {
        stage,
        pasoNum,
        section,
        fieldKey,
        responseText: value,
        questionLabel,
      });
      setResult(r);
    } catch (e) {
      setErr(e.message || "Review failed.");
      setResult(null);
    }
    setSubmitting(false);
  }

  return (
    <div className="paso-review-row">
      <div className="paso-review-row__input-col">
        {useHeading ? (
          <h3 className="paso-form__section-title">{questionLabel}</h3>
        ) : (
          <label className="auth-label paso-review-row__label">{questionLabel}</label>
        )}
        <div className="paso-review-row__controls">
          {multiline ? (
            <textarea
              className="auth-input paso-textarea paso-review-row__field"
              rows={rows}
              placeholder={placeholder}
              value={value}
              onChange={(e) => onChange(e.target.value)}
            />
          ) : (
            <input
              className="auth-input paso-review-row__field"
              placeholder={placeholder}
              value={value}
              onChange={(e) => onChange(e.target.value)}
            />
          )}
          <button
            type="button"
            className="btn paso-btn-sm paso-review-row__submit paso-review-row__submit--primary"
            disabled={submitting}
            onClick={handleSubmit}
          >
            {submitting ? "…" : "Submit"}
          </button>
        </div>
      </div>
      <div className="paso-review-row__pane" aria-live="polite">
        {submitting && <p className="paso-muted">Reviewing…</p>}
        {err && <p className="paso-review-row__error">{err}</p>}
        {!submitting && result && (
          <>
            <div className="paso-review-row__score">
              Score: <strong>{result.score}%</strong>
              {result.score >= 75 ? <span className="paso-review-row__badge">Sufficient</span> : null}
            </div>
            <p className="paso-review-row__feedback">{result.feedback}</p>
            {result.followUpQuestion ? (
              <p className="paso-review-row__followup">
                <strong>Follow-up:</strong> {result.followUpQuestion}
              </p>
            ) : null}
          </>
        )}
        {!submitting && !err && !result && (
          <p className="paso-muted paso-review-row__hint">Submit for AI feedback and score.</p>
        )}
      </div>
    </div>
  );
}

/* ─── Paso 1 : Knowledge of Self ─────────────────────────────────────── */

const PASO1_FIELDS = [
  { key: "q1_positionality", label: "1. Positionality in Relation to Content", placeholder: "What is your positionality in relation to the content?" },
  { key: "q2_hiddenCurriculum", label: "2. The Hidden Curriculum", placeholder: "What is the 'hidden curriculum'?" },
  { key: "q3_explicitTeaching", label: "3. Explicit Teaching for All Students", placeholder: "What should all students know about the content, classroom expectations, or routines? How will you ensure all students are explicitly taught this?" },
  { key: "q4_contentKnowledge", label: "4. Knowledge of Content", placeholder: "What is your knowledge of the content you will be teaching in this lesson?" },
  { key: "q5_learningProcess", label: "5. Your Learning Process", placeholder: "How did you learn it? How does your own learning process inform how to teach it and how to support students who may struggle?" },
  { key: "q6_studentRelationship", label: "6. Connection to Students and Culture", placeholder: "What is your connection/relationship to your students and their culture?" },
  { key: "q7_diversityAffirmation", label: "7. Acknowledging Positionality and Celebrating Diversity", placeholder: "How will you acknowledge your positionality and celebrate diversity, name privilege and/or affirm cultural, linguistic, or ability identities in relation to your students?" },
  { key: "q8_learnerModeling", label: "8. Modeling as a Learner", placeholder: "How are you going to acknowledge yourself as a learner? What are you going to model as a learner?" },
  { key: "q9_growthMindset", label: "9. Growth Mindset and Mistakes", placeholder: "How can you model when you make a mistake or have difficulty? How can you model a growth mindset?" },
  { key: "q10_preparedness", label: "10. Preparation and Confidence", placeholder: "What do you need to do to feel prepared and confident to teach?" },
];

function Paso1Form({ data, onChange, onSave, saving, stage = "pre", cycleId }) {
  const fields = stage === "observation" ? PASO1_FIELDS_OBSERVATION : stage === "post" ? PASO1_FIELDS_POST : PASO1_FIELDS;
  return (
    <div className="paso-form paso-form--review">
      <div className="paso-form__header">
        <h2 className="paso-form__title">Paso 1 — Knowledge of Self</h2>
        <p className="paso-form__desc">
          {stage === "observation"
            ? "Observation phase: focus on what the observer should know about your knowledge of self for this lesson."
            : stage === "post"
            ? "Post-conference: reflect on delivery, content learning, student learning, successes, and adjustments after teaching."
            : "Reflect on who you are as an educator. Complete each sub-questionnaire to build your self-awareness profile."}
        </p>
      </div>
      {fields.map((f) => {
        const raw = data[f.key];
        const value = typeof raw === "object" && raw !== null && "response" in raw ? (raw.response || "") : (raw || "");
        return (
          <div key={f.key} className="paso-form__section">
            <PasoReviewRow
              cycleId={cycleId}
              stage={stage}
              pasoNum={1}
              section="main"
              fieldKey={f.key}
              questionLabel={f.label}
              value={value}
              onChange={(v) => onChange({ ...data, [f.key]: { response: v, isDraft: true } })}
              placeholder={f.placeholder}
              rows={5}
            />
          </div>
        );
      })}
      <div className="paso-form__actions">
        <button className="btn btn--ghost" disabled={saving} onClick={() => onSave("draft")}>
          {saving ? "Saving…" : "Save Draft"}
        </button>
        <button className="btn btn--resume" disabled={saving} onClick={() => onSave("complete")}>
          {saving ? "Saving…" : "Save & Next →"}
        </button>
      </div>
    </div>
  );
}

/* ─── Paso 2 : Knowledge of Learner/Student Profile ──────────────────── */

const PASO2_GENERAL_FIELDS = [
  { key: "q1_studentReadiness", label: "1. Student Readiness", placeholder: "What information do you have about student readiness for this lesson?" },
  { key: "q2_priorKnowledge", label: "2. Prior Knowledge Assessment", placeholder: "What ways have you assessed your students' prior knowledge?" },
  { key: "q3_retentionCheck", label: "3. Retention of Prior Skills", placeholder: "How can you check for retention of prior skills or knowledge at the beginning of the lesson?" },
  { key: "q4_academicSkills", label: "4. Academic Skills", placeholder: "What do you know about the reading, language, writing, or math skills of your students?" },
  { key: "q5_skillPatterns", label: "5. Patterns in Academic Skills", placeholder: "What patterns do you see regarding your students' academic skills?" },
  { key: "q6_differentiation", label: "6. Differentiation Preparation", placeholder: "How have you prepared the lesson to differentiate for these various levels?" },
  { key: "q7_languageProficiency", label: "7. Language Proficiency Support", placeholder: "How will students with varying language proficiency levels be supported in this lesson?" },
  { key: "q8_fundsOfKnowledge", label: "8. Funds of Knowledge", placeholder: "What funds of knowledge do students bring to this lesson/content?" },
  { key: "q9_familyDynamics", label: "9. Parents and Family Dynamics", placeholder: "What do you know about the parents or family dynamics of the students?" },
  { key: "q10_backgroundKnowledge", label: "10. Background Knowledge", placeholder: "What background knowledge do students bring to the lesson?" },
];

function Paso2Form({ cycleId, stage = "pre", data, onChange, onSave, saving, onAfterGeneralSave }) {
  const [activeSection, setActiveSection] = useState("general");
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newStudent, setNewStudent] = useState({ firstName: "", lastName: "", grade: "", demographics: "" });
  const [adding, setAdding] = useState(false);
  const [sampleText, setSampleText] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [studentError, setStudentError] = useState("");
  const [generalData, setGeneralData] = useState({});
  const [generalSaving, setGeneralSaving] = useState(false);

  const fetchStudents = useCallback(async () => {
    if (!cycleId) return;
    setLoadingStudents(true);
    try {
      const res = await listStudents(cycleId);
      setStudents(res.students || res || []);
    } catch { /* silent */ }
    setLoadingStudents(false);
  }, [cycleId]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  useEffect(() => {
    if (!cycleId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await getPaso2General(cycleId, stage);
        if (!cancelled) setGeneralData(res.paso2General ? { ...res.paso2General } : {});
      } catch {
        if (!cancelled) setGeneralData({});
      }
    })();
    return () => { cancelled = true; };
  }, [cycleId, stage]);

  async function handleSaveGeneral(mode) {
    if (!cycleId) return;
    setGeneralSaving(true);
    try {
      const status = mode === "complete" ? "completed" : "draft";
      const { _id, __v, createdAt, updatedAt, teacherCycleId, teacherId, ...clean } = generalData;
      await savePaso2General(cycleId, { ...clean, status }, stage);
      onAfterGeneralSave?.();
    } catch { /* silent */ }
    setGeneralSaving(false);
  }

  function handleGeneralChange(key, value) {
    setGeneralData((prev) => ({ ...prev, [key]: { response: value, isDraft: true } }));
  }

  async function handleAddStudent() {
    if (!newStudent.firstName || !newStudent.lastName) {
      setStudentError("First and last name are required.");
      return;
    }
    setAdding(true);
    setStudentError("");
    try {
      await createStudent({ ...newStudent, teacherCycleId: cycleId });
      setNewStudent({ firstName: "", lastName: "", grade: "", demographics: "" });
      setShowAdd(false);
      await fetchStudents();
    } catch (err) {
      setStudentError(err.message);
    }
    setAdding(false);
  }

  async function handleUploadSample() {
    if (!selectedStudent || !sampleText.trim()) return;
    setUploading(true);
    try {
      const res = await uploadWritingSample(selectedStudent._id || selectedStudent.id, sampleText);
      setSampleText("");
      await fetchStudents();
      if (res.student) setSelectedStudent(res.student);
    } catch { /* silent */ }
    setUploading(false);
  }

  async function handleRetryEvaluation() {
    if (!selectedStudent) return;
    const textToUse = (sampleText && sampleText.trim()) || (selectedStudent.writingSamplePre && selectedStudent.writingSamplePre.trim());
    if (!textToUse) return;
    setUploading(true);
    try {
      const res = await uploadWritingSample(selectedStudent._id || selectedStudent.id, textToUse);
      await fetchStudents();
      if (res.student) setSelectedStudent(res.student);
    } catch { /* silent */ }
    setUploading(false);
  }

  const hasExistingSample = selectedStudent && (selectedStudent.writingSamplePre || "").trim().length > 0;
  const evaluationIsError = selectedStudent?.llmEvaluation && (
    selectedStudent.llmEvaluation.startsWith("LLM evaluation unavailable") ||
    selectedStudent.llmEvaluation.includes("quota") ||
    selectedStudent.llmEvaluation.includes("429")
  );

  const paso2GeneralFields = stage === "observation" ? PASO2_GENERAL_FIELDS_OBSERVATION : stage === "post" ? PASO2_GENERAL_FIELDS_POST : PASO2_GENERAL_FIELDS;

  return (
    <div className="paso-form paso-form--review">
      <div className="paso-form__header">
        <h2 className="paso-form__title">Paso 2 — Knowledge of Learner/Student Profile</h2>
        <p className="paso-form__desc">
          Complete both sections: general questions about your student cohort, then build individual student profiles.
        </p>
      </div>

      <div className="paso-section-tabs" style={{ display: "flex", gap: 0, marginBottom: 20, borderBottom: "2px solid var(--border)" }}>
        <button
          className={`paso-section-tab ${activeSection === "general" ? "paso-section-tab--active" : ""}`}
          onClick={() => setActiveSection("general")}
          style={{
            padding: "10px 20px", fontWeight: 600, fontSize: ".9rem", border: "none", cursor: "pointer",
            background: activeSection === "general" ? "var(--accent)" : "transparent",
            color: activeSection === "general" ? "#fff" : "var(--text)",
            borderRadius: "8px 8px 0 0",
          }}
        >
          Section 1 — General Questions
        </button>
        <button
          className={`paso-section-tab ${activeSection === "students" ? "paso-section-tab--active" : ""}`}
          onClick={() => setActiveSection("students")}
          style={{
            padding: "10px 20px", fontWeight: 600, fontSize: ".9rem", border: "none", cursor: "pointer",
            background: activeSection === "students" ? "var(--accent)" : "transparent",
            color: activeSection === "students" ? "#fff" : "var(--text)",
            borderRadius: "8px 8px 0 0",
          }}
        >
          Section 2 — Student Profiles
        </button>
      </div>

      {activeSection === "general" && (
        <>
          <div className="paso-form__section">
            <h3 className="paso-form__section-title">General Questions</h3>
            <p className="paso-form__desc" style={{ marginBottom: 16 }}>
              {stage === "observation"
                ? "Observation phase: plan who to observe, what performance data to collect, and how to investigate patterns. (Section 2 student profiles are unchanged.)"
                : stage === "post"
                ? "Post-conference: reflect on readiness, success, struggle, and data-driven next steps. (Section 2 student profiles are unchanged.)"
                : "Answer the following questions about your overall knowledge of your students and their readiness."}
            </p>
            {paso2GeneralFields.map((f) => (
              <div key={f.key} className="paso-form__section">
                <PasoReviewRow
                  cycleId={cycleId}
                  stage={stage}
                  pasoNum={2}
                  section="general"
                  fieldKey={f.key}
                  questionLabel={f.label}
                  value={generalData[f.key]?.response || ""}
                  onChange={(v) => handleGeneralChange(f.key, v)}
                  placeholder={f.placeholder}
                  rows={3}
                />
              </div>
            ))}
          </div>
          <div className="paso-form__actions">
            <button className="btn btn--ghost" disabled={generalSaving} onClick={() => handleSaveGeneral("draft")}>
              {generalSaving ? "Saving…" : "Save Draft"}
            </button>
            <button className="btn btn--resume" disabled={generalSaving} onClick={() => { handleSaveGeneral("complete"); setActiveSection("students"); }}>
              {generalSaving ? "Saving…" : "Save & Continue to Section 2 →"}
            </button>
          </div>
        </>
      )}

      {activeSection === "students" && (
        <>
          <div className="paso-form__section">
            <div className="paso-form__section-header">
              <h3 className="paso-form__section-title">Students</h3>
              <button className="btn btn--ghost paso-btn-sm" onClick={() => setShowAdd(!showAdd)}>
                {showAdd ? "Cancel" : "+ Add Student"}
              </button>
            </div>

            {showAdd && (
              <div className="paso-card paso-card--add">
                {studentError && <p className="auth-message auth-message--error">{studentError}</p>}
                <div className="auth-grid-two">
                  <div className="auth-field">
                    <label className="auth-label">First Name</label>
                    <input className="auth-input" value={newStudent.firstName} onChange={(e) => setNewStudent({ ...newStudent, firstName: e.target.value })} />
                  </div>
                  <div className="auth-field">
                    <label className="auth-label">Last Name</label>
                    <input className="auth-input" value={newStudent.lastName} onChange={(e) => setNewStudent({ ...newStudent, lastName: e.target.value })} />
                  </div>
                </div>
                <div className="auth-grid-two" style={{ marginTop: 10 }}>
                  <div className="auth-field">
                    <label className="auth-label">Grade</label>
                    <input className="auth-input" value={newStudent.grade} onChange={(e) => setNewStudent({ ...newStudent, grade: e.target.value })} />
                  </div>
                  <div className="auth-field">
                    <label className="auth-label">Demographics</label>
                    <input className="auth-input" placeholder="e.g. ELL, IEP, Gifted" value={newStudent.demographics} onChange={(e) => setNewStudent({ ...newStudent, demographics: e.target.value })} />
                  </div>
                </div>
                <div className="paso-form__actions" style={{ marginTop: 12 }}>
                  <button className="btn btn--resume paso-btn-sm" disabled={adding} onClick={handleAddStudent}>
                    {adding ? "Adding…" : "Add Student"}
                  </button>
                </div>
              </div>
            )}

            {loadingStudents ? (
              <p className="paso-muted">Loading students…</p>
            ) : students.length === 0 ? (
              <p className="paso-muted">No students added yet. Click "Add Student" above.</p>
            ) : (
              <div className="paso-student-list">
                {students.map((s) => (
                  <div
                    key={s._id || s.id}
                    className={`paso-student-row ${selectedStudent && (selectedStudent._id || selectedStudent.id) === (s._id || s.id) ? "paso-student-row--selected" : ""}`}
                    onClick={() => {
                      setSelectedStudent(s);
                      setSampleText((s.writingSamplePre || "").trim());
                    }}
                  >
                    <div className="paso-student-row__avatar">{(s.firstName || "?")[0]}</div>
                    <div className="paso-student-row__info">
                      <span className="paso-student-row__name">{s.firstName} {s.lastName}</span>
                      <span className="paso-student-row__meta">
                        {s.grade ? `Grade ${s.grade}` : ""}
                        {s.demographics ? ` · ${s.demographics}` : ""}
                      </span>
                    </div>
                    {s.writingSample && <span className="paso-student-row__badge">Sample ✓</span>}
                    {s.llmEvaluation && <span className="paso-student-row__badge paso-student-row__badge--eval">Evaluated</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedStudent && (
            <div className="paso-form__section">
              <h3 className="paso-form__section-title">
                Writing Sample — {selectedStudent.firstName} {selectedStudent.lastName}
              </h3>
              {selectedStudent.llmEvaluation && (
                <div className="paso-card paso-card--eval">
                  <h4 className="paso-card__label">LLM Evaluation</h4>
                  <p className="paso-card__text">{selectedStudent.llmEvaluation}</p>
                </div>
              )}
              <div className="auth-field">
                <label className="auth-label">Paste or type the writing sample</label>
                <textarea
                  className="auth-input paso-textarea"
                  rows={6}
                  placeholder="Enter student's writing sample here…"
                  value={sampleText}
                  onChange={(e) => setSampleText(e.target.value)}
                />
              </div>
              <div className="paso-form__actions" style={{ marginTop: 10, flexWrap: "wrap", gap: 8 }}>
                <button className="btn btn--resume paso-btn-sm" disabled={uploading || !sampleText.trim()} onClick={handleUploadSample}>
                  {uploading ? "Evaluating…" : "Upload & Evaluate"}
                </button>
                {hasExistingSample && (
                  <button
                    className="btn btn--ghost paso-btn-sm"
                    disabled={uploading}
                    onClick={handleRetryEvaluation}
                    title="Re-run LLM evaluation with the current or saved sample"
                  >
                    {uploading ? "Evaluating…" : "Retry evaluation"}
                  </button>
                )}
              </div>
              {evaluationIsError && (
                <p className="paso-muted" style={{ marginTop: 8 }}>
                  Previous evaluation failed (e.g. quota). Fix your API quota or click &quot;Retry evaluation&quot; to try again.
                </p>
              )}
            </div>
          )}

          <div className="paso-form__section">
            <h3 className="paso-form__section-title">Additional Notes</h3>
            <div className="auth-field">
              <textarea
                className="auth-input paso-textarea"
                rows={4}
                placeholder="Any additional context about your student cohort…"
                value={data.notes || ""}
                onChange={(e) => onChange({ ...data, notes: e.target.value })}
              />
            </div>
          </div>

          <div className="paso-form__actions">
            <button
              className="btn btn--ghost"
              disabled={saving || students.length === 0}
              onClick={() => onSave("draft", students.length ? { studentId: (selectedStudent || students[0])._id || (selectedStudent || students[0]).id, notes: data.notes || "" } : null)}
            >
              {saving ? "Saving…" : "Save Draft"}
            </button>
            <button
              className="btn btn--resume"
              disabled={saving || students.length === 0}
              onClick={() => onSave("complete", students.length ? { studentId: (selectedStudent || students[0])._id || (selectedStudent || students[0]).id, notes: data.notes || "" } : null)}
            >
              {saving ? "Saving…" : "Save & Next →"}
            </button>
          </div>
          {students.length === 0 && (
            <p className="paso-muted" style={{ marginTop: 8 }}>Add at least one student to save Paso 2.</p>
          )}
        </>
      )}
    </div>
  );
}

/* ─── Paso3Form (displayed as "Paso 4") : Practice of Teaching/Preliminary Lesson Plan ──────────── */

const PASO3_GENERAL_FIELDS = [
  { key: "q1_humanizingPedagogy", label: "1. Humanizing Pedagogy", placeholder: "How does this lesson plan demonstrate the principles of humanizing pedagogy?" },
  { key: "q2_presentLearningObjective", label: "2. Presenting Learning Objective", placeholder: "How are you going to present the learning objective to your students?" },
  { key: "q3_barriers", label: "3. Barriers", placeholder: "What barriers might students encounter during this lesson?" },
  { key: "q4_accommodations", label: "4. Accommodations or Modifications", placeholder: "What accommodations or modifications will you use to reach all learners?" },
  { key: "q5_resourcesMaterials", label: "5. Resources or Materials", placeholder: "What resources or materials do you need to engage students in this lesson?" },
  { key: "q6_studentEngagement", label: "6. Student Engagement", placeholder: "How do you visualize student engagement in this lesson?" },
  { key: "q7_classroomEnvironment", label: "7. Physical Classroom Environment", placeholder: "What does the physical classroom environment look like for this lesson?" },
  { key: "q8_relateToLives", label: "8. Relating to Students' Lives", placeholder: "How does the lesson relate to your students' lives?" },
  { key: "q9_backgroundKnowledge", label: "9. Background Knowledge or Skills", placeholder: "What background knowledge or skills must students possess to participate?" },
];

const PASO3_FIELDS = [
  { key: "lessonTitle", label: "Lesson Title", type: "text", placeholder: "Enter the lesson title" },
  { key: "gradeLevel", label: "Grade Level", type: "text", placeholder: "e.g. 3rd Grade, 9-12" },
  { key: "subjectArea", label: "Subject Area", type: "text", placeholder: "e.g. Mathematics, ELA, Science" },
  { key: "lessonObjectives", label: "Lesson Objectives", type: "textarea", placeholder: "What should students know and be able to do?" },
  { key: "lessonStructure", label: "Lesson Structure", type: "textarea", placeholder: "Describe the flow: opening, instruction, practice, closure…" },
  { key: "materialsResources", label: "Materials & Resources", type: "textarea", placeholder: "List all materials, texts, and resources needed" },
];

function Paso3Form({ cycleId, stage = "pre", data, onChange, onSave, saving, onAfterGeneralSave }) {
  const [activeSection, setActiveSection] = useState("general");
  const [generalData, setGeneralData] = useState({});
  const [generalSaving, setGeneralSaving] = useState(false);

  useEffect(() => {
    if (!cycleId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await getPaso3General(cycleId, stage);
        if (!cancelled) setGeneralData(res.paso3General ? { ...res.paso3General } : {});
      } catch {
        if (!cancelled) setGeneralData({});
      }
    })();
    return () => { cancelled = true; };
  }, [cycleId, stage]);

  async function handleSaveGeneral(mode) {
    if (!cycleId) return;
    setGeneralSaving(true);
    try {
      const status = mode === "complete" ? "completed" : "draft";
      const { _id, __v, createdAt, updatedAt, teacherCycleId, teacherId, ...clean } = generalData;
      await savePaso3General(cycleId, { ...clean, status }, stage);
      onAfterGeneralSave?.();
    } catch { /* silent */ }
    setGeneralSaving(false);
  }

  function handleGeneralChange(key, value) {
    setGeneralData((prev) => ({ ...prev, [key]: { response: value, isDraft: true } }));
  }

  const paso3GeneralFields = stage === "observation" ? PASO3_GENERAL_FIELDS_OBSERVATION : stage === "post" ? PASO3_GENERAL_FIELDS_POST : PASO3_GENERAL_FIELDS;

  return (
    <div className="paso-form paso-form--review">
      <div className="paso-form__header">
        <h2 className="paso-form__title">Paso 4 — Practice of Teaching/Preliminary Lesson Plan</h2>
        <p className="paso-form__desc">
          Complete both sections: general questions about your teaching practice, then your preliminary lesson plan.
        </p>
      </div>

      <div className="paso-section-tabs" style={{ display: "flex", gap: 0, marginBottom: 20, borderBottom: "2px solid var(--border)" }}>
        <button
          className={`paso-section-tab ${activeSection === "general" ? "paso-section-tab--active" : ""}`}
          onClick={() => setActiveSection("general")}
          style={{
            padding: "10px 20px", fontWeight: 600, fontSize: ".9rem", border: "none", cursor: "pointer",
            background: activeSection === "general" ? "var(--accent)" : "transparent",
            color: activeSection === "general" ? "#fff" : "var(--text)",
            borderRadius: "8px 8px 0 0",
          }}
        >
          Section 1 — General Questions
        </button>
        <button
          className={`paso-section-tab ${activeSection === "plan" ? "paso-section-tab--active" : ""}`}
          onClick={() => setActiveSection("plan")}
          style={{
            padding: "10px 20px", fontWeight: 600, fontSize: ".9rem", border: "none", cursor: "pointer",
            background: activeSection === "plan" ? "var(--accent)" : "transparent",
            color: activeSection === "plan" ? "#fff" : "var(--text)",
            borderRadius: "8px 8px 0 0",
          }}
        >
          Section 2 — Preliminary Lesson Plan
        </button>
      </div>

      {activeSection === "general" && (
        <>
          <div className="paso-form__section">
            <h3 className="paso-form__section-title">General Questions</h3>
            <p className="paso-form__desc" style={{ marginBottom: 16 }}>
              {stage === "observation"
                ? "Observation phase: clarify observer focus, monitoring of the learning objective, and how pacing and engagement will be evaluated. (Section 2 fields are unchanged.)"
                : stage === "post"
                ? "Post-conference: reflect on how the lesson went, what you would change, and next steps for instruction. (Section 2 preliminary lesson plan is unchanged.)"
                : "Answer the following questions about your teaching practice and lesson design."}
            </p>
            {paso3GeneralFields.map((f) => (
              <div key={f.key} className="paso-form__section">
                <PasoReviewRow
                  cycleId={cycleId}
                  stage={stage}
                  pasoNum={3}
                  section="general"
                  fieldKey={f.key}
                  questionLabel={f.label}
                  value={generalData[f.key]?.response || ""}
                  onChange={(v) => handleGeneralChange(f.key, v)}
                  placeholder={f.placeholder}
                  rows={3}
                />
              </div>
            ))}
          </div>
          <div className="paso-form__actions">
            <button className="btn btn--ghost" disabled={generalSaving} onClick={() => handleSaveGeneral("draft")}>
              {generalSaving ? "Saving…" : "Save Draft"}
            </button>
            <button className="btn btn--resume" disabled={generalSaving} onClick={() => { handleSaveGeneral("complete"); setActiveSection("plan"); }}>
              {generalSaving ? "Saving…" : "Save & Continue to Section 2 →"}
            </button>
          </div>
        </>
      )}

      {activeSection === "plan" && (
        <>
          <div className="paso-form__section">
            <h3 className="paso-form__section-title">Preliminary Lesson Plan</h3>
            <p className="paso-form__desc" style={{ marginBottom: 16 }}>
              Draft your initial lesson plan. This will be refined through the coaching process.
            </p>
            {PASO3_FIELDS.map((f) => (
              <div key={f.key} className="paso-form__section">
                <PasoReviewRow
                  cycleId={cycleId}
                  stage={stage}
                  pasoNum={3}
                  section="plan"
                  fieldKey={f.key}
                  questionLabel={f.label}
                  value={data[f.key] || ""}
                  onChange={(v) => onChange({ ...data, [f.key]: v })}
                  placeholder={f.placeholder}
                  rows={f.type === "textarea" ? 5 : 2}
                  multiline={f.type === "textarea"}
                />
              </div>
            ))}
          </div>
          <div className="paso-form__actions">
            <button className="btn btn--ghost" disabled={saving} onClick={() => onSave("draft")}>
              {saving ? "Saving…" : "Save Draft"}
            </button>
            <button className="btn btn--resume" disabled={saving} onClick={() => onSave("complete")}>
              {saving ? "Saving…" : "Save & Next →"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Paso4Form (displayed as "Paso 3") : Knowledge of Sociopolitical Dynamics ──────────────────── */

const PASO4_GENERAL_FIELDS = [
  { key: "q1_equitableAccess", label: "1. Equitable Access to Learning", placeholder: "What factors will influence students' equitable access to learning?" },
  { key: "q2_supportingEnglishLearners", label: "2. Supporting English Learners", placeholder: "In what ways are you supporting English learners in this lesson?" },
  { key: "q3_homeLanguageSupport", label: "3. Home Language Support", placeholder: "How are students encouraged to use their home language to support learning?" },
  { key: "q4_culturalRelevance", label: "4. Cultural Relevance", placeholder: "How can you make the content interesting and relevant to their culture?" },
  { key: "q5_engagementRepresentation", label: "5. Engagement, Representation, and Expression", placeholder: "How are you making engagement, representation, and expression accessible to all students?" },
  { key: "q6_groupingForEquity", label: "6. Grouping for Equity", placeholder: "How are you grouping students to support equity?" },
  { key: "q7_essentialQuestionRelevance", label: "7. Essential Question Relevance", placeholder: "How can the essential question demonstrate relevance for all students regardless of background?" },
];

const PASO4_FIELDS = [
  { key: "districtStandards", label: "District Standards", placeholder: "Reference the standards your lesson aligns to…" },
  { key: "curriculumRequirements", label: "Curriculum Requirements", placeholder: "Required curriculum frameworks or adopted materials…" },
  { key: "assessmentGuidelines", label: "Assessment Guidelines", placeholder: "How will student learning be assessed per district policy?" },
  { key: "accommodationPolicies", label: "Accommodation Policies", placeholder: "IEP, 504, ELL accommodations and district expectations…" },
  { key: "additionalNotes", label: "Additional Notes", placeholder: "Any other district-specific considerations…" },
];

function Paso4Form({ cycleId, stage = "pre", data, onChange, onSave, saving, onAfterGeneralSave }) {
  const [activeSection, setActiveSection] = useState("general");
  const [generalData, setGeneralData] = useState({});
  const [generalSaving, setGeneralSaving] = useState(false);

  useEffect(() => {
    if (!cycleId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await getPaso4General(cycleId, stage);
        if (!cancelled) setGeneralData(res.paso4General ? { ...res.paso4General } : {});
      } catch {
        if (!cancelled) setGeneralData({});
      }
    })();
    return () => { cancelled = true; };
  }, [cycleId, stage]);

  async function handleSaveGeneral(mode) {
    if (!cycleId) return;
    setGeneralSaving(true);
    try {
      const status = mode === "complete" ? "completed" : "draft";
      const { _id, __v, createdAt, updatedAt, teacherCycleId, teacherId, ...clean } = generalData;
      await savePaso4General(cycleId, { ...clean, status }, stage);
      onAfterGeneralSave?.();
    } catch { /* silent */ }
    setGeneralSaving(false);
  }

  function handleGeneralChange(key, value) {
    setGeneralData((prev) => ({ ...prev, [key]: { response: value, isDraft: true } }));
  }

  const paso4GeneralFields = stage === "observation" ? PASO4_GENERAL_FIELDS_OBSERVATION : stage === "post" ? PASO4_GENERAL_FIELDS_POST : PASO4_GENERAL_FIELDS;

  return (
    <div className="paso-form paso-form--review">
      <div className="paso-form__header">
        <h2 className="paso-form__title">Paso 3 — Knowledge of Sociopolitical Dynamics</h2>
        <p className="paso-form__desc">
          Complete both sections: general questions about sociopolitical dynamics, then district guidelines.
        </p>
      </div>

      <div className="paso-section-tabs" style={{ display: "flex", gap: 0, marginBottom: 20, borderBottom: "2px solid var(--border)" }}>
        <button
          className={`paso-section-tab ${activeSection === "general" ? "paso-section-tab--active" : ""}`}
          onClick={() => setActiveSection("general")}
          style={{
            padding: "10px 20px", fontWeight: 600, fontSize: ".9rem", border: "none", cursor: "pointer",
            background: activeSection === "general" ? "var(--accent)" : "transparent",
            color: activeSection === "general" ? "#fff" : "var(--text)",
            borderRadius: "8px 8px 0 0",
          }}
        >
          Section 1 — General Questions
        </button>
        <button
          className={`paso-section-tab ${activeSection === "guidelines" ? "paso-section-tab--active" : ""}`}
          onClick={() => setActiveSection("guidelines")}
          style={{
            padding: "10px 20px", fontWeight: 600, fontSize: ".9rem", border: "none", cursor: "pointer",
            background: activeSection === "guidelines" ? "var(--accent)" : "transparent",
            color: activeSection === "guidelines" ? "#fff" : "var(--text)",
            borderRadius: "8px 8px 0 0",
          }}
        >
          Section 2 — State Guidelines
        </button>
      </div>

      {activeSection === "general" && (
        <>
          <div className="paso-form__section">
            <h3 className="paso-form__section-title">General Questions</h3>
            <p className="paso-form__desc" style={{ marginBottom: 16 }}>
              {stage === "observation"
                ? "Observation phase: align data collection with equitable access, power dynamics, and groups needing extra focus. (Section 2 district guidelines are unchanged.)"
                : stage === "post"
                ? "Post-conference: reflect on equitable access, marginalization, and how well equity strategies worked. (Section 2 district guidelines are unchanged.)"
                : "Answer the following questions about sociopolitical dynamics and equitable access."}
            </p>
            {paso4GeneralFields.map((f) => (
              <div key={f.key} className="paso-form__section">
                <PasoReviewRow
                  cycleId={cycleId}
                  stage={stage}
                  pasoNum={4}
                  section="general"
                  fieldKey={f.key}
                  questionLabel={f.label}
                  value={generalData[f.key]?.response || ""}
                  onChange={(v) => handleGeneralChange(f.key, v)}
                  placeholder={f.placeholder}
                  rows={3}
                />
              </div>
            ))}
          </div>
          <div className="paso-form__actions">
            <button className="btn btn--ghost" disabled={generalSaving} onClick={() => handleSaveGeneral("draft")}>
              {generalSaving ? "Saving…" : "Save Draft"}
            </button>
            <button className="btn btn--resume" disabled={generalSaving} onClick={() => { handleSaveGeneral("complete"); setActiveSection("guidelines"); }}>
              {generalSaving ? "Saving…" : "Save & Continue to Section 2 →"}
            </button>
          </div>
        </>
      )}

      {activeSection === "guidelines" && (
        <>
          <div className="paso-form__section">
            <h3 className="paso-form__section-title">District Guidelines</h3>
            <p className="paso-form__desc" style={{ marginBottom: 16 }}>
              Document the district-level requirements and standards that frame your instruction.
            </p>
            {PASO4_FIELDS.map((f) => (
              <div key={f.key} className="paso-form__section">
                <PasoReviewRow
                  cycleId={cycleId}
                  stage={stage}
                  pasoNum={4}
                  section="guidelines"
                  fieldKey={f.key}
                  questionLabel={f.label}
                  value={data[f.key] || ""}
                  onChange={(v) => onChange({ ...data, [f.key]: v })}
                  placeholder={f.placeholder}
                  rows={5}
                />
              </div>
            ))}
          </div>
          <div className="paso-form__actions">
            <button className="btn btn--ghost" disabled={saving} onClick={() => onSave("draft")}>
              {saving ? "Saving…" : "Save Draft"}
            </button>
            <button className="btn btn--resume" disabled={saving} onClick={() => onSave("complete")}>
              {saving ? "Saving…" : "Save & Next →"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Paso 5 : Practice of Knowing Learners, Families & Communities ───── */

const PASO5_FIELDS = [
  { key: "q1_partnerConnect", label: "1. How will you partner and connect with your students through this lesson?", placeholder: "Describe how you will partner and connect with your students…" },
  { key: "q2_greetStudents", label: "2. What are ways to greet students as they enter the classroom?", placeholder: "Describe ways to greet students as they enter…" },
  { key: "q3_comfortableParticipate", label: "3. How can students feel comfortable and eager to participate?", placeholder: "Describe strategies for student comfort and participation…" },
  { key: "q4_teamBuilding", label: "4. How can team-building activities help students know each other better?", placeholder: "Describe how team-building activities support connection…" },
  { key: "q5_getToKnowStudents", label: "5. How will you get to know students' interests, culture, language, and family backgrounds?", placeholder: "Describe how you will learn about students…" },
  { key: "q6_topicRelevant", label: "6. How can you make the topic interesting and relevant for all students?", placeholder: "Describe strategies for relevance and engagement…" },
  { key: "q7_learningModalities", label: "7. How are you incorporating various learning modalities to address learning preferences?", placeholder: "Describe how you address different learning modalities…" },
  { key: "q8_activitiesToLearn", label: "8. What activities will you use to learn more about your students?", placeholder: "Describe activities to learn about your students…" },
];

function Paso5Form({ data, onChange, onSave, saving, stage = "pre", cycleId }) {
  const paso5Fields = stage === "observation" ? PASO5_FIELDS_OBSERVATION : stage === "post" ? PASO5_FIELDS_POST : PASO5_FIELDS;
  return (
    <div className="paso-form paso-form--review">
      <div className="paso-form__header">
        <h2 className="paso-form__title">Paso 5 — Practice of Knowing Learners, Families & Communities</h2>
        <p className="paso-form__desc">
          {stage === "observation"
            ? "Observation phase: what to look for regarding engagement, connection to content, and classroom rapport."
            : stage === "post"
            ? "Post-conference: reflect on connection, backgrounds, home language, and relationships after the lesson."
            : "Describe how you center student and family voice, language, and culture in your practice."}
        </p>
      </div>
      {paso5Fields.map((f) => (
        <div key={f.key} className="paso-form__section">
          <PasoReviewRow
            cycleId={cycleId}
            stage={stage}
            pasoNum={5}
            section="main"
            fieldKey={f.key}
            questionLabel={f.label}
            value={data[f.key] || ""}
            onChange={(v) => onChange({ ...data, [f.key]: v })}
            placeholder={f.placeholder}
            rows={5}
          />
        </div>
      ))}
      <div className="paso-form__actions">
        <button className="btn btn--ghost" disabled={saving} onClick={() => onSave("draft")}>
          {saving ? "Saving…" : "Save Draft"}
        </button>
        <button className="btn btn--resume" disabled={saving} onClick={() => onSave("complete")}>
          {saving ? "Saving…" : "Save & Complete"}
        </button>
      </div>
    </div>
  );
}

/* ─── Paso 6 : Practice of Advocacy ──────────────────────────────────── */

const PASO6_CATEGORIES = [
  { key: "understandingProficiency", label: "Understanding & Proficiency", icon: "📊" },
  { key: "instructionalAdjustments", label: "Instructional Adjustments", icon: "🔄" },
  { key: "equitableAdvocacy", label: "Equitable Education Advocacy", icon: "⚖️" },
  { key: "parentInclusion", label: "Parent Inclusion", icon: "👪" },
];

const PASO6_ADVOCACY_FIELDS = [
  { key: "q1_advocateEquity", label: "1. How will you advocate for equity and social justice in this lesson or unit?", placeholder: "Describe your approach to advocating for equity and social justice…" },
  { key: "q2_scaffolding", label: "2. What approach will you take to scaffolding student learning?", placeholder: "Describe your scaffolding approach…" },
  { key: "q3_fitWithinUnit", label: "3. How does this lesson fit within a larger unit or learning goal?", placeholder: "Describe how this lesson connects to the larger unit…" },
  { key: "q4_assessmentData", label: "4. What assessment data informed the focus of this lesson?", placeholder: "Describe the assessment data that informed this lesson…" },
  { key: "q5_barriersChallenges", label: "5. What barriers or challenges might arise and how will you plan for them?", placeholder: "Describe potential barriers and your planning…" },
  { key: "q6_showLearningWays", label: "6. How can you create opportunities for students to show learning in different ways?", placeholder: "Describe varied ways for students to demonstrate learning…" },
];

function Paso6Form({ data, onChange, onSave, saving, stage = "pre", cycleId }) {
  const advocacyFields = stage === "observation" ? PASO6_ADVOCACY_FIELDS_OBSERVATION : stage === "post" ? PASO6_ADVOCACY_FIELDS_POST : PASO6_ADVOCACY_FIELDS;

  function setProgress(key, value) {
    const clamped = Math.min(100, Math.max(0, Number(value) || 0));
    onChange({ ...data, [key]: clamped });
  }

  return (
    <div className="paso-form paso-form--review">
      <div className="paso-form__header">
        <h2 className="paso-form__title">Paso 6 — Practice of Advocacy</h2>
        <p className="paso-form__desc">
          {stage === "observation"
            ? "Observation phase: focus advocacy prompts on what can be observed during the lesson. Progress sliders below are unchanged."
            : stage === "post"
            ? "Post-conference: reflect on learning needs, advocacy, family communication, and supports you need. Progress sliders below are unchanged."
            : "Track your growth across advocacy domains and gather feedback to inform your practice."}
        </p>
      </div>

      <div className="paso-form__section">
        <h3 className="paso-form__section-title">Advocacy Progress</h3>
        <div className="paso-advocacy-grid">
          {PASO6_CATEGORIES.map((c) => (
            <div key={c.key} className="paso-advocacy-card">
              <div className="paso-advocacy-card__icon">{c.icon}</div>
              <h4 className="paso-advocacy-card__label">{c.label}</h4>
              <div className="paso-advocacy-card__bar-wrap">
                <div className="dashboard-progress__bar">
                  <div className="dashboard-progress__fill" style={{ width: `${data[c.key] || 0}%` }} />
                </div>
                <span className="paso-advocacy-card__pct">{data[c.key] || 0}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={data[c.key] || 0}
                onChange={(e) => setProgress(c.key, e.target.value)}
                className="paso-range"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="paso-form__section">
        <h3 className="paso-form__section-title">Advocacy Questions</h3>
        {advocacyFields.map((f) => (
          <div key={f.key} className="paso-form__section" style={{ marginBottom: 8 }}>
            <PasoReviewRow
              cycleId={cycleId}
              stage={stage}
              pasoNum={6}
              section="advocacy"
              fieldKey={f.key}
              questionLabel={f.label}
              value={data[f.key] || ""}
              onChange={(v) => onChange({ ...data, [f.key]: v })}
              placeholder={f.placeholder}
              rows={4}
              useHeading={false}
            />
          </div>
        ))}
      </div>

      <div className="paso-form__actions">
        <button className="btn btn--ghost" disabled={saving} onClick={() => onSave("draft")}>
          {saving ? "Saving…" : "Save Draft"}
        </button>
        <button className="btn btn--resume" disabled={saving} onClick={() => onSave("complete")}>
          {saving ? "Saving…" : "Save & Complete"}
        </button>
      </div>
    </div>
  );
}

/* ─── Markdown Renderer ──────────────────────────────────────────────── */

function mdToHtml(md) {
  if (!md) return "";
  let html = md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const lines = html.split("\n");
  const out = [];
  let inList = null;
  let inTable = false;
  let tableRows = [];

  function flushList() {
    if (inList) { out.push(inList === "ul" ? "</ul>" : "</ol>"); inList = null; }
  }
  function flushTable() {
    if (!inTable) return;
    const hdr = tableRows[0] || [];
    const headCells = hdr.map((c) => `<th>${inlineMd(c)}</th>`).join("");
    const bodyRows = tableRows.slice(2).map((row) =>
      "<tr>" + (row || []).map((c) => `<td>${inlineMd(c)}</td>`).join("") + "</tr>"
    ).join("");
    out.push(`<div class="lp-table-wrap"><table class="lp-table"><thead><tr>${headCells}</tr></thead><tbody>${bodyRows}</tbody></table></div>`);
    inTable = false;
    tableRows = [];
  }

  function inlineMd(s) {
    return s
      .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/`(.+?)`/g, '<code class="lp-code">$1</code>');
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trimEnd();

    if (/^\|.+\|$/.test(trimmed)) {
      flushList();
      if (!inTable) inTable = true;
      const cells = trimmed.slice(1, -1).split("|").map((c) => c.trim());
      tableRows.push(cells);
      continue;
    } else {
      flushTable();
    }

    if (/^---+$/.test(trimmed) || /^\*\*\*+$/.test(trimmed)) {
      flushList();
      out.push('<hr class="lp-hr"/>');
      continue;
    }

    const h2 = trimmed.match(/^##\s+(.+)/);
    if (h2) { flushList(); out.push(`<h2 class="lp-h2">${inlineMd(h2[1])}</h2>`); continue; }
    const h3 = trimmed.match(/^###\s+(.+)/);
    if (h3) { flushList(); out.push(`<h3 class="lp-h3">${inlineMd(h3[1])}</h3>`); continue; }
    const h4 = trimmed.match(/^####\s+(.+)/);
    if (h4) { flushList(); out.push(`<h4 class="lp-h4">${inlineMd(h4[1])}</h4>`); continue; }

    const ul = trimmed.match(/^[\s]*[*]\s+(.*)/); //"Hello World"
    if (ul) {
      if (inList !== "ul") { flushList(); out.push('<ul class="lp-ul">'); inList = "ul"; }
      out.push(`<li>${inlineMd(ul[1])}</li>`);
      continue;
    }
    const ol = trimmed.match(/^[\s]*(\d+)\.\s+(.*)/);
    if (ol) {
      if (inList !== "ol") { flushList(); out.push('<ol class="lp-ol">'); inList = "ol"; }
      out.push(`<li>${inlineMd(ol[2])}</li>`);
      continue;
    }

    flushList();
    if (trimmed === "") { out.push(""); continue; }
    out.push(`<p class="lp-p">${inlineMd(trimmed)}</p>`);
  }
  flushList();
  flushTable();
  return out.join("\n");
}

/* ─── Lesson Plan View ───────────────────────────────────────────────── */

function LessonPlanView({ plan, onRegenerate, generating, onSaveContent, onFinalize, onBackToList, onDelete }) {
  const [showInputs, setShowInputs] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);

  if (!plan) return <p className="paso-muted">No lesson plan generated yet.</p>;

  const isDoc = typeof plan === "object" && plan !== null;
  const content = isDoc ? (plan.content || "") : (typeof plan === "string" ? plan : "");
  const createdAt = isDoc && plan.createdAt ? new Date(plan.createdAt) : null;
  const inputs = isDoc ? plan.paso1to5Input : null;
  const status = isDoc ? plan.status : null;

  const lpInputStage = inputs?.stage || plan?.stage || "pre";
  const lpObs = lpInputStage === "observation";
  const lpPost = lpInputStage === "post";

  const lpPaso1Fields = lpObs ? PASO1_FIELDS_OBSERVATION : lpPost ? PASO1_FIELDS_POST : PASO1_FIELDS;
  const lpPaso2GeneralFields = lpObs ? PASO2_GENERAL_FIELDS_OBSERVATION : lpPost ? PASO2_GENERAL_FIELDS_POST : PASO2_GENERAL_FIELDS;
  const lpPaso3GeneralFields = lpObs ? PASO3_GENERAL_FIELDS_OBSERVATION : lpPost ? PASO3_GENERAL_FIELDS_POST : PASO3_GENERAL_FIELDS;
  const lpPaso4GeneralFields = lpObs ? PASO4_GENERAL_FIELDS_OBSERVATION : lpPost ? PASO4_GENERAL_FIELDS_POST : PASO4_GENERAL_FIELDS;
  const lpPaso5Fields = lpObs ? PASO5_FIELDS_OBSERVATION : lpPost ? PASO5_FIELDS_POST : PASO5_FIELDS;
  const lpPaso6AdvocacyFields = lpObs ? PASO6_ADVOCACY_FIELDS_OBSERVATION : lpPost ? PASO6_ADVOCACY_FIELDS_POST : PASO6_ADVOCACY_FIELDS;

  const inputSummary = inputs ? {
    paso1Fields: inputs.paso1 ? lpPaso1Fields.map((f) => f.key).filter((k) => inputs.paso1[k]?.response) : [],
    paso2GeneralFields: inputs.paso2General ? lpPaso2GeneralFields.filter((f) => inputs.paso2General[f.key]?.response) : [],
    paso3GeneralFields: inputs.paso3General ? lpPaso3GeneralFields.filter((f) => inputs.paso3General[f.key]?.response) : [],
    paso4GeneralFields: inputs.paso4General ? lpPaso4GeneralFields.filter((f) => inputs.paso4General[f.key]?.response) : [],
    paso5Fields: inputs.paso5 ? lpPaso5Fields.filter((f) => inputs.paso5[f.key]) : [],
    paso6Fields: inputs.paso6 ? lpPaso6AdvocacyFields.filter((f) => inputs.paso6[f.key]) : [],
    studentCount: inputs.paso2Students?.length || 0,
    students: (inputs.paso2Students || []).map((s) => `${s.student?.firstName || "?"} ${s.student?.lastName || ""}`),
    lessonTitle: inputs.paso3?.lessonTitle || null,
    subject: inputs.paso3?.subjectArea || null,
    grade: inputs.paso3?.gradeLevel || null,
  } : null;

  const nPaso1 = lpObs ? 3 : lpPost ? 5 : 10;
  const nPaso2g = lpObs ? 3 : lpPost ? 4 : 10;
  const nPaso3g = lpObs ? 3 : lpPost ? 3 : 9;
  const nPaso4g = lpObs ? 3 : lpPost ? 3 : 7;
  const nPaso5 = lpObs ? 3 : lpPost ? 4 : 8;
  const nPaso6 = lpObs ? 3 : lpPost ? 4 : 6;

  return (
    <div className="lp-view">
      {/* Header */}
      <div className="lp-header">
        <div className="lp-header__top">
          <div>
            <h2 className="lp-header__title">
              {inputs?.paso3?.lessonTitle || "Generated Lesson Plan"}
            </h2>
            <p className="lp-header__sub">
              {[inputs?.paso3?.subjectArea, inputs?.paso3?.gradeLevel].filter(Boolean).join(" · ") || "Generated from Pasos 1–6"}
            </p>
          </div>
          <div className="lp-header__badges">
            {plan.stage && (
              <span className="lp-badge lp-badge--stage">{STAGE_LABELS[plan.stage] || plan.stage}</span>
            )}
            {status && (
              <span className={`lp-badge lp-badge--${status}`}>
                {status === "generated" ? "Generated" : status}
              </span>
            )}
          </div>
        </div>
        {createdAt && (
          <p className="lp-header__date">
            Generated on {createdAt.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} at {createdAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
          </p>
        )}
      </div>

      {/* Quick stats */}
      {inputSummary && (
        <div className="lp-stats">
          <div className="lp-stat">
            <span className="lp-stat__num">{inputSummary.paso1Fields.length}/{nPaso1}</span>
            <span className="lp-stat__label">Paso 1 Reflections</span>
          </div>
          <div className="lp-stat">
            <span className="lp-stat__num">{inputSummary.paso2GeneralFields.length}/{nPaso2g}</span>
            <span className="lp-stat__label">Paso 2 General</span>
          </div>
          <div className="lp-stat">
            <span className="lp-stat__num">{inputSummary.paso4GeneralFields.length}/{nPaso4g}</span>
            <span className="lp-stat__label">Paso 3 General</span>
          </div>
          <div className="lp-stat">
            <span className="lp-stat__num">{inputSummary.paso3GeneralFields.length}/{nPaso3g}</span>
            <span className="lp-stat__label">Paso 4 General</span>
          </div>
          <div className="lp-stat">
            <span className="lp-stat__num">{inputSummary.paso5Fields.length}/{nPaso5}</span>
            <span className="lp-stat__label">Paso 5</span>
          </div>
          <div className="lp-stat">
            <span className="lp-stat__num">{inputSummary.paso6Fields.length}/{nPaso6}</span>
            <span className="lp-stat__label">Paso 6</span>
          </div>
          <div className="lp-stat">
            <span className="lp-stat__num">{inputSummary.studentCount}</span>
            <span className="lp-stat__label">Students</span>
          </div>
          <div className="lp-stat">
            <span className="lp-stat__num">{inputSummary.subject || "—"}</span>
            <span className="lp-stat__label">Subject</span>
          </div>
          <div className="lp-stat">
            <span className="lp-stat__num">{inputSummary.grade || "—"}</span>
            <span className="lp-stat__label">Grade</span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="lp-actions">
        {onBackToList && (
          <button className="btn btn--ghost" onClick={onBackToList}>
            ← All Plans
          </button>
        )}
        {!editing ? (
          <button className="btn btn--ghost" onClick={() => { setEditContent(content); setEditing(true); }}>
            Edit Content
          </button>
        ) : (
          <>
            <button
              className="btn btn--resume"
              disabled={saving}
              onClick={async () => {
                if (!onSaveContent) return;
                setSaving(true);
                await onSaveContent(editContent);
                setSaving(false);
                setEditing(false);
              }}
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
            <button className="btn btn--ghost" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </>
        )}
        <button className="btn btn--ghost" onClick={() => window.print()}>
          Print / Export PDF
        </button>
        {onRegenerate && !editing && (
          <button className="btn btn--ghost" disabled={generating} onClick={onRegenerate}>
            {generating ? "Regenerating…" : "Regenerate"}
          </button>
        )}
        {onFinalize && status !== "finalized" && !editing && (
          <button className="btn btn--resume" onClick={onFinalize}>
            Finalize Plan
          </button>
        )}
        {onDelete && !editing && (
          <button className="btn btn--ghost paso-btn--danger" onClick={() => onDelete(plan._id)}>
            Delete Plan
          </button>
        )}
        {inputSummary && !editing && (
          <button className="btn btn--ghost" onClick={() => setShowInputs(!showInputs)}>
            {showInputs ? "Hide Input Data" : "View Input Data"}
          </button>
        )}
      </div>

      {/* Collapsible input summary */}
      {showInputs && inputs && (
        <div className="lp-inputs">
          <h3 className="lp-inputs__title">Data Fed to AI (Pasos 1–6)</h3>

          {inputs.paso1 && (
            <div className="lp-inputs__section">
              <h4>Paso 1 — Knowledge of Self</h4>
              {lpPaso1Fields.map((f) => {
                const v = inputs.paso1[f.key]?.response;
                if (!v) return null;
                return <div key={f.key} className="lp-inputs__field"><strong>{f.label}:</strong> {v}</div>;
              })}
            </div>
          )}

          {inputs.paso2General && (
            <div className="lp-inputs__section">
              <h4>Paso 2 — Section 1: General Questions</h4>
              {lpPaso2GeneralFields.map((f) => {
                const v = inputs.paso2General[f.key]?.response;
                if (!v) return null;
                return <div key={f.key} className="lp-inputs__field"><strong>{f.label}:</strong> {v}</div>;
              })}
            </div>
          )}

          {inputs.paso2Students?.length > 0 && (
            <div className="lp-inputs__section">
              <h4>Paso 2 — Section 2: Students ({inputs.paso2Students.length})</h4>
              {inputs.paso2Students.map((s, i) => (
                <div key={i} className="lp-inputs__student">
                  <strong>{s.student?.firstName} {s.student?.lastName}</strong>
                  <span className="lp-inputs__student-meta">
                    {[s.student?.grade ? `Grade ${s.student.grade}` : null, s.student?.demographics?.homeLanguage || null, s.student?.demographics?.elpLevel || null].filter(Boolean).join(" · ") || "No demographics"}
                  </span>
                  {s.student?.llmEvaluation && <span className="lp-badge lp-badge--eval">Has Evaluation</span>}
                  {s.submission && <span className="lp-badge lp-badge--sub">Has Submission</span>}
                </div>
              ))}
            </div>
          )}

          {inputs.paso4General && (
            <div className="lp-inputs__section">
              <h4>Paso 3 — Section 1: General Questions</h4>
              {lpPaso4GeneralFields.map((f) => {
                const v = inputs.paso4General[f.key]?.response;
                if (!v) return null;
                return <div key={f.key} className="lp-inputs__field"><strong>{f.label}:</strong> {v}</div>;
              })}
            </div>
          )}

          {inputs.paso4 && (
            <div className="lp-inputs__section">
              <h4>Paso 3 — Section 2: State Guidelines</h4>
              {[["districtStandards", "Standards"], ["curriculumRequirements", "Curriculum"], ["assessmentGuidelines", "Assessment"], ["accommodationPolicies", "Accommodations"]].map(([k, l]) => {
                const v = inputs.paso4[k];
                if (!v) return null;
                return <div key={k} className="lp-inputs__field"><strong>{l}:</strong> {v}</div>;
              })}
            </div>
          )}

          {inputs.paso3General && (
            <div className="lp-inputs__section">
              <h4>Paso 4 — Section 1: General Questions</h4>
              {lpPaso3GeneralFields.map((f) => {
                const v = inputs.paso3General[f.key]?.response;
                if (!v) return null;
                return <div key={f.key} className="lp-inputs__field"><strong>{f.label}:</strong> {v}</div>;
              })}
            </div>
          )}

          {inputs.paso3 && (
            <div className="lp-inputs__section">
              <h4>Paso 4 — Section 2: Preliminary Lesson Plan</h4>
              {[["lessonTitle", "Title"], ["gradeLevel", "Grade"], ["subjectArea", "Subject"], ["lessonObjectives", "Objectives"]].map(([k, l]) => {
                const v = inputs.paso3[k];
                if (!v) return null;
                return <div key={k} className="lp-inputs__field"><strong>{l}:</strong> {v}</div>;
              })}
            </div>
          )}

          {inputs.paso5 && (
            <div className="lp-inputs__section">
              <h4>Paso 5 — Practice of Knowing Learners, Families & Communities</h4>
              {lpPaso5Fields.map((f) => {
                const v = inputs.paso5[f.key];
                if (!v) return null;
                return <div key={f.key} className="lp-inputs__field"><strong>{f.label}:</strong> {v}</div>;
              })}
            </div>
          )}

          {inputs.paso6 && (
            <div className="lp-inputs__section">
              <h4>Paso 6 — Practice of Advocacy</h4>
              {lpPaso6AdvocacyFields.map((f) => {
                const v = inputs.paso6[f.key];
                if (!v) return null;
                return <div key={f.key} className="lp-inputs__field"><strong>{f.label}:</strong> {v}</div>;
              })}
            </div>
          )}
        </div>
      )}

      {/* Main content — rendered markdown or editor */}
      {editing ? (
        <div className="lp-editor-wrap">
          <p className="lp-editor-hint">Edit the lesson plan content below. You can use Markdown formatting.</p>
          <textarea
            className="lp-editor"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={30}
          />
        </div>
      ) : (
        <div
          className="lp-content"
          dangerouslySetInnerHTML={{ __html: mdToHtml(content) }}
        />
      )}
    </div>
  );
}

/* ─── Dashboard Home ─────────────────────────────────────────────────── */

function DashboardHome({
  user,
  cycle,
  progressData,
  onNavigate,
  savedPlans,
  onOpenNewPlanModal,
  totalProgressOpen,
  onToggleTotalProgress,
}) {
  const firstName = user?.firstName || "Educator";
  const totalPct = progressData?.totalPct ?? 0;
  const cid = cycle?._id || cycle?.id;
  const cyclePlans = (savedPlans || []).filter((p) => (p.teacherCycleId || "").toString() === (cid || "").toString());
  const activePlan = cyclePlans[0];

  return (
    <section className="dashboard-content dashboard-home">
      <div className="dashboard-welcome">
        <div className="dashboard-welcome__text">
          <h1 className="dashboard-welcome__title">
            Welcome back, <span className="accent">{firstName}.</span>
          </h1>
          <p className="dashboard-welcome__desc">
            {cycle
              ? `Cycle "${cycle.name || "Current Cycle"}". Use the sidebar stages to work Pasos 1–6 for Pre, Observation, and Post.`
              : "Start a new coaching cycle to begin your Camino."}
          </p>
        </div>
        <button
          type="button"
          className={`dashboard-progress-box dashboard-progress-box--clickable ${totalProgressOpen ? "dashboard-progress-box--open" : ""}`}
          onClick={onToggleTotalProgress}
        >
          <span className="dashboard-progress__label">TOTAL PROGRESS ▾</span>
          <span className="dashboard-progress__value">{totalPct}%</span>
          <div className="dashboard-progress__bar dashboard-progress__bar--total">
            <div className="dashboard-progress__fill dashboard-progress__fill--total" style={{ width: `${totalPct}%` }} />
          </div>
        </button>
      </div>

      {totalProgressOpen && progressData?.stages && (
        <div className="progress-hierarchy">
          {STAGE_NAV.map((st) => {
            const agg = getStageAggregate(progressData, st.id);
            return (
              <div key={st.id} className={`progress-hierarchy__stage progress-hierarchy__stage--${st.theme}`}>
                <div className="progress-hierarchy__stage-head">
                  <strong>{st.label}</strong>
                  <span>{agg.stagePct}%</span>
                </div>
                <div className="dashboard-progress__bar dashboard-progress__bar--stage">
                  <div
                    className={`dashboard-progress__fill dashboard-progress__fill--${st.theme}`}
                    style={{ width: `${agg.stagePct}%` }}
                  />
                </div>
                <ul className="progress-hierarchy__pasos">
                  {PASO_META.map((p) => {
                    const pct = progressData.stages[st.id]?.pasos?.[`paso${p.num}`]?.pct ?? 0;
                    return (
                      <li key={p.num} className="progress-hierarchy__paso">
                        <span className="progress-hierarchy__paso-name">{p.label}</span>
                        <span className="progress-hierarchy__paso-pct">{pct}%</span>
                        <div className="dashboard-progress__bar dashboard-progress__bar--paso">
                          <div
                            className={`dashboard-progress__fill dashboard-progress__fill--${st.theme}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      )}

      <div className="dashboard-home__stage-bars">
        <h3 className="dashboard-section__subtitle">Stage progress</h3>
        <div className="dashboard-stage-bars">
          {STAGE_NAV.map((st) => {
            const agg = getStageAggregate(progressData, st.id);
            return (
              <div key={st.id} className={`dashboard-stage-bar dashboard-stage-bar--${st.theme}`}>
                <div className="dashboard-stage-bar__label">{st.short}</div>
                <div className="dashboard-progress__bar dashboard-progress__bar--stage-inline">
                  <div
                    className={`dashboard-progress__fill dashboard-progress__fill--${st.theme}`}
                    style={{ width: `${agg.stagePct}%` }}
                  />
                </div>
                <span className="dashboard-stage-bar__pct">{agg.stagePct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {activePlan && (
        <section className="dashboard-section">
          <h2 className="dashboard-section__title">
            <span className="dashboard-section__icon">📌</span>
            Active plan (latest in this cycle)
          </h2>
          <div
            className="lp-card-preview lp-card-preview--active paso-clickable"
            onClick={() => onNavigate(`plan:${activePlan._id}`)}
          >
            <div className="lp-card-preview__header">
              <span className={`lp-badge lp-badge--${activePlan.status || "generated"}`}>
                {activePlan.status === "finalized" ? "Finalized" : activePlan.status === "draft" ? "Draft" : "Generated"}
              </span>
              <span className="lp-badge lp-badge--stage">{STAGE_LABELS[activePlan.stage] || activePlan.stage || "Pre"}</span>
            </div>
            <h3 className="lp-card-preview__title">
              {activePlan.paso1to5Input?.paso3?.lessonTitle || "Lesson plan"}
            </h3>
            <p className="lp-card-preview__meta paso-muted">
              Updated {activePlan.updatedAt ? new Date(activePlan.updatedAt).toLocaleString() : "—"}
            </p>
          </div>
        </section>
      )}

      <section className="dashboard-section">
        <div className="dashboard-section__headrow">
          <h2 className="dashboard-section__title" style={{ marginBottom: 0 }}>
            <span className="dashboard-section__icon">📝</span>
            Lesson plans (this cycle)
          </h2>
          <button type="button" className="btn btn--resume" onClick={onOpenNewPlanModal}>
            + Generate Lesson Plan
          </button>
        </div>
        {cyclePlans.length === 0 ? (
          <div className="lp-empty">
            <p className="paso-muted">No lesson plans for this cycle yet. Create a blank draft or generate from your Paso data.</p>
          </div>
        ) : (
          <div className="lp-cards-grid">
            {cyclePlans.slice(0, 6).map((p) => {
              const title = p.paso1to5Input?.paso3?.lessonTitle || "Untitled Plan";
              const subject = p.paso1to5Input?.paso3?.subjectArea || "";
              const grade = p.paso1to5Input?.paso3?.gradeLevel || "";
              const date = p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";
              return (
                <div key={p._id} className="lp-card-preview paso-clickable" onClick={() => onNavigate(`plan:${p._id}`)}>
                  <div className="lp-card-preview__header">
                    <span className={`lp-badge lp-badge--${p.status || "generated"}`}>
                      {p.status === "finalized" ? "Finalized" : p.status === "draft" ? "Draft" : "Generated"}
                    </span>
                    <span className="lp-badge lp-badge--stage">{STAGE_LABELS[p.stage] || p.stage || "Pre"}</span>
                    <span className="lp-card-preview__date">{date}</span>
                  </div>
                  <h3 className="lp-card-preview__title">{title}</h3>
                  <p className="lp-card-preview__meta">{[subject, grade].filter(Boolean).join(" · ") || "Lesson Plan"}</p>
                  <p className="lp-card-preview__snippet">
                    {(p.content || "").replace(/[#*_]/g, "").substring(0, 120)}
                    {(p.content || "").length > 120 ? "…" : ""}
                  </p>
                </div>
              );
            })}
          </div>
        )}
        {cyclePlans.length > 0 && (
          <button className="btn btn--ghost" style={{ marginTop: 12 }} onClick={() => onNavigate("plans")}>
            View All Plans →
          </button>
        )}
      </section>
    </section>
  );
}

/* ─── Plans List View ────────────────────────────────────────────────── */

function PlansListView({ plans, onOpen, onNewLessonPlan, onDelete }) {
  return (
    <div className="lp-list-view">
      <div className="lp-list-view__header">
        <h2 className="lp-list-view__title">My Lesson Plans</h2>
        <div className="lp-list-view__actions">
          <button type="button" className="btn btn--ghost" onClick={onNewLessonPlan}>
            + Generate Lesson Plan
          </button>
        </div>
      </div>
      {(!plans || plans.length === 0) ? (
        <div className="lp-empty" style={{ marginTop: 32 }}>
          <div className="paso-empty-state__icon">📝</div>
          <p className="paso-muted">No lesson plans yet. Use Generate Lesson Plan to add a blank draft or generate with AI.</p>
        </div>
      ) : (
        <div className="lp-list-grid">
          {plans.map((p) => {
            const title = p.paso1to5Input?.paso3?.lessonTitle || "Untitled Plan";
            const subject = p.paso1to5Input?.paso3?.subjectArea || "";
            const grade = p.paso1to5Input?.paso3?.gradeLevel || "";
            const created = p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }) : "";
            const updated = p.updatedAt ? new Date(p.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "";
            const studentCount = p.paso1to5Input?.paso2Students?.length || 0;
            return (
              <div key={p._id} className="lp-list-item paso-clickable" onClick={() => onOpen(p._id)}>
                <div className="lp-list-item__left">
                  <div className="lp-list-item__icon">📄</div>
                  <div>
                    <h3 className="lp-list-item__title">{title}</h3>
                    <p className="lp-list-item__meta">{[subject, grade].filter(Boolean).join(" · ")}{studentCount > 0 ? ` · ${studentCount} students` : ""}</p>
                  </div>
                </div>
                <div className="lp-list-item__right">
                  <span className={`lp-badge lp-badge--${p.status || "generated"}`}>
                    {p.status === "finalized" ? "Finalized" : p.status === "draft" ? "Draft" : "Generated"}
                  </span>
                  <span className="lp-badge lp-badge--stage">{STAGE_LABELS[p.stage] || p.stage || "Pre"}</span>
                  <span className="lp-list-item__date">
                    Created {created}{updated !== created ? ` · Updated ${updated}` : ""}
                  </span>
                  {onDelete && (
                    <button
                      className="btn btn--ghost paso-btn--danger lp-list-item__delete"
                      onClick={(e) => { e.stopPropagation(); onDelete(p._id); }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */

function TeacherDashboard({ user, onLogout }) {
  const firstName = user?.firstName || "Educator";

  const [view, setView] = useState("home");
  const [cycle, setCycle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  const [pasoData, setPasoData] = useState({});
  const [pasoLoading, setPasoLoading] = useState(false);
  const [pasoSaving, setPasoSaving] = useState(false);

  const [activeStage, setActiveStage] = useState("pre");
  const [progressData, setProgressData] = useState(null);
  const [totalProgressOpen, setTotalProgressOpen] = useState(false);
  const [showNewPlanModal, setShowNewPlanModal] = useState(false);
  const [newPlanModalStage, setNewPlanModalStage] = useState("pre");

  const [lessonPlan, setLessonPlan] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [savedPlans, setSavedPlans] = useState([]);

  const [creatingCycle, setCreatingCycle] = useState(false);
  const [cycleName, setCycleName] = useState("");

  /* ── Bootstrap: load cycles ────────────────────────────────────────── */

  const bootstrap = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await listCycles();
      const cycles = res.cycles || res || [];
      if (cycles.length > 0) {
        const latest = cycles[cycles.length - 1];
        const full = await getCycle(latest._id || latest.id);
        const c = full.cycle || full;
        setCycle(c);
        try {
          const prog = await getCycleProgress(c._id || c.id);
          setProgressData(prog);
        } catch {
          setProgressData(null);
        }
      }
      try {
        const plansRes = await listLessonPlans();
        setSavedPlans(plansRes.lessonPlans || []);
      } catch { /* silent */ }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => { bootstrap(); }, [bootstrap]);

  const refreshProgress = useCallback(async () => {
    if (!cycle?._id && !cycle?.id) return;
    try {
      const prog = await getCycleProgress(cycle._id || cycle.id);
      setProgressData(prog);
    } catch {
      /* keep previous */
    }
  }, [cycle]);

  /* ── Create cycle ──────────────────────────────────────────────────── */

  async function handleCreateCycle() {
    if (!cycleName.trim()) return;
    setCreatingCycle(true);
    try {
      const res = await createCycle(cycleName.trim());
      const c = res.cycle || res;
      setCycle(c);
      setActiveStage("pre");
      setCycleName("");
      try {
        const prog = await getCycleProgress(c._id || c.id);
        setProgressData(prog);
      } catch {
        setProgressData(null);
      }
      setToast({ msg: "Cycle created!", type: "success" });
    } catch (err) {
      setToast({ msg: err.message, type: "error" });
    }
    setCreatingCycle(false);
  }

  /* ── Load paso data ────────────────────────────────────────────────── */

  const loadPaso = useCallback(async (num, stageOverride) => {
    if (!cycle) return;
    const st = stageOverride ?? activeStage;
    setPasoLoading(true);
    try {
      const res = await getPaso(cycle._id || cycle.id, num, st);
      const key = `paso${num}`;
      let d;
      if (num === 2) {
        d = res.submissions ? { students: res.students, submissions: res.submissions, paso2General: res.paso2General } : res[key] || res.paso || res.data || res;
        d = d || {};
        if (d.submissions && d.submissions.length > 0 && d.notes === undefined) d.notes = d.submissions[0].notes || "";
      } else if (num === 3) {
        d = { ...(res[key] || res.paso || res.data || res || {}), paso3General: res.paso3General };
      } else if (num === 4) {
        d = { ...(res[key] || res.paso || res.data || res || {}), paso4General: res.paso4General };
      } else {
        d = res[key] || res.paso || res.data || res || {};
      }
      setPasoData((prev) => ({ ...prev, [num]: d }));
    } catch {
      setPasoData((prev) => ({ ...prev, [num]: prev[num] || {} }));
    }
    setPasoLoading(false);
  }, [cycle, activeStage]);

  useEffect(() => {
    const m = view?.match(/^paso(\d)$/);
    if (m && cycle) loadPaso(Number(m[1]));
  }, [view, activeStage, cycle, loadPaso]);

  /* ── Save paso data ────────────────────────────────────────────────── */

  async function handleSavePaso(num, mode, overridePayload) {
    if (!cycle) return;
    if (num === 2 && !overridePayload) {
      setToast({ msg: "Add at least one student to save Paso 2.", type: "error" });
      return;
    }
    setPasoSaving(true);
    try {
      const status = mode === "complete" ? "completed" : "draft";
      const raw = overridePayload || pasoData[num] || {};
      const { _id, __v, createdAt, updatedAt, teacherCycleId, teacherId, ...clean } = raw;
      const payload = { ...clean, status };
      await savePaso(cycle._id || cycle.id, num, payload, activeStage);
      await refreshProgress();
      setToast({ msg: mode === "complete" ? `Paso ${num} completed!` : "Draft saved.", type: "success" });
      if (mode === "complete" && num < 6) {
        navigateTo(`paso${num + 1}`);
      }
    } catch (err) {
      setToast({ msg: err.message, type: "error" });
    }
    setPasoSaving(false);
  }

  /* ── Generate lesson plan ──────────────────────────────────────────── */

  async function handleGenerateWithStage(stage) {
    if (!cycle) return;
    setGenerating(true);
    setShowNewPlanModal(false);
    try {
      const res = await generateLessonPlan(cycle._id || cycle.id, stage || activeStage);
      const plan = res.lessonPlan || res;
      setLessonPlan(plan);
      setToast({ msg: "Lesson plan generated!", type: "success" });
      setView("lessonPlan");
      try {
        const plansRes = await listLessonPlans();
        setSavedPlans(plansRes.lessonPlans || []);
      } catch { /* silent */ }
    } catch (err) {
      const aiError = isAiServiceError(err.message);
      setToast({
        msg: err.message || "Failed to generate lesson plan.",
        type: "error",
        onRetry: aiError ? () => handleGenerateWithStage(stage) : undefined,
      });
    }
    setGenerating(false);
  }

  async function handleOpenPlan(planId) {
    setPasoLoading(true);
    try {
      const res = await getLessonPlan(planId);
      setLessonPlan(res.lessonPlan || res);
      setView("lessonPlan");
    } catch (err) {
      setToast({ msg: err.message, type: "error" });
    }
    setPasoLoading(false);
  }

  async function handleSavePlanContent(content) {
    if (!lessonPlan?._id) return;
    try {
      const res = await updateLessonPlan(lessonPlan._id, { content });
      const updated = res.lessonPlan || res;
      setLessonPlan(updated);
      setSavedPlans((prev) => prev.map((p) => (p._id === updated._id ? { ...p, content: updated.content, updatedAt: updated.updatedAt } : p)));
      setToast({ msg: "Lesson plan saved!", type: "success" });
    } catch (err) {
      setToast({ msg: err.message, type: "error" });
    }
  }

  async function handleFinalizePlan() {
    if (!lessonPlan?._id) return;
    try {
      const res = await updateLessonPlan(lessonPlan._id, { status: "finalized" });
      const updated = res.lessonPlan || res;
      setLessonPlan(updated);
      setSavedPlans((prev) => prev.map((p) => (p._id === updated._id ? { ...p, status: updated.status } : p)));
      setToast({ msg: "Lesson plan finalized!", type: "success" });
    } catch (err) {
      setToast({ msg: err.message, type: "error" });
    }
  }

  async function handleDeletePlan(planId) {
    if (!planId) return;
    if (!window.confirm("Delete this lesson plan? This cannot be undone.")) return;
    try {
      await deleteLessonPlan(planId);
      setSavedPlans((prev) => prev.filter((p) => p._id !== planId));
      if (lessonPlan?._id === planId) {
        setLessonPlan(null);
        setView("plans");
      }
      setToast({ msg: "Lesson plan deleted.", type: "success" });
    } catch (err) {
      setToast({ msg: err.message, type: "error" });
    }
  }

  /* ── Navigation helper ─────────────────────────────────────────────── */

  function navigateTo(target) {
    setView(target);
    const stageMatch = target.match(/^stage:(pre|observation|post)$/);
    if (stageMatch) setActiveStage(stageMatch[1]);
    const planMatch = target.match(/^plan:(.+)$/);
    if (planMatch) handleOpenPlan(planMatch[1]);
  }

  function updatePasoData(num, newData) {
    setPasoData((prev) => ({ ...prev, [num]: newData }));
  }

  function themeStageId() {
    if (view === "lessonPlan" && lessonPlan?.stage) return lessonPlan.stage;
    if (view?.startsWith("stage:")) return view.split(":")[1];
    const pm = view?.match(/^paso(\d)$/);
    if (pm) return activeStage;
    return activeStage;
  }
  const themeStage = STAGE_NAV.find((s) => s.id === themeStageId())?.theme || "stage-pre";

  /* ── Header title based on view ────────────────────────────────────── */

  function headerTitle() {
    if (view === "home") return "Dashboard";
    if (view === "lessonPlan") return "Lesson Plan";
    if (view === "plans") return "My Lesson Plans";
    if (view === "stage:pre") return "Pre conference";
    if (view === "stage:observation") return "Observation";
    if (view === "stage:post") return "Post conference / reflection";
    const m = view.match(/^paso(\d)$/);
    if (m) {
      const meta = PASO_META.find((p) => p.num === Number(m[1]));
      const stl = STAGE_LABELS[activeStage] || activeStage;
      return meta ? `${stl} · ${meta.label} — ${meta.name}` : "Paso";
    }
    return "Dashboard";
  }

  /* ── Render main area ──────────────────────────────────────────────── */

  function renderMain() {
    if (loading) {
      return (
        <section className="dashboard-content paso-center">
          <div className="paso-spinner" />
          <p className="paso-muted">Loading your Camino…</p>
        </section>
      );
    }

    if (!cycle) {
      return (
        <section className="dashboard-content paso-center">
          <div className="paso-empty-state">
            <div className="paso-empty-state__icon">🛤️</div>
            <h2>Start Your Coaching Camino</h2>
            <p className="paso-muted">Create a new coaching cycle to begin working through Pasos 1–6.</p>
            {error && <p className="auth-message auth-message--error">{error}</p>}
            <div className="paso-create-cycle">
              <input
                className="auth-input"
                placeholder="Cycle name (e.g. Spring 2026)"
                value={cycleName}
                onChange={(e) => setCycleName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateCycle()}
              />
              <button className="btn btn--resume" disabled={creatingCycle || !cycleName.trim()} onClick={handleCreateCycle}>
                {creatingCycle ? "Creating…" : "Create Cycle"}
              </button>
            </div>
          </div>
        </section>
      );
    }

    if (view === "home") {
      return (
        <DashboardHome
          user={user}
          cycle={cycle}
          progressData={progressData}
          onNavigate={navigateTo}
          savedPlans={savedPlans}
          onOpenNewPlanModal={() => { setNewPlanModalStage(activeStage); setShowNewPlanModal(true); }}
          totalProgressOpen={totalProgressOpen}
          onToggleTotalProgress={() => setTotalProgressOpen((o) => !o)}
        />
      );
    }

    if (view === "plans") {
      return (
        <section className="dashboard-content">
          <PlansListView
            plans={savedPlans}
            onOpen={(id) => navigateTo(`plan:${id}`)}
            onNewLessonPlan={() => { setNewPlanModalStage(activeStage); setShowNewPlanModal(true); }}
            onDelete={handleDeletePlan}
          />
        </section>
      );
    }

    if (view === "lessonPlan") {
      return (
        <section className="dashboard-content">
          <LessonPlanView
            plan={lessonPlan}
            onRegenerate={() => handleGenerateWithStage(lessonPlan?.stage || activeStage)}
            generating={generating}
            onSaveContent={handleSavePlanContent}
            onFinalize={handleFinalizePlan}
            onBackToList={() => navigateTo("plans")}
            onDelete={handleDeletePlan}
          />
        </section>
      );
    }

    if (view && view.startsWith("stage:")) {
      const stageId = view.split(":")[1];
      const stTheme = STAGE_NAV.find((x) => x.id === stageId)?.theme || "stage-pre";
      return (
        <section className={`dashboard-content dashboard-content--stage ${stTheme}`}>
          <div className="dashboard-section">
            <h2 className="dashboard-section__title">
              <span className="dashboard-section__icon">🧩</span>
              {stageId === "pre"
                ? "Pre conference — Pasos 1–6"
                : stageId === "observation"
                  ? "Observation — Pasos 1–6"
                  : "Post conference / reflection — Pasos 1–6"}
            </h2>
            <div className="pathway-grid">
              {PASO_META.map((p) => {
                const apiSt = getPasoApiStatus(progressData, stageId, p.num);
                const nav = navFromApiStatus(apiSt);
                const statusLabel = labelFromApiStatus(apiSt);
                const cardClass = cardClassFromApiStatus(apiSt);
                return (
                  <div
                    key={p.num}
                    className={`pathway-card pathway-card--${cardClass} pathway-card--${stTheme} paso-clickable`}
                    onClick={() => navigateTo(`paso${p.num}`)}
                  >
                    <div className={`pathway-card__icon pathway-card__icon--${cardClass}`}>
                      {nav === "completed" ? "✓" : (p.displayNum ?? p.num)}
                    </div>
                    <span className={`pathway-card__pill pathway-card__pill--${cardClass}`}>
                      {statusLabel}
                    </span>
                    <h3 className="pathway-card__title">
                      {p.label}: {p.name}
                    </h3>
                    <p className="pathway-card__desc">{p.name}</p>
                    <div className="pathway-card__footer">
                      <span className="pathway-card__action">
                        {nav === "completed" ? "Review →" : nav === "draft" ? "Continue →" : "Start →"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      );
    }

    const pasoMatch = view.match(/^paso(\d)$/);
    if (!pasoMatch) return null;
    const num = Number(pasoMatch[1]);

    if (pasoLoading) {
      return (
        <section className="dashboard-content paso-center">
          <div className="paso-spinner" />
          <p className="paso-muted">Loading Paso {num}…</p>
        </section>
      );
    }

    const d = pasoData[num] || {};
    const handleChange = (newD) => updatePasoData(num, newD);
    const handleSave = (mode, extra) => handleSavePaso(num, mode, extra);

    const stTheme = STAGE_NAV.find((x) => x.id === activeStage)?.theme || "stage-pre";
    const stagePasosLabel = STAGE_LABELS[activeStage] || activeStage;
    const pasoShell = (inner) => (
      <section className={`dashboard-content dashboard-content--stage ${stTheme}`}>
        <div className="paso-form-back">
          <button
            type="button"
            className="btn btn--ghost paso-form-back__btn"
            onClick={() => navigateTo(`stage:${activeStage}`)}
            aria-label={`Back to ${stagePasosLabel} Pasos overview`}
          >
            ← Back to {stagePasosLabel} Pasos
          </button>
        </div>
        {inner}
      </section>
    );
    switch (num) {
      case 1: return pasoShell(<Paso1Form data={d} onChange={handleChange} onSave={handleSave} saving={pasoSaving} stage={activeStage} cycleId={cycle._id || cycle.id} />);
      case 2: return pasoShell(
        <Paso2Form
          cycleId={cycle._id || cycle.id}
          stage={activeStage}
          data={d}
          onChange={handleChange}
          onSave={handleSave}
          saving={pasoSaving}
          onAfterGeneralSave={refreshProgress}
        />
      );
      case 3: return pasoShell(
        <Paso3Form
          cycleId={cycle._id || cycle.id}
          stage={activeStage}
          data={d}
          onChange={handleChange}
          onSave={handleSave}
          saving={pasoSaving}
          onAfterGeneralSave={refreshProgress}
        />
      );
      case 4: return pasoShell(
        <Paso4Form
          cycleId={cycle._id || cycle.id}
          stage={activeStage}
          data={d}
          onChange={handleChange}
          onSave={handleSave}
          saving={pasoSaving}
          onAfterGeneralSave={refreshProgress}
        />
      );
      case 5: return pasoShell(<Paso5Form data={d} onChange={handleChange} onSave={handleSave} saving={pasoSaving} stage={activeStage} cycleId={cycle._id || cycle.id} />);
      case 6: return pasoShell(<Paso6Form data={d} onChange={handleChange} onSave={handleSave} saving={pasoSaving} stage={activeStage} cycleId={cycle._id || cycle.id} />);
      default: return null;
    }
  }

  /* ════════════════════════════════════════════════════════════════════ */

  return (
    <div className={`dashboard dashboard--teacher dashboard-theme--${themeStage}`}>
      {toast && (
        <Toast
          msg={toast.msg}
          type={toast.type}
          onRetry={toast.onRetry}
          onDone={() => setToast(null)}
        />
      )}

      {showNewPlanModal && (
        <div className="lp-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="new-plan-title">
          <div className="lp-modal">
            <h2 id="new-plan-title" className="lp-modal__title">New lesson plan</h2>
            <p className="paso-muted">Choose how to create your plan. Data comes from the coaching stage you select.</p>
            <label className="lp-modal__label">
              <span>Coaching stage</span>
              <select
                className="auth-input"
                value={newPlanModalStage}
                onChange={(e) => setNewPlanModalStage(e.target.value)}
              >
                <option value="pre">Pre Conference</option>
                <option value="observation">Observation</option>
                <option value="post">Post Conference / Reflection</option>
              </select>
            </label>
            <div className="lp-modal__actions">
              <button
                type="button"
                className="btn btn--resume"
                disabled={generating}
                onClick={() => handleGenerateWithStage(newPlanModalStage)}
              >
                {generating ? "Generating…" : "Generate from current data"}
              </button>
            </div>
            <button type="button" className="lp-modal__close btn btn--ghost" onClick={() => setShowNewPlanModal(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Sidebar ──────────────────────────────────────────────────── */}
      <aside className={`dashboard-sidebar dashboard-sidebar--${themeStage}`}>
        <div className="dashboard-sidebar__brand">
          <div className="dashboard-sidebar__logo">Cc</div>
          <div className="dashboard-sidebar__brand-text">
            <span className="dashboard-sidebar__title">The Coaching Camino</span>
            <span className="dashboard-sidebar__subtitle">TEACHER DASHBOARD</span>
          </div>
        </div>

        <nav className="dashboard-sidebar__nav">
          <button
            type="button"
            className={`paso-nav-item ${view === "home" ? "paso-nav-item--active" : ""}`}
            onClick={() => navigateTo("home")}
          >
            <span className="paso-nav-item__icon">🏠</span>
            <span className="paso-nav-item__label">Dashboard</span>
          </button>

          <ul className="journey-steps journey-steps--stages">
            {STAGE_NAV.map((s, idx) => {
              const agg = getStageAggregate(progressData, s.id);
              const active = view === `stage:${s.id}` || (typeof view === "string" && /^paso\d$/.test(view) && activeStage === s.id);
              const isCompleted = agg.nav === "completed";
              return (
                <li key={s.id}>
                  <div
                    className={`journey-step journey-step--${agg.statusClass} journey-step--${s.theme} ${active ? "journey-step--active" : ""}`}
                    onClick={() => navigateTo(`stage:${s.id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <span className="journey-step__num">{isCompleted ? "✓" : idx + 1}</span>
                    <div className="journey-step__content">
                      <span className="journey-step__name">{s.label}</span>
                      <span className="journey-step__status">{agg.displayStatus} · {agg.stagePct}%</span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <h3 className="dashboard-sidebar__section-title" style={{ marginTop: 16 }}>LESSON PLANS</h3>
          <div
            className={`paso-nav-item ${view === "plans" || view === "lessonPlan" ? "paso-nav-item--active" : ""}`}
            onClick={() => navigateTo("plans")}
            style={{ cursor: "pointer", marginBottom: 4 }}
          >
            <span className="paso-nav-item__icon">📝</span>
            <span className="paso-nav-item__label">My Plans{savedPlans.length > 0 ? ` (${savedPlans.length})` : ""}</span>
          </div>

          <div className="paso-sidebar-generate">
            <button
              type="button"
              className="btn btn--resume paso-generate-btn"
              disabled={generating}
              onClick={() => { setNewPlanModalStage(activeStage); setShowNewPlanModal(true); }}
            >
              + Generate Lesson Plan
            </button>
          </div>
        </nav>

        <div className="dashboard-sidebar__profile">
          <div className="dashboard-avatar dashboard-avatar--teacher">
            {firstName.charAt(0)}
          </div>
          <div className="dashboard-profile__info">
            <span className="dashboard-profile__name">
              {user?.firstName} {user?.lastName}
            </span>
            <button type="button" className="dashboard-profile__link" onClick={onLogout}>
              Log out
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────────────── */}
      <main className={`dashboard-main dashboard-main--${themeStage}`}>
        <header className="dashboard-header">
          <div className="dashboard-header__breadcrumb">
            <h1 className="dashboard-header__title">{headerTitle()}</h1>
            {cycle && (
              <span className="dashboard-header__crumb">
                Cycle: {cycle.name || "Current"}
              </span>
            )}
          </div>
          <div className="dashboard-header__actions">
            <button type="button" className="btn btn--ghost btn--logout" onClick={onLogout}>
              Log out
            </button>
          </div>
        </header>

        {renderMain()}
      </main>
    </div>
  );
}

export default TeacherDashboard;
