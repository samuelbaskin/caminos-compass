import "./App.css";

function App() {
  return (
    <main className="page">
      <section className="hero">
        <div className="container hero__inner">
          <div>
            <p className="eyebrow">IT7993 • Project 19 • Group 2</p>

            <h1 className="hero__title">Teaching Caminos Compass</h1>

            <p className="hero__subtitle">
              A digital platform designed to support teachers of multilingual learners
              through a structured, reflective 6-Paso process.
            </p>

            <div className="hero__actions">
              <a className="btn" href="#overview">Overview</a>
              <a className="btn btn--ghost" href="#features">Features</a>
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
              <li><strong>Course:</strong> IT7993</li>
              <li><strong>Team:</strong> Group 2</li>
              <li><strong>Purpose:</strong> Teacher support tool</li>
              <li><strong>Method:</strong> Structured 6-Paso reflection</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section" id="overview">
        <div className="container">
          <h2 className="section__title">Overview</h2>
          <p className="section__text">
            Add your required project details here (problem, users, goals, what gets saved to the backend).
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
    </main>
  );
}

export default App;
