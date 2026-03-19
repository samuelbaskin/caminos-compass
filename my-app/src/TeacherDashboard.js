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
  listLessonPlans,
  getLessonPlan,
  updateLessonPlan,
  deleteLessonPlan,
} from "./api/cycles";

const PASO_META = [
  { num: 1, label: "Paso 1", name: "Knowledge of Self", section: "pre" },
  { num: 2, label: "Paso 2", name: "Knowledge of Learner/Student Profile", section: "pre" },
  { num: 3, label: "Paso 3", name: "Practice of Teaching/Preliminary Lesson Plan", section: "pre" },
  { num: 4, label: "Paso 4", name: "Knowledge of Sociopolitical Dynamics", section: "pre" },
  { num: 5, label: "Paso 5", name: "Practice of Knowing Learners, Families & Communities", section: "post" },
  { num: 6, label: "Paso 6", name: "Practice of Advocacy", section: "post" },
];

/* ─── Toast ──────────────────────────────────────────────────────────── */

function Toast({ msg, type, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className={`paso-toast paso-toast--${type}`}>
      {type === "success" ? "✓" : "⚠"} {msg}
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

function Paso1Form({ data, onChange, onSave, saving }) {
  return (
    <div className="paso-form">
      <div className="paso-form__header">
        <h2 className="paso-form__title">Paso 1 — Knowledge of Self</h2>
        <p className="paso-form__desc">
          Reflect on who you are as an educator. Complete each sub-questionnaire to build your self-awareness profile.
        </p>
      </div>
      {PASO1_FIELDS.map((f) => {
        const raw = data[f.key];
        const value = typeof raw === "object" && raw !== null && "response" in raw ? (raw.response || "") : (raw || "");
        return (
          <div key={f.key} className="paso-form__section">
            <h3 className="paso-form__section-title">{f.label}</h3>
            <div className="auth-field">
              <textarea
                className="auth-input paso-textarea"
                rows={5}
                placeholder={f.placeholder}
                value={value}
                onChange={(e) => onChange({ ...data, [f.key]: { response: e.target.value, isDraft: true } })}
              />
            </div>
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

function Paso2Form({ cycleId, data, onChange, onSave, saving }) {
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
  const [generalLoaded, setGeneralLoaded] = useState(false);

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
    if (!cycleId || generalLoaded) return;
    (async () => {
      try {
        const res = await getPaso2General(cycleId);
        if (res.paso2General) setGeneralData(res.paso2General);
      } catch { /* silent */ }
      setGeneralLoaded(true);
    })();
  }, [cycleId, generalLoaded]);

  async function handleSaveGeneral(mode) {
    if (!cycleId) return;
    setGeneralSaving(true);
    try {
      const status = mode === "complete" ? "completed" : "draft";
      const { _id, __v, createdAt, updatedAt, teacherCycleId, teacherId, ...clean } = generalData;
      await savePaso2General(cycleId, { ...clean, status });
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

  return (
    <div className="paso-form">
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
              Answer the following questions about your overall knowledge of your students and their readiness.
            </p>
            {PASO2_GENERAL_FIELDS.map((f) => (
              <div key={f.key} className="auth-field" style={{ marginBottom: 16 }}>
                <label className="auth-label" style={{ fontWeight: 600, marginBottom: 4, display: "block" }}>{f.label}</label>
                <textarea
                  className="auth-input paso-textarea"
                  rows={3}
                  placeholder={f.placeholder}
                  value={generalData[f.key]?.response || ""}
                  onChange={(e) => handleGeneralChange(f.key, e.target.value)}
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

/* ─── Paso 3 : Practice of Teaching/Preliminary Lesson Plan ──────────── */

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

function Paso3Form({ cycleId, data, onChange, onSave, saving }) {
  const [activeSection, setActiveSection] = useState("general");
  const [generalData, setGeneralData] = useState({});
  const [generalSaving, setGeneralSaving] = useState(false);
  const [generalLoaded, setGeneralLoaded] = useState(false);

  useEffect(() => {
    if (!cycleId || generalLoaded) return;
    (async () => {
      try {
        const res = await getPaso3General(cycleId);
        if (res.paso3General) setGeneralData(res.paso3General);
      } catch { /* silent */ }
      setGeneralLoaded(true);
    })();
  }, [cycleId, generalLoaded]);

  async function handleSaveGeneral(mode) {
    if (!cycleId) return;
    setGeneralSaving(true);
    try {
      const status = mode === "complete" ? "completed" : "draft";
      const { _id, __v, createdAt, updatedAt, teacherCycleId, teacherId, ...clean } = generalData;
      await savePaso3General(cycleId, { ...clean, status });
    } catch { /* silent */ }
    setGeneralSaving(false);
  }

  function handleGeneralChange(key, value) {
    setGeneralData((prev) => ({ ...prev, [key]: { response: value, isDraft: true } }));
  }

  return (
    <div className="paso-form">
      <div className="paso-form__header">
        <h2 className="paso-form__title">Paso 3 — Practice of Teaching/Preliminary Lesson Plan</h2>
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
              Answer the following questions about your teaching practice and lesson design.
            </p>
            {PASO3_GENERAL_FIELDS.map((f) => (
              <div key={f.key} className="auth-field" style={{ marginBottom: 16 }}>
                <label className="auth-label" style={{ fontWeight: 600, marginBottom: 4, display: "block" }}>{f.label}</label>
                <textarea
                  className="auth-input paso-textarea"
                  rows={3}
                  placeholder={f.placeholder}
                  value={generalData[f.key]?.response || ""}
                  onChange={(e) => handleGeneralChange(f.key, e.target.value)}
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
              <div key={f.key} className="auth-field" style={{ marginBottom: 16 }}>
                <label className="auth-label">{f.label}</label>
                {f.type === "textarea" ? (
                  <textarea
                    className="auth-input paso-textarea"
                    rows={5}
                    placeholder={f.placeholder}
                    value={data[f.key] || ""}
                    onChange={(e) => onChange({ ...data, [f.key]: e.target.value })}
                  />
                ) : (
                  <input
                    className="auth-input"
                    placeholder={f.placeholder}
                    value={data[f.key] || ""}
                    onChange={(e) => onChange({ ...data, [f.key]: e.target.value })}
                  />
                )}
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

/* ─── Paso 4 : Knowledge of Sociopolitical Dynamics ──────────────────── */

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

function Paso4Form({ cycleId, data, onChange, onSave, saving }) {
  const [activeSection, setActiveSection] = useState("general");
  const [generalData, setGeneralData] = useState({});
  const [generalSaving, setGeneralSaving] = useState(false);
  const [generalLoaded, setGeneralLoaded] = useState(false);

  useEffect(() => {
    if (!cycleId || generalLoaded) return;
    (async () => {
      try {
        const res = await getPaso4General(cycleId);
        if (res.paso4General) setGeneralData(res.paso4General);
      } catch { /* silent */ }
      setGeneralLoaded(true);
    })();
  }, [cycleId, generalLoaded]);

  async function handleSaveGeneral(mode) {
    if (!cycleId) return;
    setGeneralSaving(true);
    try {
      const status = mode === "complete" ? "completed" : "draft";
      const { _id, __v, createdAt, updatedAt, teacherCycleId, teacherId, ...clean } = generalData;
      await savePaso4General(cycleId, { ...clean, status });
    } catch { /* silent */ }
    setGeneralSaving(false);
  }

  function handleGeneralChange(key, value) {
    setGeneralData((prev) => ({ ...prev, [key]: { response: value, isDraft: true } }));
  }

  return (
    <div className="paso-form">
      <div className="paso-form__header">
        <h2 className="paso-form__title">Paso 4 — Knowledge of Sociopolitical Dynamics</h2>
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
          Section 2 — District Guidelines
        </button>
      </div>

      {activeSection === "general" && (
        <>
          <div className="paso-form__section">
            <h3 className="paso-form__section-title">General Questions</h3>
            <p className="paso-form__desc" style={{ marginBottom: 16 }}>
              Answer the following questions about sociopolitical dynamics and equitable access.
            </p>
            {PASO4_GENERAL_FIELDS.map((f) => (
              <div key={f.key} className="auth-field" style={{ marginBottom: 16 }}>
                <label className="auth-label" style={{ fontWeight: 600, marginBottom: 4, display: "block" }}>{f.label}</label>
                <textarea
                  className="auth-input paso-textarea"
                  rows={3}
                  placeholder={f.placeholder}
                  value={generalData[f.key]?.response || ""}
                  onChange={(e) => handleGeneralChange(f.key, e.target.value)}
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
              <div key={f.key} className="auth-field" style={{ marginBottom: 16 }}>
                <label className="auth-label">{f.label}</label>
                <textarea
                  className="auth-input paso-textarea"
                  rows={5}
                  placeholder={f.placeholder}
                  value={data[f.key] || ""}
                  onChange={(e) => onChange({ ...data, [f.key]: e.target.value })}
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

function Paso5Form({ data, onChange, onSave, saving }) {
  return (
    <div className="paso-form">
      <div className="paso-form__header">
        <h2 className="paso-form__title">Paso 5 — Practice of Knowing Learners, Families & Communities</h2>
        <p className="paso-form__desc">
          Describe how you center student and family voice, language, and culture in your practice.
        </p>
      </div>
      {PASO5_FIELDS.map((f) => (
        <div key={f.key} className="paso-form__section">
          <div className="auth-field">
            <label className="auth-label">{f.label}</label>
            <textarea
              className="auth-input paso-textarea"
              rows={5}
              placeholder={f.placeholder}
              value={data[f.key] || ""}
              onChange={(e) => onChange({ ...data, [f.key]: e.target.value })}
            />
          </div>
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

function Paso6Form({ data, onChange, onSave, saving }) {
  function setProgress(key, value) {
    const clamped = Math.min(100, Math.max(0, Number(value) || 0));
    onChange({ ...data, [key]: clamped });
  }

  return (
    <div className="paso-form">
      <div className="paso-form__header">
        <h2 className="paso-form__title">Paso 6 — Practice of Advocacy</h2>
        <p className="paso-form__desc">
          Track your growth across advocacy domains and gather feedback to inform your practice.
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
        {PASO6_ADVOCACY_FIELDS.map((f) => (
          <div key={f.key} className="auth-field" style={{ marginBottom: 14 }}>
            <label className="auth-label">{f.label}</label>
            <textarea
              className="auth-input paso-textarea"
              rows={4}
              placeholder={f.placeholder}
              value={data[f.key] || ""}
              onChange={(e) => onChange({ ...data, [f.key]: e.target.value })}
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

  const inputSummary = inputs ? {
    paso1Fields: inputs.paso1 ? ["q1_positionality", "q2_hiddenCurriculum", "q3_explicitTeaching", "q4_contentKnowledge", "q5_learningProcess", "q6_studentRelationship", "q7_diversityAffirmation", "q8_learnerModeling", "q9_growthMindset", "q10_preparedness"].filter((k) => inputs.paso1[k]?.response) : [],
    paso2GeneralFields: inputs.paso2General ? PASO2_GENERAL_FIELDS.filter((f) => inputs.paso2General[f.key]?.response) : [],
    paso3GeneralFields: inputs.paso3General ? PASO3_GENERAL_FIELDS.filter((f) => inputs.paso3General[f.key]?.response) : [],
    paso4GeneralFields: inputs.paso4General ? PASO4_GENERAL_FIELDS.filter((f) => inputs.paso4General[f.key]?.response) : [],
    paso5Fields: inputs.paso5 ? PASO5_FIELDS.filter((f) => inputs.paso5[f.key]) : [],
    paso6Fields: inputs.paso6 ? PASO6_ADVOCACY_FIELDS.filter((f) => inputs.paso6[f.key]) : [],
    studentCount: inputs.paso2Students?.length || 0,
    students: (inputs.paso2Students || []).map((s) => `${s.student?.firstName || "?"} ${s.student?.lastName || ""}`),
    lessonTitle: inputs.paso3?.lessonTitle || null,
    subject: inputs.paso3?.subjectArea || null,
    grade: inputs.paso3?.gradeLevel || null,
  } : null;

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
          {status && (
            <span className={`lp-badge lp-badge--${status}`}>
              {status === "generated" ? "Generated" : status}
            </span>
          )}
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
            <span className="lp-stat__num">{inputSummary.paso1Fields.length}/10</span>
            <span className="lp-stat__label">Paso 1 Reflections</span>
          </div>
          <div className="lp-stat">
            <span className="lp-stat__num">{inputSummary.paso2GeneralFields.length}/10</span>
            <span className="lp-stat__label">Paso 2 General</span>
          </div>
          <div className="lp-stat">
            <span className="lp-stat__num">{inputSummary.paso3GeneralFields.length}/9</span>
            <span className="lp-stat__label">Paso 3 General</span>
          </div>
          <div className="lp-stat">
            <span className="lp-stat__num">{inputSummary.paso4GeneralFields.length}/7</span>
            <span className="lp-stat__label">Paso 4 General</span>
          </div>
          <div className="lp-stat">
            <span className="lp-stat__num">{inputSummary.paso5Fields.length}/8</span>
            <span className="lp-stat__label">Paso 5</span>
          </div>
          <div className="lp-stat">
            <span className="lp-stat__num">{inputSummary.paso6Fields.length}/6</span>
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
          <h3 className="lp-inputs__title">Data Fed to AI (Pasos 1–5)</h3>

          {inputs.paso1 && (
            <div className="lp-inputs__section">
              <h4>Paso 1 — Knowledge of Self</h4>
              {PASO1_FIELDS.map((f) => {
                const v = inputs.paso1[f.key]?.response;
                if (!v) return null;
                return <div key={f.key} className="lp-inputs__field"><strong>{f.label}:</strong> {v}</div>;
              })}
            </div>
          )}

          {inputs.paso2General && (
            <div className="lp-inputs__section">
              <h4>Paso 2 — Section 1: General Questions</h4>
              {PASO2_GENERAL_FIELDS.map((f) => {
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

          {inputs.paso3General && (
            <div className="lp-inputs__section">
              <h4>Paso 3 — Section 1: General Questions</h4>
              {PASO3_GENERAL_FIELDS.map((f) => {
                const v = inputs.paso3General[f.key]?.response;
                if (!v) return null;
                return <div key={f.key} className="lp-inputs__field"><strong>{f.label}:</strong> {v}</div>;
              })}
            </div>
          )}

          {inputs.paso3 && (
            <div className="lp-inputs__section">
              <h4>Paso 3 — Section 2: Preliminary Lesson Plan</h4>
              {[["lessonTitle", "Title"], ["gradeLevel", "Grade"], ["subjectArea", "Subject"], ["lessonObjectives", "Objectives"]].map(([k, l]) => {
                const v = inputs.paso3[k];
                if (!v) return null;
                return <div key={k} className="lp-inputs__field"><strong>{l}:</strong> {v}</div>;
              })}
            </div>
          )}

          {inputs.paso4General && (
            <div className="lp-inputs__section">
              <h4>Paso 4 — Section 1: General Questions</h4>
              {PASO4_GENERAL_FIELDS.map((f) => {
                const v = inputs.paso4General[f.key]?.response;
                if (!v) return null;
                return <div key={f.key} className="lp-inputs__field"><strong>{f.label}:</strong> {v}</div>;
              })}
            </div>
          )}

          {inputs.paso4 && (
            <div className="lp-inputs__section">
              <h4>Paso 4 — Section 2: District Guidelines</h4>
              {[["districtStandards", "Standards"], ["curriculumRequirements", "Curriculum"], ["assessmentGuidelines", "Assessment"], ["accommodationPolicies", "Accommodations"]].map(([k, l]) => {
                const v = inputs.paso4[k];
                if (!v) return null;
                return <div key={k} className="lp-inputs__field"><strong>{l}:</strong> {v}</div>;
              })}
            </div>
          )}

          {inputs.paso5 && (
            <div className="lp-inputs__section">
              <h4>Paso 5 — Practice of Knowing Learners, Families & Communities</h4>
              {PASO5_FIELDS.map((f) => {
                const v = inputs.paso5[f.key];
                if (!v) return null;
                return <div key={f.key} className="lp-inputs__field"><strong>{f.label}:</strong> {v}</div>;
              })}
            </div>
          )}

          {inputs.paso6 && (
            <div className="lp-inputs__section">
              <h4>Paso 6 — Practice of Advocacy</h4>
              {PASO6_ADVOCACY_FIELDS.map((f) => {
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

function DashboardHome({ user, cycle, pasoStatuses, onNavigate, savedPlans }) {
  const firstName = user?.firstName || "Educator";
  const completedCount = Object.values(pasoStatuses).filter((s) => s === "completed").length;
  const progress = Math.round((completedCount / 6) * 100);

  return (
    <section className="dashboard-content">
      <div className="dashboard-welcome">
        <div className="dashboard-welcome__text">
          <h1 className="dashboard-welcome__title">
            Welcome back, <span className="accent">{firstName}.</span>
          </h1>
          <p className="dashboard-welcome__desc">
            {cycle
              ? `You are working on cycle "${cycle.name || "Current Cycle"}". ${completedCount} of 6 Pasos completed.`
              : "Start a new coaching cycle to begin your Camino."}
          </p>
        </div>
        <div className="dashboard-progress-box">
          <span className="dashboard-progress__label">TOTAL PROGRESS</span>
          <span className="dashboard-progress__value">{progress}%</span>
          <div className="dashboard-progress__bar">
            <div className="dashboard-progress__fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <section className="dashboard-section">
        <h2 className="dashboard-section__title">
          <span className="dashboard-section__icon">📖</span>
          Your Camino Pathway
        </h2>
        <div className="pathway-grid">
          {PASO_META.map((p) => {
            const status = pasoStatuses[p.num] || "pending";
            const statusLabel = status === "completed" ? "COMPLETED" : status === "draft" ? "IN PROGRESS" : "NOT STARTED";
            const cardClass =
              status === "completed" ? "completed" : status === "draft" ? "in_progress" : "locked";
            return (
              <div
                key={p.num}
                className={`pathway-card pathway-card--${cardClass} paso-clickable`}
                onClick={() => onNavigate(`paso${p.num}`)}
              >
                <div className={`pathway-card__icon pathway-card__icon--${cardClass}`}>
                  {status === "completed" ? "✓" : p.num}
                </div>
                <span className={`pathway-card__pill pathway-card__pill--${cardClass}`}>
                  {statusLabel}
                </span>
                <h3 className="pathway-card__title">{p.label}: {p.name}</h3>
                <p className="pathway-card__desc">{p.name}</p>
                <div className="pathway-card__footer">
                  <span className="pathway-card__action">
                    {status === "completed" ? "Review →" : status === "draft" ? "Continue →" : "Start →"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Lesson Plans section */}
      <section className="dashboard-section">
        <h2 className="dashboard-section__title">
          <span className="dashboard-section__icon">📝</span>
          My Lesson Plans
        </h2>
        {(!savedPlans || savedPlans.length === 0) ? (
          <div className="lp-empty">
            <p className="paso-muted">No lesson plans yet. Complete Pasos 1–5 and generate your first plan.</p>
          </div>
        ) : (
          <div className="lp-cards-grid">
            {savedPlans.slice(0, 4).map((p) => {
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
                    <span className="lp-card-preview__date">{date}</span>
                  </div>
                  <h3 className="lp-card-preview__title">{title}</h3>
                  <p className="lp-card-preview__meta">{[subject, grade].filter(Boolean).join(" · ") || "Lesson Plan"}</p>
                  <p className="lp-card-preview__snippet">
                    {(p.content || "").replace(/[#*_]/g, "").substring(0, 120)}…
                  </p>
                </div>
              );
            })}
          </div>
        )}
        {savedPlans && savedPlans.length > 0 && (
          <button className="btn btn--ghost" style={{ marginTop: 12 }} onClick={() => onNavigate("plans")}>
            View All Plans →
          </button>
        )}
      </section>
    </section>
  );
}

/* ─── Plans List View ────────────────────────────────────────────────── */

function PlansListView({ plans, onOpen, onGenerate, generating, onDelete }) {
  return (
    <div className="lp-list-view">
      <div className="lp-list-view__header">
        <h2 className="lp-list-view__title">My Lesson Plans</h2>
        {onGenerate && (
          <button className="btn btn--resume" disabled={generating} onClick={onGenerate}>
            {generating ? "Generating…" : "✨ Generate New Plan"}
          </button>
        )}
      </div>
      {(!plans || plans.length === 0) ? (
        <div className="lp-empty" style={{ marginTop: 32 }}>
          <div className="paso-empty-state__icon">📝</div>
          <p className="paso-muted">No lesson plans generated yet.</p>
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
  const [pasoStatuses, setPasoStatuses] = useState({});
  const [pasoLoading, setPasoLoading] = useState(false);
  const [pasoSaving, setPasoSaving] = useState(false);

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
        const statuses = {};
        const ps = c.pasoStatuses || c.pasos;
        if (ps) {
          for (let num = 1; num <= 6; num++) {
            const val = ps[`paso${num}`] ?? ps[num];
            if (val && typeof val === "string") statuses[num] = val === "completed" ? "completed" : val === "in_progress" ? "draft" : "pending";
            else if (val && val.status) statuses[num] = val.status === "completed" ? "completed" : val.status === "draft" ? "draft" : "pending";
          }
        }
        setPasoStatuses(statuses);
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

  /* ── Create cycle ──────────────────────────────────────────────────── */

  async function handleCreateCycle() {
    if (!cycleName.trim()) return;
    setCreatingCycle(true);
    try {
      const res = await createCycle(cycleName.trim());
      const c = res.cycle || res;
      setCycle(c);
      setPasoStatuses({});
      setCycleName("");
      setToast({ msg: "Cycle created!", type: "success" });
    } catch (err) {
      setToast({ msg: err.message, type: "error" });
    }
    setCreatingCycle(false);
  }

  /* ── Load paso data ────────────────────────────────────────────────── */

  async function loadPaso(num) {
    if (!cycle) return;
    setPasoLoading(true);
    try {
      const res = await getPaso(cycle._id || cycle.id, num);
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
  }

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
      await savePaso(cycle._id || cycle.id, num, payload);
      setPasoStatuses((prev) => ({ ...prev, [num]: status }));
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

  async function handleGenerate() {
    if (!cycle) return;
    setGenerating(true);
    try {
      const res = await generateLessonPlan(cycle._id || cycle.id);
      const plan = res.lessonPlan || res;
      setLessonPlan(plan);
      setToast({ msg: "Lesson plan generated!", type: "success" });
      setView("lessonPlan");
      try {
        const plansRes = await listLessonPlans();
        setSavedPlans(plansRes.lessonPlans || []);
      } catch { /* silent */ }
    } catch (err) {
      setToast({ msg: err.message, type: "error" });
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
    const pasoMatch = target.match(/^paso(\d)$/);
    if (pasoMatch) loadPaso(Number(pasoMatch[1]));
    const planMatch = target.match(/^plan:(.+)$/);
    if (planMatch) handleOpenPlan(planMatch[1]);
  }

  function updatePasoData(num, newData) {
    setPasoData((prev) => ({ ...prev, [num]: newData }));
  }

  const canGenerate =
    [1, 2, 3, 4, 5].every((n) => pasoStatuses[n] === "completed" || pasoStatuses[n] === "draft");

  /* ── Header title based on view ────────────────────────────────────── */

  function headerTitle() {
    if (view === "home") return "Dashboard";
    if (view === "lessonPlan") return "Lesson Plan";
    if (view === "plans") return "My Lesson Plans";
    const m = view.match(/^paso(\d)$/);
    if (m) {
      const meta = PASO_META.find((p) => p.num === Number(m[1]));
      return meta ? `${meta.label} — ${meta.name}` : "Paso";
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
      return <DashboardHome user={user} cycle={cycle} pasoStatuses={pasoStatuses} onNavigate={navigateTo} savedPlans={savedPlans} />;
    }

    if (view === "plans") {
      return (
        <section className="dashboard-content">
          <PlansListView
            plans={savedPlans}
            onOpen={(id) => navigateTo(`plan:${id}`)}
            onGenerate={canGenerate ? handleGenerate : null}
            generating={generating}
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
            onRegenerate={handleGenerate}
            generating={generating}
            onSaveContent={handleSavePlanContent}
            onFinalize={handleFinalizePlan}
            onBackToList={() => navigateTo("plans")}
            onDelete={handleDeletePlan}
          />
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

    switch (num) {
      case 1: return <section className="dashboard-content"><Paso1Form data={d} onChange={handleChange} onSave={handleSave} saving={pasoSaving} /></section>;
      case 2: return <section className="dashboard-content"><Paso2Form cycleId={cycle._id || cycle.id} data={d} onChange={handleChange} onSave={handleSave} saving={pasoSaving} /></section>;
      case 3: return <section className="dashboard-content"><Paso3Form cycleId={cycle._id || cycle.id} data={d} onChange={handleChange} onSave={handleSave} saving={pasoSaving} /></section>;
      case 4: return <section className="dashboard-content"><Paso4Form cycleId={cycle._id || cycle.id} data={d} onChange={handleChange} onSave={handleSave} saving={pasoSaving} /></section>;
      case 5: return <section className="dashboard-content"><Paso5Form data={d} onChange={handleChange} onSave={handleSave} saving={pasoSaving} /></section>;
      case 6: return <section className="dashboard-content"><Paso6Form data={d} onChange={handleChange} onSave={handleSave} saving={pasoSaving} /></section>;
      default: return null;
    }
  }

  /* ════════════════════════════════════════════════════════════════════ */

  return (
    <div className="dashboard dashboard--teacher">
      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}

      {/* ── Sidebar ──────────────────────────────────────────────────── */}
      <aside className="dashboard-sidebar">
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

          <ul className="journey-steps">
            {PASO_META.map((p) => {
              const status = pasoStatuses[p.num] || "pending";
              const statusClass = status === "completed" ? "completed" : status === "draft" ? "in_progress" : "locked";
              const isActive = view === `paso${p.num}`;
              return (
                <li
                  key={p.num}
                  className={`journey-step journey-step--${statusClass} ${isActive ? "journey-step--active" : ""}`}
                  onClick={() => navigateTo(`paso${p.num}`)}
                  style={{ cursor: "pointer" }}
                >
                  <span className="journey-step__num">{status === "completed" ? "✓" : p.num}</span>
                  <div className="journey-step__content">
                    <span className="journey-step__name">{p.name}</span>
                    <span className="journey-step__status">
                      {status === "completed" ? "Completed" : status === "draft" ? "In Progress" : "Not Started"}
                    </span>
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
              className="btn btn--resume paso-generate-btn"
              disabled={!canGenerate || generating}
              onClick={handleGenerate}
            >
              {generating ? "Generating…" : "✨ Generate Lesson Plan"}
            </button>
            {!canGenerate && (
              <p className="paso-generate-hint">Complete Pasos 1–5 to enable</p>
            )}
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
      <main className="dashboard-main">
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
