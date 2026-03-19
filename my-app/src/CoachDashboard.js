import { useState, useEffect, useCallback } from "react";
import {
  listTeachers,
  getTeacherDetail,
  createEvaluation,
  listEvaluations,
} from "./api/coach";

const VIEWS = {
  HOME: "home",
  TEACHERS: "teachers",
  TEACHER_DETAIL: "teacher_detail",
  CREATE_EVAL: "create_eval",
  MY_EVALS: "my_evals",
};

const TOOLS = [
  { name: "Teacher Efficacy Survey", icon: "☑" },
  { name: "Knowledge of Learner/Student Profile", icon: "👤" },
  { name: "AI Lesson Plan", icon: "💼" },
];

const STATS_TEMPLATE = [
  { key: "pending", label: "PENDING SURVEYS", icon: "📊", fallback: "0" },
  { key: "lessons", label: "LESSON REVIEWS", icon: "📖", fallback: "0" },
  { key: "evals", label: "EVALUATIONS DUE", icon: "📅", fallback: "0" },
  { key: "feedback", label: "FEEDBACK SENT", icon: "😊", fallback: "0%" },
];

const RECENT_ACTIVITY = [
  { teacher: "Emily Rodriguez", action: "Submitted: Math Lesson Plan (Grade 2)", tag: "REVIEW NEEDED", tagType: "action" },
  { teacher: "Marcus Thorne", action: "Completed: Efficacy Survey (Spring Cycle)", tag: "VIEW ONLY", tagType: "muted" },
  { teacher: "Dr. Linda Chen", action: "Drafted: Mid-Year Observation Report", tag: "IN PROGRESS", tagType: "action" },
];

const PASO1_FIELDS = [
  { key: "q1_positionality", label: "1. Positionality in Relation to Content" },
  { key: "q2_hiddenCurriculum", label: "2. The Hidden Curriculum" },
  { key: "q3_explicitTeaching", label: "3. Explicit Teaching for All Students" },
  { key: "q4_contentKnowledge", label: "4. Knowledge of Content" },
  { key: "q5_learningProcess", label: "5. Your Learning Process" },
  { key: "q6_studentRelationship", label: "6. Connection to Students and Culture" },
  { key: "q7_diversityAffirmation", label: "7. Acknowledging Positionality and Celebrating Diversity" },
  { key: "q8_learnerModeling", label: "8. Modeling as a Learner" },
  { key: "q9_growthMindset", label: "9. Growth Mindset and Mistakes" },
  { key: "q10_preparedness", label: "10. Preparation and Confidence" },
];

const PASO2_GENERAL_FIELDS = [
  { key: "q1_studentReadiness", label: "1. Student Readiness" },
  { key: "q2_priorKnowledge", label: "2. Prior Knowledge Assessment" },
  { key: "q3_retentionCheck", label: "3. Retention of Prior Skills" },
  { key: "q4_academicSkills", label: "4. Academic Skills" },
  { key: "q5_skillPatterns", label: "5. Patterns in Academic Skills" },
  { key: "q6_differentiation", label: "6. Differentiation Preparation" },
  { key: "q7_languageProficiency", label: "7. Language Proficiency Support" },
  { key: "q8_fundsOfKnowledge", label: "8. Funds of Knowledge" },
  { key: "q9_familyDynamics", label: "9. Parents and Family Dynamics" },
  { key: "q10_backgroundKnowledge", label: "10. Background Knowledge" },
];

const PASO3_GENERAL_FIELDS = [
  { key: "q1_humanizingPedagogy", label: "1. Humanizing Pedagogy" },
  { key: "q2_presentLearningObjective", label: "2. Presenting Learning Objective" },
  { key: "q3_barriers", label: "3. Barriers" },
  { key: "q4_accommodations", label: "4. Accommodations or Modifications" },
  { key: "q5_resourcesMaterials", label: "5. Resources or Materials" },
  { key: "q6_studentEngagement", label: "6. Student Engagement" },
  { key: "q7_classroomEnvironment", label: "7. Physical Classroom Environment" },
  { key: "q8_relateToLives", label: "8. Relating to Students' Lives" },
  { key: "q9_backgroundKnowledge", label: "9. Background Knowledge or Skills" },
];

const PASO3_FIELDS = [
  { key: "lessonTitle", label: "Lesson Title" },
  { key: "gradeLevel", label: "Grade Level" },
  { key: "subjectArea", label: "Subject Area" },
  { key: "lessonObjectives", label: "Lesson Objectives" },
  { key: "lessonStructure", label: "Lesson Structure" },
  { key: "materialsResources", label: "Materials & Resources" },
];

const PASO4_GENERAL_FIELDS = [
  { key: "q1_equitableAccess", label: "1. Equitable Access to Learning" },
  { key: "q2_supportingEnglishLearners", label: "2. Supporting English Learners" },
  { key: "q3_homeLanguageSupport", label: "3. Home Language Support" },
  { key: "q4_culturalRelevance", label: "4. Cultural Relevance" },
  { key: "q5_engagementRepresentation", label: "5. Engagement, Representation, and Expression" },
  { key: "q6_groupingForEquity", label: "6. Grouping for Equity" },
  { key: "q7_essentialQuestionRelevance", label: "7. Essential Question Relevance" },
];

