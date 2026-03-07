import { useState } from "react";
import "./App.css";
import LoginPage from "./LoginPage";
import TeacherDashboard from "./TeacherDashboard";
import CoachDashboard from "./CoachDashboard";
import AdminDashboard from "./AdminDashboard";
import { getStoredUser, logout } from "./api/auth";

function HomePage({ user, onLogout }) {
  return (
    <>
      <header className="site-header">
        <div className="container site-header__inner">
          <div className="brand">
            <div className="brand__logo">CC</div>
            <div className="brand__text">
              <span className="brand__title">Coaching Caminos</span>
              <span className="brand__subtitle">
                Support for teachers and coaches
              </span>
            </div>
          </div>

          <nav className="nav-links" aria-label="Primary">
            <a className="nav-link" href="#teachers">
              Teachers
            </a>
            <a className="nav-link" href="#coach">
              Coach
            </a>
            {onLogout && (
              <button type="button" className="nav-link nav-link--btn" onClick={onLogout}>
                Log out
              </button>
            )}
          </nav>
        </div>
      </header>

      <main className="page">
        <section className="hero">
          <div className="container hero__inner">
            <div>
              <p className="eyebrow">IT7993 • Project 19 • Group 2</p>

              <h1 className="hero__title">
                <span className="accent">Coaching</span> Caminos
              </h1>

              <p className="hero__subtitle">
                A digital platform designed to support teachers of multilingual
                learners through a structured, reflective 6-Paso process.
              </p>

              <div className="hero__actions">
                <a className="btn" href="#overview">
                  Overview
                </a>
                <a className="btn btn--ghost" href="#features">
                  Features
                </a>
              </div>

              <div className="chips">
                <span className="chip">6-Paso workflow</span>
                <span className="chip">Multilingual learners</span>
                <span className="chip">Reflection + evidence</span>
              </div>
            </div>

            <div className="card">
              <h2 className="card__title">Project Snapshot</h2>
              <ul className="list">
                <li>
                  <strong>Course:</strong> IT7993
                </li>
                <li>
                  <strong>Team:</strong> Group 2
                </li>
                <li>
                  <strong>Purpose:</strong> Teacher support tool
                </li>
                <li>
                  <strong>Method:</strong> Structured 6-Paso reflection
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="section" id="overview">
          <div className="container">
            <h2 className="section__title">Overview</h2>
            <p className="section__text">
              Add your required project details here (problem, users, goals,
              what gets saved to the backend).
            </p>
          </div>
        </section>

        <section className="section section--alt" id="features">
          <div className="container">
            <h2 className="section__title">Key Features</h2>

            <div className="grid grid--2">
              <div className="card">
                <h3 className="card__title">Guided prompts</h3>
                <p className="card__text">
                  Prompts for each Paso to keep reflection consistent.
                </p>
              </div>

              <div className="card">
                <h3 className="card__title">Backend saving</h3>
                <p className="card__text">
                  Entries persist so teachers can review growth over time.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="teachers">
          <div className="container">
            <h2 className="section__title">For Teachers</h2>
            <p className="section__text">
              A guided Camino to reflect on practice, capture evidence, and set
              goals for multilingual learners.
            </p>

            <div className="grid grid--2">
              <div className="card">
                <h3 className="card__title">Your dashboard</h3>
                <p className="card__text">
                  Track your progress across the 6 Pasos and revisit past
                  reflections.
                </p>
              </div>

              <div className="card">
                <h3 className="card__title">Classroom resources</h3>
                <p className="card__text">
                  Access recommended strategies and artifacts aligned to each
                  step.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="section section--alt" id="coach">
          <div className="container">
            <h2 className="section__title">For Coaches</h2>
            <p className="section__text">
              Use Coaching Caminos to plan conversations, review evidence, and
              celebrate growth with teachers.
            </p>

            <div className="grid grid--2">
              <div className="card">
                <h3 className="card__title">Teacher overview</h3>
                <p className="card__text">
                  See which Pasos teachers are working on and where support is
                  needed.
                </p>
              </div>

              <div className="card">
                <h3 className="card__title">Session planning</h3>
                <p className="card__text">
                  Capture notes and next steps so each coaching session builds
                  on the last.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

function App() {
  const [user, setUser] = useState(() => getStoredUser());

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  if (!user) {
    return <LoginPage onLogin={setUser} />;
  }

  if (user.role === "teacher") {
    return <TeacherDashboard user={user} onLogout={handleLogout} />;
  }
  if (user.role === "coach") {
    return <CoachDashboard user={user} onLogout={handleLogout} />;
  }
  if (user.role === "admin") {
    return <AdminDashboard user={user} onLogout={handleLogout} />;
  }

  return <HomePage user={user} onLogout={handleLogout} />;
}

export default App;
