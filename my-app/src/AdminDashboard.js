import { useState, useEffect, useCallback } from "react";
import {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  listAllCycles,
  getCycleDetail,
  listAllLessonPlans,
  listAllEvaluations,
} from "./api/admin";

const TABS = [
  { key: "overview", label: "Overview", icon: "📊" },
  { key: "users", label: "Users", icon: "👥" },
  { key: "cycles", label: "Cycles", icon: "🔄" },
  { key: "lessons", label: "Lesson Plans", icon: "📄" },
  { key: "evaluations", label: "Evaluations", icon: "📋" },
];

const EMPTY_USER_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  role: "teacher",
};

const PASO_LABELS = {
  paso1: "Paso 1 — Knowledge of Self",
  paso2: "Paso 2 — Student Profile",
  paso3: "Paso 3 — Preliminary Plan",
  paso4: "Paso 4 — District Guidelines",
  paso5: "Paso 5 — Partner with Families",
  paso6: "Paso 6 — Practice of Advocacy",
};

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function StatusBadge({ status }) {
  const map = {
    completed: { cls: "adm-badge--completed", text: "Completed" },
    in_progress: { cls: "adm-badge--progress", text: "In Progress" },
    generated: { cls: "adm-badge--completed", text: "Generated" },
    finalized: { cls: "adm-badge--finalized", text: "Finalized" },
    draft: { cls: "adm-badge--draft", text: "Draft" },
    pending: { cls: "adm-badge--pending", text: "Pending" },
    not_started: { cls: "adm-badge--locked", text: "Not Started" },
  };
  const m = map[status] || { cls: "adm-badge--locked", text: status || "—" };
  return <span className={`adm-badge ${m.cls}`}>{m.text}</span>;
}

/* ─── Confirm Dialog ─── */
function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="adm-overlay" onClick={onCancel}>
      <div className="adm-modal adm-modal--sm" onClick={(e) => e.stopPropagation()}>
        <p className="adm-confirm-msg">{message}</p>
        <div className="adm-modal__actions">
          <button type="button" className="btn btn--ghost" onClick={onCancel}>Cancel</button>
          <button type="button" className="btn adm-btn--danger" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

