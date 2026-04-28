import { useState } from "react";
import { Link } from "react-router-dom";
import { login, signup } from "./api/auth";

const LOGIN_ROLES = ["teacher", "coach", "admin"];
const SIGNUP_ROLES = ["teacher", "coach"];

function RoleToggle({ value, options, onChange }) {
  return (
    <div className="auth-role-toggle" role="radiogroup" aria-label="Select role">
      {options.map((role) => (
        <button
          key={role}
          type="button"
          className={
            "auth-role-pill" + (value === role ? " auth-role-pill--active" : "")
          }
          onClick={() => onChange(role)}
          aria-pressed={value === role}
        >
          {role === "teacher"
            ? "Teacher"
            : role === "coach"
            ? "Coach"
            : "Admin"}
        </button>
      ))}
    </div>
  );
}

function LoginPage({ onLogin }) {
  const [mode, setMode] = useState("login"); // 'login' | 'signup'
  const [loginRole, setLoginRole] = useState("teacher");
  const [signupRole, setSignupRole] = useState("teacher");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const handleLoginChange = (evt) => {
    const { name, value } = evt.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignupChange = (evt) => {
    const { name, value } = evt.target;
    setSignupForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLoginSubmit = async (evt) => {
    evt.preventDefault();
    setError("");
    setStatus("");
    setLoading(true);

    try {
      const { user } = await login({
        email: loginForm.email,
        password: loginForm.password,
        role: loginRole,
      });
      setLoading(false);
      onLogin(user);
    } catch (err) {
      setLoading(false);
      setError(err.message || "Unable to log in. Please try again.");
    }
  };

  const handleSignupSubmit = async (evt) => {
    evt.preventDefault();
    setError("");
    setStatus("");
    setLoading(true);

    try {
      await signup({
        firstName: signupForm.firstName,
        lastName: signupForm.lastName,
        email: signupForm.email,
        password: signupForm.password,
        role: signupRole,
      });
      setLoading(false);
      setStatus("Account created. Please log in with your credentials.");
      setMode("login");
      setLoginForm({
        email: signupForm.email,
        password: "",
      });
      setLoginRole(signupRole);
    } catch (err) {
      setLoading(false);
      setError(err.message || "Unable to sign up. Please try again.");
    }
  };

  return (
    <div className="auth-page">
      <header className="site-header auth-header">
        <div className="container site-header__inner">
          <Link
            to="/"
            className="brand auth-header__brand"
            aria-label="Back to Coaching Caminos Compass home"
          >
            <div className="brand__logo">CC</div>
            <div className="brand__text">
              <span className="brand__title">Coaching Caminos Compass</span>
              <span className="brand__subtitle">
                Equity-driven educator development
              </span>
            </div>
          </Link>

          <nav className="nav-links auth-header__nav" aria-label="Primary">
            <a className="nav-link" href="/#overview">
              Overview
            </a>
            <a className="nav-link" href="/#vision">
              Vision
            </a>
            <a className="nav-link" href="/#core-framework">
              Core framework
            </a>
            <Link className="nav-link auth-header__back" to="/">
              <span aria-hidden="true">←</span>
              <span>Back to home</span>
            </Link>
          </nav>
        </div>
      </header>

      <main className="auth-shell">
        <div className="auth-card">
          <div className="auth-card__icon">
            <span className="auth-card__icon-inner">👤</span>
          </div>

          {mode === "login" ? (
            <>
              <h1 className="auth-title">Welcome back, Educator</h1>
              <p className="auth-subtitle">
                Empowering educators, one step at a time. Please sign in to
                manage your classes.
              </p>

              {error && <p className="auth-message auth-message--error">{error}</p>}
              {status && (
                <p className="auth-message auth-message--success">{status}</p>
              )}

              <form className="auth-form" onSubmit={handleLoginSubmit}>
                <div className="auth-field">
                  <label htmlFor="login-email">Email Address</label>
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={loginForm.email}
                    onChange={handleLoginChange}
                    className="auth-input"
                  />
                </div>

                <div className="auth-field auth-field--with-link">
                  <div>
                    <label htmlFor="login-password">Password</label>
                  </div>
                  <a href="#forgot" className="auth-link auth-link--small">
                    Forgot Password?
                  </a>
                  <input
                    id="login-password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={loginForm.password}
                    onChange={handleLoginChange}
                    className="auth-input"
                  />
                </div>

                <div className="auth-field auth-field--inline">
                  <label className="auth-checkbox">
                    <input type="checkbox" />
                    <span>Stay signed in for 30 days</span>
                  </label>
                </div>

                <RoleToggle
                  value={loginRole}
                  options={LOGIN_ROLES}
                  onChange={setLoginRole}
                />

                <button className="auth-primary-btn" type="submit" disabled={loading}>
                  {loading ? "Logging in..." : `Login as ${
                    loginRole === "teacher"
                      ? "Teacher"
                      : loginRole === "coach"
                      ? "Coach"
                      : "Admin"
                  }`}
                </button>
              </form>

              <div className="auth-footer">
                <span>Need help?</span>{" "}
                <button
                  type="button"
                  className="auth-link-button"
                  onClick={() => window.open("mailto:support@caminos.edu", "_blank")}
                >
                  Contact Support
                </button>
              </div>

              <div className="auth-switch">
                <span>Don&apos;t have an account?</span>{" "}
                <button
                  type="button"
                  className="auth-link-button"
                  onClick={() => {
                    setMode("signup");
                    setError("");
                    setStatus("");
                  }}
                >
                  Sign up
                </button>
              </div>
            </>
          ) : (
            <>
              <h1 className="auth-title">Create your account</h1>
              <p className="auth-subtitle">
                Sign up as a teacher or coach to begin your Coaching Camino.
              </p>

              {error && <p className="auth-message auth-message--error">{error}</p>}

              <form className="auth-form" onSubmit={handleSignupSubmit}>
                <div className="auth-grid-two">
                  <div className="auth-field">
                    <label htmlFor="signup-firstName">First Name</label>
                    <input
                      id="signup-firstName"
                      name="firstName"
                      type="text"
                      required
                      value={signupForm.firstName}
                      onChange={handleSignupChange}
                      className="auth-input"
                    />
                  </div>
                  <div className="auth-field">
                    <label htmlFor="signup-lastName">Last Name</label>
                    <input
                      id="signup-lastName"
                      name="lastName"
                      type="text"
                      required
                      value={signupForm.lastName}
                      onChange={handleSignupChange}
                      className="auth-input"
                    />
                  </div>
                </div>

                <div className="auth-field">
                  <label htmlFor="signup-email">Email Address</label>
                  <input
                    id="signup-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={signupForm.email}
                    onChange={handleSignupChange}
                    className="auth-input"
                  />
                </div>

                <div className="auth-field">
                  <label htmlFor="signup-password">Password</label>
                  <input
                    id="signup-password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={signupForm.password}
                    onChange={handleSignupChange}
                    className="auth-input"
                  />
                </div>

                <div className="auth-field">
                  <span className="auth-label">Role</span>
                  <RoleToggle
                    value={signupRole}
                    options={SIGNUP_ROLES}
                    onChange={setSignupRole}
                  />
                </div>

                <button className="auth-primary-btn" type="submit" disabled={loading}>
                  {loading ? "Creating account..." : "Create Account"}
                </button>
              </form>

              <div className="auth-switch">
                <span>Already have an account?</span>{" "}
                <button
                  type="button"
                  className="auth-link-button"
                  onClick={() => {
                    setMode("login");
                    setError("");
                    setStatus("");
                  }}
                >
                  Log in
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default LoginPage;