const PASO4_FIELDS = [
  { key: "districtStandards", label: "District Standards" },
  { key: "curriculumRequirements", label: "Curriculum Requirements" },
  { key: "assessmentGuidelines", label: "Assessment Guidelines" },
  { key: "accommodationPolicies", label: "Accommodation Policies" },
  { key: "additionalNotes", label: "Additional Notes" },
];

const PASO5_FIELDS = [
  { key: "q1_partnerConnect", label: "1. Partner and connect with students" },
  { key: "q2_greetStudents", label: "2. Greeting students" },
  { key: "q3_comfortableParticipate", label: "3. Comfortable and eager to participate" },
  { key: "q4_teamBuilding", label: "4. Team-building activities" },
  { key: "q5_getToKnowStudents", label: "5. Get to know students' interests, culture, language, family" },
  { key: "q6_topicRelevant", label: "6. Make topic interesting and relevant" },
  { key: "q7_learningModalities", label: "7. Learning modalities" },
  { key: "q8_activitiesToLearn", label: "8. Activities to learn about students" },
];

const PASO6_ADVOCACY_FIELDS = [
  { key: "q1_advocateEquity", label: "1. Advocate for equity and social justice" },
  { key: "q2_scaffolding", label: "2. Scaffolding student learning" },
  { key: "q3_fitWithinUnit", label: "3. Fit within larger unit or learning goal" },
  { key: "q4_assessmentData", label: "4. Assessment data that informed the lesson" },
  { key: "q5_barriersChallenges", label: "5. Barriers or challenges and planning" },
  { key: "q6_showLearningWays", label: "6. Opportunities to show learning in different ways" },
];