/* ─── User Form Modal ─── */
function UserFormModal({ initial, onSave, onClose, saving }) {
  const isEdit = !!initial?._id;
  const [form, setForm] = useState(
    initial
      ? { firstName: initial.firstName || "", lastName: initial.lastName || "", email: initial.email || "", password: "", role: initial.role || "teacher" }
      : { ...EMPTY_USER_FORM }
  );

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  function handleSubmit(e) {
    e.preventDefault();
    const payload = { ...form };
    if (isEdit && !payload.password) delete payload.password;
    onSave(payload);
  }

  return (
    <div className="adm-overlay" onClick={onClose}>
      <div className="adm-modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="adm-modal__title">{isEdit ? "Edit User" : "Create User"}</h3>
        <form onSubmit={handleSubmit}>
          <div className="adm-form-row">
            <div className="adm-field">
              <label className="adm-label">First Name</label>
              <input className="adm-input" value={form.firstName} onChange={set("firstName")} required />
            </div>
            <div className="adm-field">
              <label className="adm-label">Last Name</label>
              <input className="adm-input" value={form.lastName} onChange={set("lastName")} required />
            </div>
          </div>
          <div className="adm-field">
            <label className="adm-label">Email</label>
            <input className="adm-input" type="email" value={form.email} onChange={set("email")} required />
          </div>
          <div className="adm-field">
            <label className="adm-label">{isEdit ? "New Password (blank = keep)" : "Password"}</label>
            <input className="adm-input" type="password" value={form.password} onChange={set("password")} {...(isEdit ? {} : { required: true, minLength: 6 })} />
          </div>
          <div className="adm-field">
            <label className="adm-label">Role</label>
            <div className="adm-role-toggle">
              {["teacher", "coach", "admin"].map((r) => (
                <button key={r} type="button" className={`adm-role-pill${form.role === r ? " adm-role-pill--active" : ""}`} onClick={() => setForm((p) => ({ ...p, role: r }))}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="adm-modal__actions">
            <button type="button" className="btn btn--ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn--resume" disabled={saving}>{saving ? "Saving…" : isEdit ? "Update" : "Create"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Overview ─── */
function OverviewTab({ users, cycles, plans, evals }) {
  const teachers = users.filter((u) => u.role === "teacher");
  const coaches = users.filter((u) => u.role === "coach");
  const admins = users.filter((u) => u.role === "admin");
  const completedCycles = cycles.filter((c) => c.status === "completed");
  const finalizedPlans = plans.filter((p) => p.status === "finalized");

  const stats = [
    { label: "Total Users", value: users.length, icon: "👥", color: "#68d391" },
    { label: "Teachers", value: teachers.length, icon: "🎓", color: "#63b3ed" },
    { label: "Coaches", value: coaches.length, icon: "🏅", color: "#ed8936" },
    { label: "Admins", value: admins.length, icon: "🔑", color: "#b794f4" },
    { label: "Coaching Cycles", value: cycles.length, icon: "🔄", color: "#68d391" },
    { label: "Completed Cycles", value: completedCycles.length, icon: "✅", color: "#48bb78" },
    { label: "Lesson Plans", value: plans.length, icon: "📄", color: "#63b3ed" },
    { label: "Finalized Plans", value: finalizedPlans.length, icon: "📗", color: "#48bb78" },
    { label: "Coach Evaluations", value: evals.length, icon: "📋", color: "#ed8936" },
  ];

  const recentUsers = users.slice(0, 5);
  const recentPlans = plans.slice(0, 5);

  return (
    <div>
      <div className="adm-stats-grid">
        {stats.map((s) => (
          <div key={s.label} className="adm-stat-card">
            <span className="adm-stat-card__icon">{s.icon}</span>
            <span className="adm-stat-card__value" style={{ color: s.color }}>{s.value}</span>
            <span className="adm-stat-card__label">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="adm-overview-cols">
        <div className="adm-overview-panel">
          <h3 className="adm-panel-title">Recent Users</h3>
          {recentUsers.length === 0 ? <p className="adm-muted">No users yet.</p> : (
            <div className="adm-mini-list">
              {recentUsers.map((u) => (
                <div key={u._id} className="adm-mini-item">
                  <div className="adm-avatar">{(u.firstName || "?")[0]}</div>
                  <div className="adm-mini-item__info">
                    <span className="adm-mini-item__name">{u.firstName} {u.lastName}</span>
                    <span className="adm-mini-item__sub">{u.email}</span>
                  </div>
                  <span className={`adm-role-chip adm-role-chip--${u.role}`}>{u.role}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="adm-overview-panel">
          <h3 className="adm-panel-title">Recent Lesson Plans</h3>
          {recentPlans.length === 0 ? <p className="adm-muted">No lesson plans yet.</p> : (
            <div className="adm-mini-list">
              {recentPlans.map((p) => {
                const t = p.teacherId || {};
                const title = p.paso1to5Input?.paso3?.lessonTitle || "Untitled Plan";
                return (
                  <div key={p._id} className="adm-mini-item">
                    <div className="adm-avatar adm-avatar--plan">📄</div>
                    <div className="adm-mini-item__info">
                      <span className="adm-mini-item__name">{title}</span>
                      <span className="adm-mini-item__sub">{t.firstName ? `${t.firstName} ${t.lastName}` : "Unknown"} · {fmtDate(p.createdAt)}</span>
                    </div>
                    <StatusBadge status={p.status} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Cycle Detail Panel ─── */
function CycleDetailPanel({ cycleId, onBack }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getCycleDetail(cycleId)
      .then((d) => { if (!cancelled) setDetail(d); })
      .catch((e) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [cycleId]);

  if (loading) return <div className="adm-loader">Loading cycle detail…</div>;
  if (error) return <div className="adm-error">{error} <button className="btn btn--ghost" onClick={onBack}>Back</button></div>;
  if (!detail) return null;

  const cycle = detail.cycle || detail;
  const students = detail.students || [];
  const lessonPlan = detail.lessonPlan;

  return (
    <div>
      <button type="button" className="btn btn--ghost adm-back-btn" onClick={onBack}>← Back to Cycles</button>
      <div className="adm-detail-card">
        <h3 className="adm-detail-card__title">Cycle: {cycle.name || "Untitled"}</h3>
        <div className="adm-detail-grid">
          <div className="adm-detail-item"><span className="adm-detail-label">Status</span><StatusBadge status={cycle.status} /></div>
          <div className="adm-detail-item"><span className="adm-detail-label">Students</span><span>{students.length}</span></div>
          <div className="adm-detail-item"><span className="adm-detail-label">Lesson Plan</span><span>{lessonPlan ? "Yes" : "No"}</span></div>
          <div className="adm-detail-item"><span className="adm-detail-label">Created</span><span>{fmtDate(cycle.createdAt)}</span></div>
        </div>
      </div>
      <h4 className="adm-section-subtitle">Paso Statuses</h4>
      <div className="adm-paso-grid">
        {Object.entries(PASO_LABELS).map(([key, label]) => {
          const ps = cycle.pasoStatuses || {};
          const status = ps[key] || "not_started";
          return (
            <div key={key} className="adm-paso-card">
              <h4 className="adm-paso-card__title">{label}</h4>
              <StatusBadge status={status} />
            </div>
          );
        })}
      </div>
      {students.length > 0 && (
        <>
          <h4 className="adm-section-subtitle">Students ({students.length})</h4>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead><tr><th>Name</th><th>Grade</th><th>Writing Sample</th><th>LLM Evaluation</th></tr></thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s._id}>
                    <td>{s.firstName} {s.lastName}</td>
                    <td>{s.grade || "—"}</td>
                    <td>{s.writingSamplePre ? "Yes" : "—"}</td>
                    <td>{s.llmEvaluation ? "Yes" : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Users View ─── */
function UsersView() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [search, setSearch] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    listUsers()
      .then((res) => setUsers(res.users || res || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  async function handleSave(data) {
    setSaving(true);
    try {
      if (modal && modal._id) await updateUser(modal._id, data);
      else await createUser(data);
      setModal(null);
      load();
    } catch (e) { alert(e.message); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!confirmDelete) return;
    try { await deleteUser(confirmDelete._id); setConfirmDelete(null); load(); }
    catch (e) { alert(e.message); setConfirmDelete(null); }
  }

  const filtered = users.filter((u) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return `${u.firstName} ${u.lastName}`.toLowerCase().includes(s) || u.email.toLowerCase().includes(s) || u.role.includes(s);
  });

  if (loading) return <div className="adm-loader">Loading users…</div>;
  if (error) return <div className="adm-error">{error}</div>;

  return (
    <div>
      <div className="adm-toolbar">
        <h2 className="adm-view-title">Users ({users.length})</h2>
        <div className="adm-toolbar__right">
          <input className="adm-search" placeholder="Search users…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <button type="button" className="btn btn--resume" onClick={() => setModal("create")}>+ Create User</button>
        </div>
      </div>
      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Role</th><th>Created</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u._id}>
                <td className="adm-td-name">{u.firstName} {u.lastName}</td>
                <td>{u.email}</td>
                <td><span className={`adm-role-chip adm-role-chip--${u.role}`}>{u.role}</span></td>
                <td>{fmtDate(u.createdAt)}</td>
                <td className="adm-td-actions">
                  <button type="button" className="adm-action-btn" onClick={() => setModal(u)}>Edit</button>
                  <button type="button" className="adm-action-btn adm-action-btn--danger" onClick={() => setConfirmDelete(u)}>Delete</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={5} className="adm-empty">No users found.</td></tr>}
          </tbody>
        </table>
      </div>
      {modal && <UserFormModal initial={modal === "create" ? null : modal} onSave={handleSave} onClose={() => setModal(null)} saving={saving} />}
      {confirmDelete && <ConfirmDialog message={`Delete "${confirmDelete.firstName} ${confirmDelete.lastName}"? This cannot be undone.`} onConfirm={handleDelete} onCancel={() => setConfirmDelete(null)} />}
    </div>
  );
}

/* ─── Cycles View ─── */
function CyclesView() {
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    setLoading(true);
    listAllCycles()
      .then((res) => setCycles(res.cycles || res || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (selectedId) return <CycleDetailPanel cycleId={selectedId} onBack={() => setSelectedId(null)} />;
  if (loading) return <div className="adm-loader">Loading cycles…</div>;
  if (error) return <div className="adm-error">{error}</div>;

  return (
    <div>
      <div className="adm-toolbar">
        <h2 className="adm-view-title">Coaching Cycles ({cycles.length})</h2>
      </div>
      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr><th>Teacher</th><th>Cycle Name</th><th>Status</th><th>Pasos</th><th>Created</th></tr>
          </thead>
          <tbody>
            {cycles.map((c) => {
              const t = c.teacherId || {};
              const name = t.firstName ? `${t.firstName} ${t.lastName}` : "Unknown";
              const ps = c.pasoStatuses || {};
              const completedPasos = Object.values(ps).filter((s) => s === "completed").length;
              return (
                <tr key={c._id} className="adm-row--clickable" onClick={() => setSelectedId(c._id)}>
                  <td className="adm-td-name">{name}</td>
                  <td>{c.name || "Untitled"}</td>
                  <td><StatusBadge status={c.status} /></td>
                  <td><span className="adm-paso-count">{completedPasos}/6</span></td>
                  <td>{fmtDate(c.createdAt)}</td>
                </tr>
              );
            })}
            {cycles.length === 0 && <tr><td colSpan={5} className="adm-empty">No cycles found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Lesson Plans View ─── */
function LessonPlansView() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    setLoading(true);
    listAllLessonPlans()
      .then((res) => setPlans(res.lessonPlans || res || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="adm-loader">Loading lesson plans…</div>;
  if (error) return <div className="adm-error">{error}</div>;

  if (selected) {
    const t = selected.teacherId || {};
    const title = selected.paso1to5Input?.paso3?.lessonTitle || "Untitled Plan";
    const subject = selected.paso1to5Input?.paso3?.subjectArea || "";
    const grade = selected.paso1to5Input?.paso3?.gradeLevel || "";
    return (
      <div>
        <button type="button" className="btn btn--ghost adm-back-btn" onClick={() => setSelected(null)}>← Back to Lesson Plans</button>
        <div className="adm-detail-card">
          <h3 className="adm-detail-card__title">{title}</h3>
          <div className="adm-detail-grid">
            <div className="adm-detail-item"><span className="adm-detail-label">Teacher</span><span>{t.firstName ? `${t.firstName} ${t.lastName}` : "Unknown"}</span></div>
            <div className="adm-detail-item"><span className="adm-detail-label">Subject</span><span>{subject || "—"}</span></div>
            <div className="adm-detail-item"><span className="adm-detail-label">Grade</span><span>{grade || "—"}</span></div>
            <div className="adm-detail-item"><span className="adm-detail-label">Status</span><StatusBadge status={selected.status} /></div>
            <div className="adm-detail-item"><span className="adm-detail-label">Created</span><span>{fmtDate(selected.createdAt)}</span></div>
          </div>
        </div>
        {selected.content && (
          <div className="adm-content-block">
            <h4 className="adm-section-subtitle">Lesson Plan Content</h4>
            <div className="adm-pre-wrap">{selected.content}</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="adm-toolbar">
        <h2 className="adm-view-title">Lesson Plans ({plans.length})</h2>
      </div>
      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr><th>Title</th><th>Teacher</th><th>Subject</th><th>Status</th><th>Date</th></tr>
          </thead>
          <tbody>
            {plans.map((p) => {
              const t = p.teacherId || {};
              const title = p.paso1to5Input?.paso3?.lessonTitle || "Untitled";
              const subject = p.paso1to5Input?.paso3?.subjectArea || "—";
              return (
                <tr key={p._id} className="adm-row--clickable" onClick={() => setSelected(p)}>
                  <td className="adm-td-name">{title}</td>
                  <td>{t.firstName ? `${t.firstName} ${t.lastName}` : "Unknown"}</td>
                  <td>{subject}</td>
                  <td><StatusBadge status={p.status} /></td>
                  <td>{fmtDate(p.createdAt)}</td>
                </tr>
              );
            })}
            {plans.length === 0 && <tr><td colSpan={5} className="adm-empty">No lesson plans found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Evaluations View ─── */
function EvaluationsView() {
  const [evals, setEvals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    setLoading(true);
    listAllEvaluations()
      .then((res) => setEvals(res.evaluations || res || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="adm-loader">Loading evaluations…</div>;
  if (error) return <div className="adm-error">{error}</div>;

  if (selected) {
    const coach = selected.coachId || {};
    const teacher = selected.teacherId || {};
    return (
      <div>
        <button type="button" className="btn btn--ghost adm-back-btn" onClick={() => setSelected(null)}>← Back to Evaluations</button>
        <div className="adm-detail-card">
          <h3 className="adm-detail-card__title">Evaluation Detail</h3>
          <div className="adm-detail-grid">
            <div className="adm-detail-item"><span className="adm-detail-label">Coach</span><span>{coach.firstName ? `${coach.firstName} ${coach.lastName}` : "Unknown"}</span></div>
            <div className="adm-detail-item"><span className="adm-detail-label">Teacher</span><span>{teacher.firstName ? `${teacher.firstName} ${teacher.lastName}` : "Unknown"}</span></div>
            <div className="adm-detail-item"><span className="adm-detail-label">Date</span><span>{fmtDate(selected.createdAt)}</span></div>
          </div>
        </div>
        {selected.scores && (
          <div className="adm-content-block">
            <h4 className="adm-section-subtitle">Scores</h4>
            <div className="adm-scores-grid">
              {Object.entries(selected.scores).map(([k, v]) => (
                <div key={k} className="adm-score-item">
                  <span className="adm-score-label">{k.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase())}</span>
                  <span className="adm-score-value">{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {selected.notes && <div className="adm-content-block"><h4 className="adm-section-subtitle">Notes</h4><div className="adm-pre-wrap">{selected.notes}</div></div>}
        {selected.strengths && <div className="adm-content-block"><h4 className="adm-section-subtitle">Strengths</h4><div className="adm-pre-wrap">{typeof selected.strengths === "string" ? selected.strengths : JSON.stringify(selected.strengths, null, 2)}</div></div>}
        {selected.areasForGrowth && <div className="adm-content-block"><h4 className="adm-section-subtitle">Areas for Growth</h4><div className="adm-pre-wrap">{typeof selected.areasForGrowth === "string" ? selected.areasForGrowth : JSON.stringify(selected.areasForGrowth, null, 2)}</div></div>}
      </div>
    );
  }

  return (
    <div>
      <div className="adm-toolbar">
        <h2 className="adm-view-title">Coach Evaluations ({evals.length})</h2>
      </div>
      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead><tr><th>Coach</th><th>Teacher</th><th>Date</th></tr></thead>
          <tbody>
            {evals.map((ev) => {
              const c = ev.coachId || {};
              const t = ev.teacherId || {};
              return (
                <tr key={ev._id} className="adm-row--clickable" onClick={() => setSelected(ev)}>
                  <td>{c.firstName ? `${c.firstName} ${c.lastName}` : "Unknown"}</td>
                  <td>{t.firstName ? `${t.firstName} ${t.lastName}` : "Unknown"}</td>
                  <td>{fmtDate(ev.createdAt)}</td>
                </tr>
              );
            })}
            {evals.length === 0 && <tr><td colSpan={3} className="adm-empty">No evaluations found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Main AdminDashboard Component
   ═══════════════════════════════════════════ */
function AdminDashboard({ user, onLogout }) {
  const [tab, setTab] = useState("overview");
  const [users, setUsers] = useState([]);
  const [cycles, setCycles] = useState([]);
  const [plans, setPlans] = useState([]);
  const [evals, setEvals] = useState([]);
  const [loadingOverview, setLoadingOverview] = useState(true);

  useEffect(() => {
    setLoadingOverview(true);
    Promise.all([
      listUsers().then((r) => setUsers(r.users || r || [])).catch(() => {}),
      listAllCycles().then((r) => setCycles(r.cycles || r || [])).catch(() => {}),
      listAllLessonPlans().then((r) => setPlans(r.lessonPlans || r || [])).catch(() => {}),
      listAllEvaluations().then((r) => setEvals(r.evaluations || r || [])).catch(() => {}),
    ]).finally(() => setLoadingOverview(false));
  }, []);

  const headerTitle = TABS.find((t) => t.key === tab)?.label || "Admin";

  function renderTab() {
    switch (tab) {
      case "overview":
        return loadingOverview
          ? <div className="adm-loader">Loading overview…</div>
          : <OverviewTab users={users} cycles={cycles} plans={plans} evals={evals} />;
      case "users": return <UsersView />;
      case "cycles": return <CyclesView />;
      case "lessons": return <LessonPlansView />;
      case "evaluations": return <EvaluationsView />;
      default: return null;
    }
  }

  return (
    <div className="adm-dashboard">
      <aside className="adm-sidebar">
        <div className="adm-sidebar__brand">
          <div className="adm-sidebar__logo">Cc</div>
          <div>
            <div className="adm-sidebar__title">Coaching Camino</div>
            <div className="adm-sidebar__subtitle">ADMIN PANEL</div>
          </div>
        </div>

        <nav className="adm-sidebar__nav">
          {TABS.map((t) => (
            <div key={t.key} className={`adm-nav-item${tab === t.key ? " adm-nav-item--active" : ""}`} onClick={() => setTab(t.key)}>
              <span className="adm-nav-item__icon">{t.icon}</span>
              <span className="adm-nav-item__label">{t.label}</span>
            </div>
          ))}
        </nav>

        <div className="adm-sidebar__profile">
          <div className="adm-avatar">{user?.firstName?.charAt(0) || "A"}</div>
          <div className="adm-sidebar__profile-info">
            <span className="adm-sidebar__profile-name">{user?.firstName} {user?.lastName}</span>
            <span className="adm-sidebar__profile-role">Administrator</span>
          </div>
          <button type="button" className="adm-logout-btn" onClick={onLogout}>Log out</button>
        </div>
      </aside>

      <main className="adm-main">
        <header className="adm-header">
          <h1 className="adm-header__title">{headerTitle}</h1>
          <button type="button" className="btn btn--ghost btn--logout" onClick={onLogout}>Log out</button>
        </header>
        <section className="adm-content">
          {renderTab()}
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;
