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
  paso1: "Paso 1",
  paso2: "Paso 2",
  paso3: "Paso 3",
  paso4: "Paso 4",
  paso5: "Paso 5",
  paso6: "Paso 6",
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
    completed: { cls: "admin-badge--completed", text: "Completed" },
    in_progress: { cls: "admin-badge--progress", text: "In Progress" },
    pending: { cls: "admin-badge--pending", text: "Pending" },
    submitted: { cls: "admin-badge--progress", text: "Submitted" },
    approved: { cls: "admin-badge--completed", text: "Approved" },
    rejected: { cls: "admin-badge--rejected", text: "Rejected" },
    locked: { cls: "admin-badge--locked", text: "Locked" },
    not_started: { cls: "admin-badge--locked", text: "Not Started" },
  };
  const m = map[status] || { cls: "admin-badge--locked", text: status || "—" };
  return <span className={`admin-badge ${m.cls}`}>{m.text}</span>;
}

/* ─── Confirm Dialog ─── */
function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="admin-overlay" onClick={onCancel}>
      <div className="admin-modal admin-modal--sm" onClick={(e) => e.stopPropagation()}>
        <p className="admin-confirm-msg">{message}</p>
        <div className="admin-modal__actions">
          <button type="button" className="btn btn--ghost" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="btn admin-btn--danger" onClick={onConfirm}>
            Delete
          </button>
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
  const pickRole = (r) => () => setForm((p) => ({ ...p, role: r }));

  function handleSubmit(e) {
    e.preventDefault();
    const payload = { ...form };
    if (isEdit && !payload.password) delete payload.password;
    onSave(payload);
  }

  return (
    <div className="admin-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="admin-modal__title">{isEdit ? "Edit User" : "Create User"}</h3>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-grid-two">
            <div className="auth-field">
              <label>First Name</label>
              <input className="auth-input" value={form.firstName} onChange={set("firstName")} required />
            </div>
            <div className="auth-field">
              <label>Last Name</label>
              <input className="auth-input" value={form.lastName} onChange={set("lastName")} required />
            </div>
          </div>
          <div className="auth-field">
            <label>Email</label>
            <input className="auth-input" type="email" value={form.email} onChange={set("email")} required />
          </div>
          <div className="auth-field">
            <label>{isEdit ? "New Password (leave blank to keep)" : "Password"}</label>
            <input
              className="auth-input"
              type="password"
              value={form.password}
              onChange={set("password")}
              {...(isEdit ? {} : { required: true, minLength: 6 })}
            />
          </div>
          <div className="auth-field">
            <label>Role</label>
            <div className="auth-role-toggle">
              {["teacher", "coach", "admin"].map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`auth-role-pill${form.role === r ? " auth-role-pill--active" : ""}`}
                  onClick={pickRole(r)}
                >
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="admin-modal__actions">
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn--resume" disabled={saving}>
              {saving ? "Saving…" : isEdit ? "Update" : "Create"}
            </button>
          </div>
        </form>
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
    setError("");
    getCycleDetail(cycleId)
      .then((d) => { if (!cancelled) setDetail(d); })
      .catch((e) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [cycleId]);

  if (loading) return <div className="admin-loader">Loading cycle detail…</div>;
  if (error) return <div className="admin-error">{error} <button className="btn btn--ghost" onClick={onBack}>Back</button></div>;
  if (!detail) return null;

  const teacher = detail.teacher || detail.teacherId || {};
  const teacherName = teacher.firstName ? `${teacher.firstName} ${teacher.lastName}` : "Unknown";

  return (
    <div>
      <button type="button" className="btn btn--ghost admin-back-btn" onClick={onBack}>← Back to Cycles</button>
      <div className="card" style={{ marginTop: 16 }}>
        <h3 className="card__title">Cycle Detail</h3>
        <div className="admin-detail-grid">
          <div className="admin-detail-item"><span className="admin-detail-label">Teacher</span><span>{teacherName}</span></div>
          <div className="admin-detail-item"><span className="admin-detail-label">Status</span><StatusBadge status={detail.status} /></div>
          <div className="admin-detail-item"><span className="admin-detail-label">Created</span><span>{fmtDate(detail.createdAt)}</span></div>
        </div>
      </div>
      <div className="admin-paso-grid">
        {Object.entries(PASO_LABELS).map(([key, label]) => {
          const paso = detail[key] || detail[`${key}Status`];
          const status = typeof paso === "object" ? paso?.status : paso;
          return (
            <div key={key} className="card admin-paso-card">
              <h4 className="admin-paso-card__title">{label}</h4>
              <StatusBadge status={status} />
              {typeof paso === "object" && paso?.submittedAt && (
                <p className="admin-paso-card__date">Submitted: {fmtDate(paso.submittedAt)}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Users View ─── */
function UsersView() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null); // null | "create" | user obj
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    listUsers()
      .then(setUsers)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  async function handleSave(data) {
    setSaving(true);
    try {
      if (modal && modal._id) {
        await updateUser(modal._id, data);
      } else {
        await createUser(data);
      }
      setModal(null);
      load();
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirmDelete) return;
    try {
      await deleteUser(confirmDelete._id);
      setConfirmDelete(null);
      load();
    } catch (e) {
      alert(e.message);
      setConfirmDelete(null);
    }
  }

  if (loading) return <div className="admin-loader">Loading users…</div>;
  if (error) return <div className="admin-error">{error}</div>;

  return (
    <div>
      <div className="admin-toolbar">
        <h2 className="admin-view-title">Users ({users.length})</h2>
        <button type="button" className="btn btn--resume" onClick={() => setModal("create")}>+ Create User</button>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.firstName} {u.lastName}</td>
                <td>{u.email}</td>
                <td><span className={`admin-role-chip admin-role-chip--${u.role}`}>{u.role}</span></td>
                <td>{fmtDate(u.createdAt)}</td>
                <td className="admin-table__actions">
                  <button type="button" className="btn btn--ghost admin-btn--sm" onClick={() => setModal(u)}>Edit</button>
                  <button type="button" className="btn btn--ghost admin-btn--sm admin-btn--danger-text" onClick={() => setConfirmDelete(u)}>Delete</button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={5} className="admin-empty">No users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {modal && (
        <UserFormModal
          initial={modal === "create" ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
          saving={saving}
        />
      )}
      {confirmDelete && (
        <ConfirmDialog
          message={`Delete user "${confirmDelete.firstName} ${confirmDelete.lastName}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
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
      .then(setCycles)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (selectedId) return <CycleDetailPanel cycleId={selectedId} onBack={() => setSelectedId(null)} />;
  if (loading) return <div className="admin-loader">Loading cycles…</div>;
  if (error) return <div className="admin-error">{error}</div>;

  return (
    <div>
      <div className="admin-toolbar">
        <h2 className="admin-view-title">Teacher Cycles ({cycles.length})</h2>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Teacher</th>
              <th>Status</th>
              {Object.values(PASO_LABELS).map((l) => <th key={l}>{l}</th>)}
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {cycles.map((c) => {
              const t = c.teacher || c.teacherId || {};
              const name = t.firstName ? `${t.firstName} ${t.lastName}` : "Unknown";
              return (
                <tr key={c._id} className="admin-row--clickable" onClick={() => setSelectedId(c._id)}>
                  <td>{name}</td>
                  <td><StatusBadge status={c.status} /></td>
                  {Object.keys(PASO_LABELS).map((k) => {
                    const s = typeof c[k] === "object" ? c[k]?.status : c[k];
                    return <td key={k}><StatusBadge status={s} /></td>;
                  })}
                  <td>{fmtDate(c.createdAt)}</td>
                </tr>
              );
            })}
            {cycles.length === 0 && (
              <tr><td colSpan={9} className="admin-empty">No cycles found.</td></tr>
            )}
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
      .then(setPlans)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="admin-loader">Loading lesson plans…</div>;
  if (error) return <div className="admin-error">{error}</div>;

  if (selected) {
    return (
      <div>
        <button type="button" className="btn btn--ghost admin-back-btn" onClick={() => setSelected(null)}>← Back to Lesson Plans</button>
        <div className="card" style={{ marginTop: 16 }}>
          <h3 className="card__title">Lesson Plan</h3>
          <div className="admin-detail-grid">
            <div className="admin-detail-item">
              <span className="admin-detail-label">Teacher</span>
              <span>{selected.teacher?.firstName ? `${selected.teacher.firstName} ${selected.teacher.lastName}` : "Unknown"}</span>
            </div>
            <div className="admin-detail-item">
              <span className="admin-detail-label">Status</span>
              <StatusBadge status={selected.status} />
            </div>
            <div className="admin-detail-item">
              <span className="admin-detail-label">Date</span>
              <span>{fmtDate(selected.createdAt)}</span>
            </div>
          </div>
          {selected.content && (
            <div className="admin-content-block">
              <h4>Content</h4>
              <div className="admin-pre-wrap">{typeof selected.content === "string" ? selected.content : JSON.stringify(selected.content, null, 2)}</div>
            </div>
          )}
          {selected.objectives && (
            <div className="admin-content-block">
              <h4>Objectives</h4>
              <div className="admin-pre-wrap">{typeof selected.objectives === "string" ? selected.objectives : JSON.stringify(selected.objectives, null, 2)}</div>
            </div>
          )}
          {selected.feedback && (
            <div className="admin-content-block">
              <h4>AI Feedback</h4>
              <div className="admin-pre-wrap">{typeof selected.feedback === "string" ? selected.feedback : JSON.stringify(selected.feedback, null, 2)}</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-toolbar">
        <h2 className="admin-view-title">Lesson Plans ({plans.length})</h2>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Teacher</th>
              <th>Title</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((p) => {
              const t = p.teacher || p.teacherId || {};
              const name = t.firstName ? `${t.firstName} ${t.lastName}` : "Unknown";
              return (
                <tr key={p._id} className="admin-row--clickable" onClick={() => setSelected(p)}>
                  <td>{name}</td>
                  <td>{p.title || "Untitled"}</td>
                  <td><StatusBadge status={p.status} /></td>
                  <td>{fmtDate(p.createdAt)}</td>
                </tr>
              );
            })}
            {plans.length === 0 && (
              <tr><td colSpan={4} className="admin-empty">No lesson plans found.</td></tr>
            )}
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
      .then(setEvals)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="admin-loader">Loading evaluations…</div>;
  if (error) return <div className="admin-error">{error}</div>;

  if (selected) {
    const coach = selected.coach || selected.coachId || {};
    const teacher = selected.teacher || selected.teacherId || {};
    return (
      <div>
        <button type="button" className="btn btn--ghost admin-back-btn" onClick={() => setSelected(null)}>← Back to Evaluations</button>
        <div className="card" style={{ marginTop: 16 }}>
          <h3 className="card__title">Evaluation Detail</h3>
          <div className="admin-detail-grid">
            <div className="admin-detail-item">
              <span className="admin-detail-label">Coach</span>
              <span>{coach.firstName ? `${coach.firstName} ${coach.lastName}` : "Unknown"}</span>
            </div>
            <div className="admin-detail-item">
              <span className="admin-detail-label">Teacher</span>
              <span>{teacher.firstName ? `${teacher.firstName} ${teacher.lastName}` : "Unknown"}</span>
            </div>
            <div className="admin-detail-item">
              <span className="admin-detail-label">Date</span>
              <span>{fmtDate(selected.createdAt)}</span>
            </div>
          </div>
          {selected.scores && (
            <div className="admin-content-block">
              <h4>Scores</h4>
              <div className="admin-scores-grid">
                {Object.entries(selected.scores).map(([k, v]) => (
                  <div key={k} className="admin-score-item">
                    <span className="admin-score-label">{k}</span>
                    <span className="admin-score-value">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {selected.notes && (
            <div className="admin-content-block">
              <h4>Notes</h4>
              <div className="admin-pre-wrap">{selected.notes}</div>
            </div>
          )}
          {selected.strengths && (
            <div className="admin-content-block">
              <h4>Strengths</h4>
              <div className="admin-pre-wrap">{typeof selected.strengths === "string" ? selected.strengths : JSON.stringify(selected.strengths, null, 2)}</div>
            </div>
          )}
          {selected.areasForGrowth && (
            <div className="admin-content-block">
              <h4>Areas for Growth</h4>
              <div className="admin-pre-wrap">{typeof selected.areasForGrowth === "string" ? selected.areasForGrowth : JSON.stringify(selected.areasForGrowth, null, 2)}</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-toolbar">
        <h2 className="admin-view-title">Evaluations ({evals.length})</h2>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Coach</th>
              <th>Teacher</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {evals.map((ev) => {
              const c = ev.coach || ev.coachId || {};
              const t = ev.teacher || ev.teacherId || {};
              return (
                <tr key={ev._id} className="admin-row--clickable" onClick={() => setSelected(ev)}>
                  <td>{c.firstName ? `${c.firstName} ${c.lastName}` : "Unknown"}</td>
                  <td>{t.firstName ? `${t.firstName} ${t.lastName}` : "Unknown"}</td>
                  <td>{fmtDate(ev.createdAt)}</td>
                </tr>
              );
            })}
            {evals.length === 0 && (
              <tr><td colSpan={3} className="admin-empty">No evaluations found.</td></tr>
            )}
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
  const [tab, setTab] = useState("users");

  const viewMap = {
    users: <UsersView />,
    cycles: <CyclesView />,
    lessons: <LessonPlansView />,
    evaluations: <EvaluationsView />,
  };

  const headerTitle = TABS.find((t) => t.key === tab)?.label || "Admin";

  return (
    <div className="dashboard dashboard--admin">
      <aside className="dashboard-sidebar">
        <div className="dashboard-sidebar__brand">
          <div className="dashboard-sidebar__logo">CC</div>
          <div className="dashboard-sidebar__brand-text">
            <span className="dashboard-sidebar__title">Coaching Camino</span>
            <span className="dashboard-sidebar__subtitle">ADMIN</span>
          </div>
        </div>

        <nav className="dashboard-sidebar__nav">
          <p className="dashboard-sidebar__section-title">Management</p>
          <ul className="coach-tools">
            {TABS.map((t) => (
              <li
                key={t.key}
                className={`coach-tool${tab === t.key ? " coach-tool--active" : ""}`}
                onClick={() => setTab(t.key)}
                style={{ cursor: "pointer" }}
              >
                <span className="coach-tool__icon">{t.icon}</span>
                <span className="coach-tool__name">{t.label}</span>
              </li>
            ))}
          </ul>
        </nav>

        <div className="dashboard-sidebar__profile">
          <div className="dashboard-avatar">{user?.firstName?.charAt(0) || "A"}</div>
          <div className="dashboard-profile__info">
            <span className="dashboard-profile__name">
              {user?.firstName} {user?.lastName}
            </span>
            <span className="dashboard-profile__role">Administrator</span>
            <button type="button" className="dashboard-profile__link" onClick={onLogout}>
              Log out
            </button>
          </div>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <h1 className="dashboard-header__title">{headerTitle}</h1>
          <button type="button" className="btn btn--ghost btn--logout" onClick={onLogout}>
            Log out
          </button>
        </header>

        <section className="dashboard-content">
          {viewMap[tab]}
        </section>
      </main>

      <style>{`
        /* ─── Admin-specific styles ─── */
        .admin-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .admin-view-title {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text);
        }

        /* Table */
        .admin-table-wrap {
          overflow-x: auto;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          background: var(--panel);
          box-shadow: var(--shadow);
        }
        .admin-table {
          width: 100%;
          border-collapse: collapse;
          font-size: .9rem;
        }
        .admin-table th {
          text-align: left;
          padding: 12px 16px;
          font-size: .75rem;
          font-weight: 700;
          letter-spacing: .04em;
          color: var(--muted);
          text-transform: uppercase;
          background: var(--bg-alt);
          border-bottom: 1px solid var(--border);
          white-space: nowrap;
        }
        .admin-table td {
          padding: 12px 16px;
          border-bottom: 1px solid var(--border);
          color: var(--text);
          vertical-align: middle;
        }
        .admin-table tbody tr:last-child td {
          border-bottom: none;
        }
        .admin-table tbody tr:hover {
          background: var(--bg-alt);
        }
        .admin-row--clickable {
          cursor: pointer;
        }
        .admin-row--clickable:hover {
          background: var(--panel-subtle) !important;
        }
        .admin-table__actions {
          display: flex;
          gap: 6px;
          white-space: nowrap;
        }
        .admin-empty {
          text-align: center;
          color: var(--muted);
          padding: 32px 16px !important;
        }

        /* Buttons */
        .admin-btn--sm {
          padding: 6px 12px !important;
          font-size: .8rem !important;
          border-radius: 10px !important;
        }
        .admin-btn--danger {
          background: #dc2626 !important;
          color: #fff !important;
          box-shadow: none !important;
        }
        .admin-btn--danger:hover {
          background: #b91c1c !important;
        }
        .admin-btn--danger-text {
          color: #dc2626 !important;
          border-color: rgba(220,38,38,.3) !important;
        }
        .admin-btn--danger-text:hover {
          background: #fef2f2 !important;
          border-color: #dc2626 !important;
          color: #b91c1c !important;
        }

        /* Badge */
        .admin-badge {
          display: inline-block;
          font-size: .7rem;
          font-weight: 700;
          letter-spacing: .03em;
          padding: 3px 10px;
          border-radius: 999px;
          white-space: nowrap;
        }
        .admin-badge--completed {
          background: var(--accent-light);
          color: var(--accent-hover);
        }
        .admin-badge--progress {
          background: #dbeafe;
          color: #1d4ed8;
        }
        .admin-badge--pending {
          background: #fef3c7;
          color: #92400e;
        }
        .admin-badge--rejected {
          background: #fee2e2;
          color: #b91c1c;
        }
        .admin-badge--locked {
          background: #e2e8f0;
          color: var(--muted);
        }

        /* Role chip */
        .admin-role-chip {
          display: inline-block;
          font-size: .7rem;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 999px;
          text-transform: capitalize;
        }
        .admin-role-chip--teacher {
          background: #ffedd5;
          color: #c2410c;
        }
        .admin-role-chip--coach {
          background: var(--accent-light);
          color: var(--accent-hover);
        }
        .admin-role-chip--admin {
          background: #ede9fe;
          color: #6d28d9;
        }

        /* Overlay / Modal */
        .admin-overlay {
          position: fixed;
          inset: 0;
          z-index: 100;
          background: rgba(15, 23, 42, .45);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }
        .admin-modal {
          background: var(--panel);
          border-radius: 20px;
          padding: 28px 28px 24px;
          width: min(100%, 480px);
          box-shadow: 0 20px 60px rgba(15, 23, 42, .18);
          max-height: 90vh;
          overflow-y: auto;
        }
        .admin-modal--sm {
          width: min(100%, 380px);
          text-align: center;
        }
        .admin-modal__title {
          margin: 0 0 18px;
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--text);
        }
        .admin-modal__actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 16px;
        }
        .admin-confirm-msg {
          margin: 0 0 20px;
          font-size: .95rem;
          color: var(--text);
          line-height: 1.5;
        }

        /* Loader / Error */
        .admin-loader {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          font-size: .95rem;
          color: var(--muted);
        }
        .admin-error {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 60px 20px;
          font-size: .95rem;
          color: #dc2626;
        }
        .admin-back-btn {
          font-size: .85rem !important;
          padding: 8px 14px !important;
        }

        /* Detail panels */
        .admin-detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 16px;
          margin-top: 16px;
        }
        .admin-detail-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .admin-detail-label {
          font-size: .7rem;
          font-weight: 700;
          letter-spacing: .05em;
          color: var(--muted);
          text-transform: uppercase;
        }

        /* Paso grid */
        .admin-paso-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 14px;
          margin-top: 18px;
        }
        .admin-paso-card {
          text-align: center;
          padding: 18px 14px;
        }
        .admin-paso-card__title {
          margin: 0 0 8px;
          font-size: .95rem;
          font-weight: 700;
          color: var(--accent-hover);
        }
        .admin-paso-card__date {
          margin: 8px 0 0;
          font-size: .75rem;
          color: var(--muted);
        }

        /* Content block */
        .admin-content-block {
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid var(--border);
        }
        .admin-content-block h4 {
          margin: 0 0 8px;
          font-size: .95rem;
          font-weight: 700;
          color: var(--accent-hover);
        }
        .admin-pre-wrap {
          white-space: pre-wrap;
          font-size: .88rem;
          color: var(--text);
          background: var(--bg-alt);
          border-radius: 10px;
          padding: 14px;
          line-height: 1.6;
          max-height: 400px;
          overflow-y: auto;
        }

        /* Scores grid */
        .admin-scores-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 10px;
        }
        .admin-score-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
          background: var(--panel-subtle);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 12px;
          text-align: center;
        }
        .admin-score-label {
          font-size: .7rem;
          font-weight: 700;
          color: var(--muted);
          text-transform: capitalize;
        }
        .admin-score-value {
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--accent-hover);
        }

        @media (max-width: 768px) {
          .admin-detail-grid {
            grid-template-columns: 1fr;
          }
          .admin-paso-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default AdminDashboard;