function statusPill(status) {
  if (!status) return null;
  const colors = {
    completed: { bg: "var(--accent-light)", color: "var(--accent-hover)" },
    draft: { bg: "#fef3c7", color: "#92400e" },
    in_progress: { bg: "#dbeafe", color: "#1e40af" },
    generated: { bg: "var(--accent-light)", color: "var(--accent-hover)" },
    finalized: { bg: "var(--accent-light)", color: "var(--accent-hover)" },
  };
  const c = colors[status] || colors.draft;
  return (
    <span style={{
      display: "inline-block", fontSize: ".7rem", fontWeight: 700,
      letterSpacing: ".04em", padding: "3px 8px", borderRadius: 6,
      background: c.bg, color: c.color, textTransform: "uppercase",
    }}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

function LoadingSpinner() {
  return (
    <div style={{ textAlign: "center", padding: 48, color: "var(--muted)" }}>
      <div style={{
        width: 36, height: 36, border: "3px solid var(--border)",
        borderTopColor: "var(--accent)", borderRadius: "50%",
        animation: "spin .7s linear infinite", margin: "0 auto 12px",
      }} />
      Loading...
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function ErrorBanner({ message, onRetry }) {
  return (
    <div style={{
      background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12,
      padding: "14px 20px", color: "#991b1b", display: "flex",
      alignItems: "center", justifyContent: "space-between", marginBottom: 16,
    }}>
      <span>{message}</span>
      {onRetry && (
        <button onClick={onRetry} className="btn btn--ghost" style={{ fontSize: ".8rem", padding: "6px 12px" }}>
          Retry
        </button>
      )}
    </div>
  );
}

function DataField({ label, value }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: ".78rem", fontWeight: 700, color: "var(--muted)", letterSpacing: ".03em", marginBottom: 4 }}>
        {label}
      </div>
      <div style={{
        background: "#f8fafc", border: "1px solid var(--border)", borderRadius: 10,
        padding: "10px 14px", fontSize: ".9rem", color: "var(--text)", lineHeight: 1.55,
        whiteSpace: "pre-wrap", minHeight: 38,
      }}>
        {value || <span style={{ color: "var(--muted)", fontStyle: "italic" }}>No response</span>}
      </div>
    </div>
  );
}

/* ─────────── HOME VIEW ─────────── */

function HomeView({ firstName, teachers, onNavigate }) {
  const teacherCount = teachers.length;
  const withPlan = teachers.filter((t) => t.hasLessonPlan).length;
  const withCycle = teachers.filter((t) => t.latestCycle).length;

  const stats = [
    { ...STATS_TEMPLATE[0], value: String(teacherCount), sub: `${teacherCount} teacher(s) assigned` },
    { ...STATS_TEMPLATE[1], value: String(withPlan).padStart(2, "0"), sub: withPlan ? `${withPlan} ready for review` : "None yet" },
    { ...STATS_TEMPLATE[2], value: String(withCycle), sub: withCycle ? "Active cycles" : "No active cycles" },
    { ...STATS_TEMPLATE[3], value: teacherCount ? `${Math.round((withCycle / teacherCount) * 100)}%` : "0%", sub: "Cycle completion rate" },
  ];

  return (
    <>
      <div className="coach-welcome">
        <h1 className="coach-welcome__title">Welcome back, Coach {firstName}!</h1>
        <p className="coach-welcome__desc">
          Your expertise is the bridge between pedagogical theory and classroom success.
          {teacherCount > 0 && (
            <> You have <strong className="accent">{teacherCount} teacher(s)</strong> to support this cycle.</>
          )}
        </p>
        <div className="coach-welcome__actions">
          <button type="button" className="btn btn--resume" onClick={() => onNavigate(VIEWS.CREATE_EVAL)}>
            + New Evaluation
          </button>
          <button type="button" className="btn btn--ghost" onClick={() => onNavigate(VIEWS.TEACHERS)}>
            View Teachers
          </button>
        </div>
      </div>

      <div className="coach-stats">
        {stats.map((s, i) => (
          <div key={i} className="coach-stat-card">
            <span className="coach-stat__label">{s.label}</span>
            <span className="coach-stat__value">{s.value}</span>
            <span className="coach-stat__sub">{s.sub}</span>
            <span className="coach-stat__icon">{s.icon}</span>
          </div>
        ))}
      </div>

      <div className="coach-grid">
        <div className="coach-activity">
          <div className="coach-activity__header">
            <h2 className="coach-activity__title">Recent Teacher Activity</h2>
            <button type="button" className="dashboard-link" style={{ background: "none", border: "none", cursor: "pointer" }} onClick={() => onNavigate(VIEWS.TEACHERS)}>
              View All Teachers
            </button>
          </div>
          <ul className="coach-activity__list">
            {RECENT_ACTIVITY.map((a, i) => (
              <li key={i} className="coach-activity__item">
                <div className="coach-activity__avatar">{a.teacher.charAt(0)}</div>
                <div className="coach-activity__content">
                  <span className="coach-activity__teacher">{a.teacher}</span>
                  <span className="coach-activity__action">{a.action}</span>
                </div>
                <span className={`coach-activity__tag coach-activity__tag--${a.tagType}`}>{a.tag}</span>
                <span className="coach-activity__arrow">→</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="coach-side-cards">
          <div className="coach-tip-card">
            <span className="coach-tip__icon">💡</span>
            <h3 className="coach-tip__title">Coaching Tip</h3>
            <p className="coach-tip__text">
              &ldquo;Effective feedback is descriptive rather than evaluative.
              Focus on specific behaviors observed during lesson delivery to foster growth mindset.&rdquo;
            </p>
          </div>
          <div className="coach-quick-access">
            <h3 className="coach-quick-access__title">Quick Access</h3>
            <button type="button" className="coach-quick-item" style={{ width: "100%", background: "none", border: "none", borderBottom: "1px solid var(--border)", cursor: "pointer", textAlign: "left" }} onClick={() => onNavigate(VIEWS.MY_EVALS)}>
              <span className="coach-quick-item__icon">📋</span>
              <div className="coach-quick-item__content">
                <span className="coach-quick-item__title">My Evaluations</span>
                <span className="coach-quick-item__type">View all submitted</span>
              </div>
            </button>
            <button type="button" className="coach-quick-item" style={{ width: "100%", background: "none", border: "none", cursor: "pointer", textAlign: "left" }} onClick={() => onNavigate(VIEWS.CREATE_EVAL)}>
              <span className="coach-quick-item__icon">✏️</span>
              <div className="coach-quick-item__content">
                <span className="coach-quick-item__title">Create Evaluation</span>
                <span className="coach-quick-item__type">New assessment form</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─────────── TEACHER LIST VIEW ─────────── */

function TeacherListView({ teachers, loading, error, onRetry, onSelectTeacher }) {
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorBanner message={error} onRetry={onRetry} />;

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: "0 0 6px", fontSize: "1.25rem", fontWeight: 700, color: "var(--text)" }}>
          All Teachers
        </h2>
        <p style={{ margin: 0, fontSize: ".9rem", color: "var(--muted)" }}>
          {teachers.length} teacher(s) in your roster. Click a teacher to view their full profile and Paso data.
        </p>
      </div>

      {teachers.length === 0 ? (
        <div style={{ textAlign: "center", padding: 48, color: "var(--muted)" }}>
          No teachers found. Teachers will appear here once they are registered.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {teachers.map(({ teacher, latestCycle, hasLessonPlan }) => (
            <button
              key={teacher._id}
              type="button"
              onClick={() => onSelectTeacher(teacher._id)}
              style={{
                display: "flex", alignItems: "center", gap: 16,
                padding: "16px 20px", background: "var(--panel)",
                border: "1px solid var(--border)", borderRadius: 14,
                boxShadow: "var(--shadow)", cursor: "pointer",
                textAlign: "left", width: "100%",
                transition: "border-color .15s ease, box-shadow .15s ease",
              }}
              onMouseOver={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; }}
              onMouseOut={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
            >
              <div className="dashboard-avatar dashboard-avatar--coach" style={{ background: "#f97316", fontSize: ".95rem" }}>
                {(teacher.firstName || "T").charAt(0)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: ".95rem", color: "var(--text)" }}>
                  {teacher.firstName} {teacher.lastName}
                </div>
                <div style={{ fontSize: ".82rem", color: "var(--muted)" }}>{teacher.email}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                {latestCycle ? statusPill(latestCycle.status) : statusPill("no cycle")}
                {hasLessonPlan && (
                  <span style={{
                    fontSize: ".7rem", fontWeight: 700, padding: "3px 8px",
                    borderRadius: 6, background: "var(--accent-light)",
                    color: "var(--accent-hover)",
                  }}>
                    HAS LESSON PLAN
                  </span>
                )}
              </div>
              <span style={{ fontSize: "1.1rem", color: "var(--muted)" }}>→</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────── TEACHER DETAIL VIEW ─────────── */

function TeacherDetailView({ teacherId, onBack, onStartEval }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getTeacherDetail(teacherId);
      setData(res);
    } catch (err) {
      setError(err.message || "Failed to load teacher details.");
    } finally {
      setLoading(false);
    }
  }, [teacherId]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorBanner message={error} onRetry={load} />;
  if (!data) return null;

  const { teacher, cycle, paso1, paso2General, paso2, paso3General, paso3, paso4General, paso4, paso5, paso6, students, lessonPlan } = data;

  return (
    <div>
      <button type="button" onClick={onBack} className="btn btn--ghost" style={{ marginBottom: 16, fontSize: ".85rem", padding: "6px 14px" }}>
        ← Back to Teachers
      </button>

      <div style={{
        background: "var(--panel)", border: "1px solid var(--border)",
        borderRadius: 14, padding: 24, marginBottom: 20, boxShadow: "var(--shadow)",
        display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
      }}>
        <div className="dashboard-avatar dashboard-avatar--coach" style={{ width: 52, height: 52, fontSize: "1.2rem", background: "#f97316" }}>
          {(teacher.firstName || "T").charAt(0)}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: "0 0 2px", fontSize: "1.3rem" }}>{teacher.firstName} {teacher.lastName}</h2>
          <span style={{ color: "var(--muted)", fontSize: ".9rem" }}>{teacher.email}</span>
        </div>
        {cycle && statusPill(cycle.status)}
        {lessonPlan && (
          <button type="button" className="btn btn--resume" style={{ fontSize: ".82rem", padding: "8px 14px" }}
            onClick={() => onStartEval(teacher._id, lessonPlan._id)}>
            + Evaluate
          </button>
        )}
      </div>

      {!cycle && (
        <div style={{ textAlign: "center", padding: 48, color: "var(--muted)" }}>
          This teacher has not started any coaching cycle yet.
        </div>
      )}

      {cycle && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* PASO 1 */}
          <section className="coach-activity" style={{ padding: 20 }}>
            <h3 style={{ margin: "0 0 4px", fontSize: "1.05rem", fontWeight: 700, color: "var(--accent-hover)" }}>
              Paso 1 — Teacher Efficacy Survey
            </h3>
            <div style={{ fontSize: ".8rem", color: "var(--muted)", marginBottom: 14 }}>
              {paso1 ? <>{statusPill(paso1.status)} <span style={{ marginLeft: 6 }}>Submitted {paso1.updatedAt ? new Date(paso1.updatedAt).toLocaleDateString() : ""}</span></> : "Not submitted"}
            </div>
            {paso1 ? (
              PASO1_FIELDS.map((f) => (
                <DataField key={f.key} label={f.label} value={paso1[f.key]?.response} />
              ))
            ) : (
              <p style={{ color: "var(--muted)", fontStyle: "italic" }}>No Paso 1 data available.</p>
            )}
          </section>

          {/* PASO 2 — Section 1: General Questions */}
          <section className="coach-activity" style={{ padding: 20 }}>
            <h3 style={{ margin: "0 0 4px", fontSize: "1.05rem", fontWeight: 700, color: "var(--accent-hover)" }}>
              Paso 2 — Section 1: General Questions
            </h3>
            <div style={{ fontSize: ".8rem", color: "var(--muted)", marginBottom: 14 }}>
              {paso2General ? <>{statusPill(paso2General.status)} <span style={{ marginLeft: 6 }}>Submitted {paso2General.updatedAt ? new Date(paso2General.updatedAt).toLocaleDateString() : ""}</span></> : "Not submitted"}
            </div>
            {paso2General ? (
              PASO2_GENERAL_FIELDS.map((f) => (
                <DataField key={f.key} label={f.label} value={paso2General[f.key]?.response} />
              ))
            ) : (
              <p style={{ color: "var(--muted)", fontStyle: "italic" }}>No general questions data available.</p>
            )}
          </section>

          {/* PASO 2 — Section 2: Student Profiles */}
          <section className="coach-activity" style={{ padding: 20 }}>
            <h3 style={{ margin: "0 0 4px", fontSize: "1.05rem", fontWeight: 700, color: "var(--accent-hover)" }}>
              Paso 2 — Section 2: Student Profiles
            </h3>
            <div style={{ fontSize: ".8rem", color: "var(--muted)", marginBottom: 14 }}>
              {paso2 && paso2.length > 0 ? `${paso2.length} student profile(s)` : "No student profiles submitted"}
            </div>
            {paso2 && paso2.length > 0 ? (
              paso2.map((p, idx) => {
                const student = students?.find((s) => s._id === p.studentId) || null;
                return (
                  <div key={p._id || idx} style={{
                    background: "#f8fafc", border: "1px solid var(--border)",
                    borderRadius: 12, padding: 16, marginBottom: 12,
                  }}>
                    <div style={{ fontWeight: 700, fontSize: ".9rem", marginBottom: 10, color: "var(--text)" }}>
                      Student: {student ? `${student.firstName} ${student.lastName}` : `Profile ${idx + 1}`}
                      <span style={{ marginLeft: 8 }}>{statusPill(p.status)}</span>
                    </div>
                    <DataField label="Knowledge of Other" value={p.knowledgeOfOther} />
                    <DataField label="Learning Goals" value={p.learningGoals} />
                    <DataField label="Support Needs" value={p.supportNeeds} />
                    <DataField label="Assessment" value={p.assessment} />
                    <DataField label="Final Review" value={p.finalReview} />
                  </div>
                );
              })
            ) : (
              <p style={{ color: "var(--muted)", fontStyle: "italic" }}>No student profile data available.</p>
            )}
          </section>

          {/* PASO 3 — Section 1: General Questions */}
          <section className="coach-activity" style={{ padding: 20 }}>
            <h3 style={{ margin: "0 0 4px", fontSize: "1.05rem", fontWeight: 700, color: "var(--accent-hover)" }}>
              Paso 3 — Section 1: General Questions
            </h3>
            <div style={{ fontSize: ".8rem", color: "var(--muted)", marginBottom: 14 }}>
              {paso3General ? <>{statusPill(paso3General.status)} <span style={{ marginLeft: 6 }}>Submitted {paso3General.updatedAt ? new Date(paso3General.updatedAt).toLocaleDateString() : ""}</span></> : "Not submitted"}
            </div>
            {paso3General ? (
              PASO3_GENERAL_FIELDS.map((f) => (
                <DataField key={f.key} label={f.label} value={paso3General[f.key]?.response} />
              ))
            ) : (
              <p style={{ color: "var(--muted)", fontStyle: "italic" }}>No general questions data available.</p>
            )}
          </section>

          {/* PASO 3 — Section 2: Preliminary Lesson Plan */}
          <section className="coach-activity" style={{ padding: 20 }}>
            <h3 style={{ margin: "0 0 4px", fontSize: "1.05rem", fontWeight: 700, color: "var(--accent-hover)" }}>
              Paso 3 — Section 2: Preliminary Lesson Plan
            </h3>
            <div style={{ fontSize: ".8rem", color: "var(--muted)", marginBottom: 14 }}>
              {paso3 ? <>{statusPill(paso3.status)} <span style={{ marginLeft: 6 }}>Submitted {paso3.updatedAt ? new Date(paso3.updatedAt).toLocaleDateString() : ""}</span></> : "Not submitted"}
            </div>
            {paso3 ? (
              PASO3_FIELDS.map((f) => (
                <DataField key={f.key} label={f.label} value={paso3[f.key]} />
              ))
            ) : (
              <p style={{ color: "var(--muted)", fontStyle: "italic" }}>No Paso 3 preliminary plan data available.</p>
            )}
          </section>

          {/* PASO 4 — Section 1: General Questions */}
          <section className="coach-activity" style={{ padding: 20 }}>
            <h3 style={{ margin: "0 0 4px", fontSize: "1.05rem", fontWeight: 700, color: "var(--accent-hover)" }}>
              Paso 4 — Section 1: General Questions
            </h3>
            <div style={{ fontSize: ".8rem", color: "var(--muted)", marginBottom: 14 }}>
              {paso4General ? <>{statusPill(paso4General.status)} <span style={{ marginLeft: 6 }}>Submitted {paso4General.updatedAt ? new Date(paso4General.updatedAt).toLocaleDateString() : ""}</span></> : "Not submitted"}
            </div>
            {paso4General ? (
              PASO4_GENERAL_FIELDS.map((f) => (
                <DataField key={f.key} label={f.label} value={paso4General[f.key]?.response} />
              ))
            ) : (
              <p style={{ color: "var(--muted)", fontStyle: "italic" }}>No general questions data available.</p>
            )}
          </section>

          {/* PASO 4 — Section 2: District Guidelines */}
          <section className="coach-activity" style={{ padding: 20 }}>
            <h3 style={{ margin: "0 0 4px", fontSize: "1.05rem", fontWeight: 700, color: "var(--accent-hover)" }}>
              Paso 4 — Section 2: District Guidelines
            </h3>
            <div style={{ fontSize: ".8rem", color: "var(--muted)", marginBottom: 14 }}>
              {paso4 ? <>{statusPill(paso4.status)} <span style={{ marginLeft: 6 }}>Submitted {paso4.updatedAt ? new Date(paso4.updatedAt).toLocaleDateString() : ""}</span></> : "Not submitted"}
            </div>
            {paso4 ? (
              PASO4_FIELDS.map((f) => (
                <DataField key={f.key} label={f.label} value={paso4[f.key]} />
              ))
            ) : (
              <p style={{ color: "var(--muted)", fontStyle: "italic" }}>No Paso 4 district guidelines data available.</p>
            )}
          </section>

          {/* PASO 5 — Practice of Knowing Learners, Families & Communities */}
          <section className="coach-activity" style={{ padding: 20 }}>
            <h3 style={{ margin: "0 0 4px", fontSize: "1.05rem", fontWeight: 700, color: "var(--accent-hover)" }}>
              Paso 5 — Practice of Knowing Learners, Families & Communities
            </h3>
            <div style={{ fontSize: ".8rem", color: "var(--muted)", marginBottom: 14 }}>
              {paso5 ? <>{statusPill(paso5.status)} <span style={{ marginLeft: 6 }}>Submitted {paso5.updatedAt ? new Date(paso5.updatedAt).toLocaleDateString() : ""}</span></> : "Not submitted"}
            </div>
            {paso5 ? (
              PASO5_FIELDS.map((f) => (
                <DataField key={f.key} label={f.label} value={paso5[f.key]} />
              ))
            ) : (
              <p style={{ color: "var(--muted)", fontStyle: "italic" }}>No Paso 5 data available.</p>
            )}
          </section>

          {/* PASO 6 — Practice of Advocacy */}
          <section className="coach-activity" style={{ padding: 20 }}>
            <h3 style={{ margin: "0 0 4px", fontSize: "1.05rem", fontWeight: 700, color: "var(--accent-hover)" }}>
              Paso 6 — Practice of Advocacy
            </h3>
            <div style={{ fontSize: ".8rem", color: "var(--muted)", marginBottom: 14 }}>
              {paso6 ? <>{statusPill(paso6.status)} <span style={{ marginLeft: 6 }}>Submitted {paso6.updatedAt ? new Date(paso6.updatedAt).toLocaleDateString() : ""}</span></> : "Not submitted"}
            </div>
            {paso6 ? (
              PASO6_ADVOCACY_FIELDS.map((f) => (
                <DataField key={f.key} label={f.label} value={paso6[f.key]} />
              ))
            ) : (
              <p style={{ color: "var(--muted)", fontStyle: "italic" }}>No Paso 6 data available.</p>
            )}
          </section>

          {/* STUDENTS */}
          {students && students.length > 0 && (
            <section className="coach-activity" style={{ padding: 20 }}>
              <h3 style={{ margin: "0 0 14px", fontSize: "1.05rem", fontWeight: 700, color: "var(--accent-hover)" }}>
                Student Roster ({students.length})
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
                {students.map((s) => (
                  <div key={s._id} style={{
                    background: "#f8fafc", border: "1px solid var(--border)",
                    borderRadius: 12, padding: 14,
                  }}>
                    <div style={{ fontWeight: 700, fontSize: ".9rem", marginBottom: 4 }}>
                      {s.firstName} {s.lastName}
                    </div>
                    {s.grade && <div style={{ fontSize: ".82rem", color: "var(--muted)" }}>Grade: {s.grade}</div>}
                    {s.demographics?.homeLanguage && (
                      <div style={{ fontSize: ".82rem", color: "var(--muted)" }}>Language: {s.demographics.homeLanguage}</div>
                    )}
                    {s.demographics?.ethnicity && (
                      <div style={{ fontSize: ".82rem", color: "var(--muted)" }}>Ethnicity: {s.demographics.ethnicity}</div>
                    )}
                    {s.demographics?.elpLevel && (
                      <div style={{ fontSize: ".82rem", color: "var(--muted)" }}>ELP Level: {s.demographics.elpLevel}</div>
                    )}
                    {s.demographics?.specialPrograms && (
                      <div style={{ fontSize: ".82rem", color: "var(--muted)" }}>Programs: {s.demographics.specialPrograms}</div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* AI LESSON PLAN */}
          {lessonPlan && (
            <section className="coach-activity" style={{ padding: 20 }}>
              <h3 style={{ margin: "0 0 4px", fontSize: "1.05rem", fontWeight: 700, color: "var(--accent-hover)" }}>
                AI-Generated Lesson Plan
              </h3>
              <div style={{ fontSize: ".8rem", color: "var(--muted)", marginBottom: 14 }}>
                {statusPill(lessonPlan.status)}
                <span style={{ marginLeft: 6 }}>Generated {lessonPlan.updatedAt ? new Date(lessonPlan.updatedAt).toLocaleDateString() : ""}</span>
              </div>
              <div style={{
                background: "#f8fafc", border: "1px solid var(--border)",
                borderRadius: 12, padding: 18, whiteSpace: "pre-wrap",
                fontSize: ".9rem", lineHeight: 1.65, color: "var(--text)",
                maxHeight: 500, overflowY: "auto",
              }}>
                {lessonPlan.content || <span style={{ color: "var(--muted)", fontStyle: "italic" }}>No content generated yet.</span>}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

/* ─────────── CREATE EVALUATION VIEW ─────────── */

function CreateEvalView({ teachers, prefillTeacherId, prefillLessonPlanId, onSuccess }) {
  const [teacherId, setTeacherId] = useState(prefillTeacherId || "");
  const [lessonPlanId, setLessonPlanId] = useState(prefillLessonPlanId || "");
  const [form, setForm] = useState({ strengths: "", areasForImprovement: "", suggestions: "", additionalNotes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const teachersWithPlans = teachers.filter((t) => t.hasLessonPlan);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!teacherId || !lessonPlanId) {
      setError("Please select a teacher with a lesson plan.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await createEvaluation({ teacherId, lessonPlanId, ...form });
      setSuccess(true);
      setForm({ strengths: "", areasForImprovement: "", suggestions: "", additionalNotes: "" });
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || "Failed to create evaluation.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div style={{ textAlign: "center", padding: 48 }}>
        <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>✅</div>
        <h2 style={{ margin: "0 0 8px", color: "var(--accent-hover)" }}>Evaluation Submitted!</h2>
        <p style={{ color: "var(--muted)", marginBottom: 20 }}>Your evaluation has been saved successfully.</p>
        <button type="button" className="btn btn--resume" onClick={() => setSuccess(false)}>
          Create Another
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 680 }}>
      <h2 style={{ margin: "0 0 6px", fontSize: "1.25rem", fontWeight: 700, color: "var(--text)" }}>
        Create Evaluation
      </h2>
      <p style={{ margin: "0 0 20px", fontSize: ".9rem", color: "var(--muted)" }}>
        Provide coaching feedback for a teacher's lesson plan.
      </p>

      {error && <ErrorBanner message={error} />}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="auth-field">
          <label>Teacher</label>
          <select
            className="auth-input"
            value={teacherId}
            onChange={(e) => {
              setTeacherId(e.target.value);
              const match = teachersWithPlans.find((t) => t.teacher._id === e.target.value);
              setLessonPlanId(match?.latestCycle?._id || "");
            }}
          >
            <option value="">— Select a teacher —</option>
            {teachersWithPlans.map(({ teacher }) => (
              <option key={teacher._id} value={teacher._id}>
                {teacher.firstName} {teacher.lastName} ({teacher.email})
              </option>
            ))}
          </select>
          {teachers.length > 0 && teachersWithPlans.length === 0 && (
            <span style={{ fontSize: ".8rem", color: "#92400e" }}>
              No teachers have a lesson plan yet.
            </span>
          )}
        </div>

        <div className="auth-field">
          <label>Strengths</label>
          <textarea
            name="strengths"
            className="auth-input"
            rows={3}
            placeholder="What did the teacher do well?"
            value={form.strengths}
            onChange={handleChange}
            style={{ resize: "vertical" }}
          />
        </div>

        <div className="auth-field">
          <label>Areas for Improvement</label>
          <textarea
            name="areasForImprovement"
            className="auth-input"
            rows={3}
            placeholder="Where can the teacher improve?"
            value={form.areasForImprovement}
            onChange={handleChange}
            style={{ resize: "vertical" }}
          />
        </div>

        <div className="auth-field">
          <label>Suggestions</label>
          <textarea
            name="suggestions"
            className="auth-input"
            rows={3}
            placeholder="Specific suggestions or strategies..."
            value={form.suggestions}
            onChange={handleChange}
            style={{ resize: "vertical" }}
          />
        </div>

        <div className="auth-field">
          <label>Additional Notes</label>
          <textarea
            name="additionalNotes"
            className="auth-input"
            rows={2}
            placeholder="Any other comments..."
            value={form.additionalNotes}
            onChange={handleChange}
            style={{ resize: "vertical" }}
          />
        </div>

        <button type="submit" className="btn btn--resume" disabled={submitting} style={{ alignSelf: "flex-start", marginTop: 4 }}>
          {submitting ? "Submitting..." : "Submit Evaluation"}
        </button>
      </form>
    </div>
  );
}

/* ─────────── MY EVALUATIONS VIEW ─────────── */

function MyEvalsView() {
  const [evals, setEvals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await listEvaluations();
      setEvals(res.evaluations || []);
    } catch (err) {
      setError(err.message || "Failed to load evaluations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorBanner message={error} onRetry={load} />;

  return (
    <div>
      <h2 style={{ margin: "0 0 6px", fontSize: "1.25rem", fontWeight: 700, color: "var(--text)" }}>
        My Evaluations
      </h2>
      <p style={{ margin: "0 0 20px", fontSize: ".9rem", color: "var(--muted)" }}>
        {evals.length} evaluation(s) submitted.
      </p>

      {evals.length === 0 ? (
        <div style={{ textAlign: "center", padding: 48, color: "var(--muted)" }}>
          You haven't created any evaluations yet.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {evals.map((ev) => {
            const tName = ev.teacherId
              ? `${ev.teacherId.firstName || ""} ${ev.teacherId.lastName || ""}`.trim()
              : "Unknown Teacher";
            return (
              <div key={ev._id} className="coach-activity" style={{ padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: ".95rem" }}>{tName}</span>
                    {ev.teacherId?.email && (
                      <span style={{ color: "var(--muted)", fontSize: ".82rem", marginLeft: 8 }}>{ev.teacherId.email}</span>
                    )}
                  </div>
                  <span style={{ fontSize: ".8rem", color: "var(--muted)" }}>
                    {ev.createdAt ? new Date(ev.createdAt).toLocaleDateString() : ""}
                  </span>
                </div>
                {ev.strengths && <DataField label="Strengths" value={ev.strengths} />}
                {ev.areasForImprovement && <DataField label="Areas for Improvement" value={ev.areasForImprovement} />}
                {ev.suggestions && <DataField label="Suggestions" value={ev.suggestions} />}
                {ev.additionalNotes && <DataField label="Additional Notes" value={ev.additionalNotes} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─────────── MAIN DASHBOARD ─────────── */

function CoachDashboard({ user, onLogout }) {
  const firstName = user?.firstName || "Coach";
  const [view, setView] = useState(VIEWS.HOME);
  const [selectedTeacherId, setSelectedTeacherId] = useState(null);
  const [prefillTeacherId, setPrefillTeacherId] = useState("");
  const [prefillLessonPlanId, setPrefillLessonPlanId] = useState("");

  const [teachers, setTeachers] = useState([]);
  const [teachersLoading, setTeachersLoading] = useState(true);
  const [teachersError, setTeachersError] = useState("");

  const loadTeachers = useCallback(async () => {
    setTeachersLoading(true);
    setTeachersError("");
    try {
      const res = await listTeachers();
      setTeachers(res.teachers || []);
    } catch (err) {
      setTeachersError(err.message || "Failed to load teachers.");
    } finally {
      setTeachersLoading(false);
    }
  }, []);

  useEffect(() => { loadTeachers(); }, [loadTeachers]);

  function navigate(v) {
    setView(v);
    if (v !== VIEWS.TEACHER_DETAIL) setSelectedTeacherId(null);
    if (v !== VIEWS.CREATE_EVAL) {
      setPrefillTeacherId("");
      setPrefillLessonPlanId("");
    }
  }

  function selectTeacher(id) {
    setSelectedTeacherId(id);
    setView(VIEWS.TEACHER_DETAIL);
  }

  function startEval(teacherId, lessonPlanId) {
    setPrefillTeacherId(teacherId);
    setPrefillLessonPlanId(lessonPlanId);
    setView(VIEWS.CREATE_EVAL);
  }

  const breadcrumbs = {
    [VIEWS.HOME]: "Overview / Home",
    [VIEWS.TEACHERS]: "Teachers / All",
    [VIEWS.TEACHER_DETAIL]: "Teachers / Detail",
    [VIEWS.CREATE_EVAL]: "Evaluations / Create",
    [VIEWS.MY_EVALS]: "Evaluations / My Evaluations",
  };

  const sidebarItems = [
    { view: VIEWS.HOME, label: "Overview", icon: "🏠" },
    { view: VIEWS.TEACHERS, label: "Teachers", icon: "👥" },
    { view: VIEWS.CREATE_EVAL, label: "Create Evaluation", icon: "✏️" },
    { view: VIEWS.MY_EVALS, label: "My Evaluations", icon: "📋" },
  ];

  return (
    <div className="dashboard dashboard--coach">
      {/* ── SIDEBAR ── */}
      <aside className="dashboard-sidebar dashboard-sidebar--coach">
        <div className="dashboard-sidebar__brand">
          <div className="dashboard-sidebar__logo dashboard-sidebar__logo--coach">🎓</div>
          <div className="dashboard-sidebar__brand-text">
            <span className="dashboard-sidebar__title">Coaching Camino</span>
            <span className="dashboard-sidebar__subtitle">K-5 EDUCATION</span>
          </div>
        </div>

        <nav className="dashboard-sidebar__nav">
          <h3 className="dashboard-sidebar__section-title">TOOLS & INSIGHTS</h3>
          <ul className="coach-tools">
            {TOOLS.map((t, i) => (
              <li key={i} className="coach-tool">
                <span className="coach-tool__icon">{t.icon}</span>
                <span className="coach-tool__name">{t.name}</span>
                <span className="coach-tool__eye">👁</span>
              </li>
            ))}
          </ul>

          <h3 className="dashboard-sidebar__section-title" style={{ marginTop: 16 }}>CORE WORKFLOW</h3>
          <ul className="coach-tools">
            {sidebarItems.map((item) => (
              <li
                key={item.view}
                className={`coach-tool${view === item.view ? " coach-tool--active" : ""}`}
                onClick={() => navigate(item.view)}
                style={{ cursor: "pointer" }}
              >
                <span className="coach-tool__icon">{item.icon}</span>
                <span className="coach-tool__name">{item.label}</span>
              </li>
            ))}
          </ul>
        </nav>

        <div className="dashboard-sidebar__profile">
          <div className="dashboard-avatar dashboard-avatar--coach">
            {firstName.charAt(0)}
          </div>
          <div className="dashboard-profile__info">
            <span className="dashboard-profile__name">
              {user?.firstName} {user?.lastName}
            </span>
            <span className="dashboard-profile__role">Lead Instructional Coach</span>
            <button type="button" className="dashboard-profile__link" onClick={onLogout}>
              Log out
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="dashboard-main">
        <header className="dashboard-header dashboard-header--coach">
          <div className="dashboard-header__breadcrumb">
            <h1 className="dashboard-header__title">Coach Dashboard</h1>
            <span className="dashboard-header__crumb">{breadcrumbs[view]}</span>
          </div>
          <div className="dashboard-header__actions">
            <div className="dashboard-header__search">
              <span className="dashboard-header__search-icon">🔍</span>
              <input type="search" placeholder="Search teachers..." className="dashboard-header__input" />
            </div>
            <button type="button" className="dashboard-header__icon-btn" aria-label="Notifications">🔔</button>
            <button type="button" className="btn btn--ghost btn--logout" onClick={onLogout}>Log out</button>
          </div>
        </header>

        <section className="dashboard-content dashboard-content--coach">
          {view === VIEWS.HOME && (
            <HomeView
              firstName={firstName}
              teachers={teachers}
              onNavigate={navigate}
            />
          )}

          {view === VIEWS.TEACHERS && (
            <TeacherListView
              teachers={teachers}
              loading={teachersLoading}
              error={teachersError}
              onRetry={loadTeachers}
              onSelectTeacher={selectTeacher}
            />
          )}

          {view === VIEWS.TEACHER_DETAIL && selectedTeacherId && (
            <TeacherDetailView
              teacherId={selectedTeacherId}
              onBack={() => navigate(VIEWS.TEACHERS)}
              onStartEval={startEval}
            />
          )}

          {view === VIEWS.CREATE_EVAL && (
            <CreateEvalView
              teachers={teachers}
              prefillTeacherId={prefillTeacherId}
              prefillLessonPlanId={prefillLessonPlanId}
              onSuccess={() => {}}
            />
          )}

          {view === VIEWS.MY_EVALS && <MyEvalsView />}
        </section>
      </main>
    </div>
  );
}

export default CoachDashboard;
