import { Link } from "react-router-dom";

/**
 * Public marketing / overview page for the Coaching Caminos Compass.
 * Reuses existing class names from App.css so the page inherits the
 * established green / equity-driven color scheme.
 */
function LandingPage() {
  return (
    <>
      <header className="site-header landing-header">
        <div className="container site-header__inner landing-header__inner">
          <Link
            to="/"
            className="brand landing-brand"
            aria-label="Coaching Caminos Compass home"
          >
            <div className="brand__logo">CC</div>
            <div className="brand__text">
              <span className="brand__title">Coaching Caminos Compass</span>
              <span className="brand__subtitle">
                Equity-driven educator development
              </span>
            </div>
          </Link>

          <nav className="nav-links landing-nav" aria-label="Primary">
            <a className="nav-link" href="#overview">
              Overview
            </a>
            <a className="nav-link" href="#vision">
              Vision
            </a>
            <a className="nav-link" href="#purpose">
              Purpose
            </a>
            <a className="nav-link" href="#core-framework">
              Core framework
            </a>
            <Link className="btn landing-nav__login" to="/login">
              Log in
            </Link>
          </nav>
        </div>
      </header>

      <main className="page landing-page">
        <section className="hero landing-hero">
          <div className="container hero__inner landing-hero__inner">
            <div>
              <p className="eyebrow">Coaching Caminos · Digital platform</p>
              <h2 className="hero__title landing-hero__title">
                <span className="accent">Coaching</span> Caminos Compass
              </h2>
              <p className="hero__subtitle landing-hero__lead">
                A comprehensive, equity-driven framework for educator
                development, instructional coaching, and school leadership —
                centering bi/multilingual learners and turning reflection into
                action.
              </p>
              <div className="hero__actions">
                <a className="btn" href="#overview">
                  Learn more
                </a>
                <Link className="btn btn--ghost" to="/login">
                  Sign in to the platform
                </Link>
              </div>
            </div>

            <div className="card landing-hero-card">
              <h2 className="card__title">At a glance</h2>
              <ul className="list landing-hero-list">
                <li>
                  <strong>Focus:</strong> Systemic equity for emergent
                  bi/multilingual learners, including those with disabilities
                </li>
                <li>
                  <strong>Method:</strong> Structured 6-Paso cycle from
                  self-reflection to linguistically responsive instruction
                </li>
                <li>
                  <strong>Tools:</strong> Artifact analysis, coaching workflows,
                  and LLM-supported lesson planning
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="section landing-section" id="overview">
          <div className="container">
            <h2 className="section__title">Overview</h2>
            <div className="section__text landing-prose">
              <p>
                The Coaching Caminos Compass project is a digital platform
                designed to provide a comprehensive, equity-driven framework
                for educator development, instructional coaching, and school
                leadership. It is geared toward addressing systemic inequities
                impacting bi/multilingual learners, particularly those with
                disabilities, through the reorientation of educators&apos;
                critical consciousness and inherent biases, coupled with the
                translation of educators&apos; reflection into action. It
                encourages and empowers educators to be advocates and change
                agents.
              </p>
              <p>
                The model incorporates a structured 6-Paso (step) process
                &quot;to support reflective practice, understanding of student
                needs, analysis of artifacts, planning linguistically
                responsive instruction aligned with WIDA standards, and
                monitoring language growth.&quot; Lesson plans are created with
                the assistance of a large language model (LLM).
              </p>
            </div>

            <figure className="landing-diagram">
              <figcaption className="landing-diagram__caption">
                Critical Consciousness Decision-Making Model (CCDM; Broughton et al., 2022).
              </figcaption>
              <img
                src={`${process.env.PUBLIC_URL}/ccdm-framework.png`}
                alt="Critical Consciousness Decision-Making Model (CCDM): a hexagonal diagram with a central Preparation Phase and Practice Phase, surrounded by six framework domains — 1. Reflect, 2. Review, 3. Recognize, 4. Plan for Service Delivery, 5. Partner with Families and Communities, and 6. Practice and Advocate."
                className="landing-diagram__img"
                loading="lazy"
              />
            </figure>
          </div>
        </section>

        <section className="section section--alt landing-section" id="vision">
          <div className="container">
            <h2 className="section__title">Vision</h2>
            <p className="section__text landing-prose">
              Coaching Caminos envisions educators as equity-driven leaders
              who advocate for inclusion and bilingualism, affirm
              students&apos; cultural and linguistic assets, critically examine
              inequitable policies, and take sustained action to transform
              educational systems toward social justice.
            </p>
          </div>
        </section>

        <section className="section landing-section" id="purpose">
          <div className="container">
            <h2 className="section__title">Purpose</h2>
            <ul className="landing-purpose-list">
              <li>
                Digital platform providing an equity-driven framework for
                educator development, coaching, and leadership
              </li>
              <li>
                Addresses systemic inequality impacting bi/multilingual
                learners, including those with disabilities
              </li>
              <li>
                Builds educators&apos; critical consciousness and reduces
                inherent bias
              </li>
              <li>Translates educator reflection into actionable practices</li>
              <li>
                Empowers educators to advocate and serve as change agents
              </li>
            </ul>
          </div>
        </section>

        <section
          className="section section--alt landing-section"
          id="core-framework"
        >
          <div className="container">
            <h2 className="section__title">Core framework</h2>
            <p className="section__text">
              The model integrates six interdependent domains of critical
              consciousness:
            </p>
            <ol className="landing-framework-list">
              <li>
                <strong>Knowledge of the Learner</strong> — Commitment to
                developing deep factual and experiential understanding of each
                learner through holistic learning profiles.
              </li>
              <li>
                <strong>Knowledge of Sociopolitical Dynamics</strong> —
                Critically examining sociolinguistic issues impacting emergent
                bi/multilinguals with and without disabilities in curriculum,
                assessment, classroom practices, and broader educational
                systems and policies.
              </li>
              <li>
                <strong>Practice of Teaching</strong> — Designing
                evidence-based instruction to create rigorous, inclusive, and
                supportive learning environments in which all students develop
                high levels of bilingualism, biliteracy, and content knowledge
                to their full human potential.
              </li>
              <li>
                <strong>
                  Practice of Knowing Learners, Families, and Communities
                </strong>{" "}
                — Creation of culturally sustaining learning communities that
                value families&apos; knowledge, languages, and long-term
                aspirations.
              </li>
              
              <li>
                <strong>Knowledge of Self</strong> — Ongoing critical
                reflection on one&apos;s positionality to understand historical
                and ongoing systems of oppression and to identify and mitigate
                implicit biases and practices in one&apos;s own thinking.
              </li>
              <li>
                <strong>Practice of Advocacy</strong> — Taking critical action
                toward addressing systemic issues within the classroom and
                beyond to create inclusive bilingual learning environments that
                are culturally sustaining and promote social justice for all.
              </li>
            </ol>
          </div>
        </section>

        <footer className="footer">
          <div className="container">
            <div className="footer__line" />
            <p className="footer__text landing-footer-cta">
              Ready to begin your Camino?{" "}
              <Link className="dashboard-link" to="/login">
                Log in to the platform
              </Link>
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}

export default LandingPage;
