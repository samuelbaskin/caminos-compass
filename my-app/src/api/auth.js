const BASE_URL = process.env.REACT_APP_API_URL || "";

async function request(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new Error(
      res.status === 404
        ? "API endpoint not found. Is the server running?"
        : `Server returned non-JSON response (${res.status}). Is the backend running on port 5000?`
    );
  }

  const data = await res.json();

  if (!res.ok) {
    const message =
      data?.message ||
      (res.status === 409
        ? "An account with that email already exists."
        : res.status === 401
        ? "Invalid email, password, or role."
        : res.status === 403
        ? "You do not have permission to log in with that role."
        : "Something went wrong. Please try again.");
    throw new Error(message);
  }

  return data;
}

/**
 * Sign up a new teacher or coach account.
 * Returns { user: { id, firstName, lastName, email, role } }
 */
export async function signup({ firstName, lastName, email, password, role }) {
  return request("/api/auth/signup", { firstName, lastName, email, password, role });
}

/**
 * Log in with credentials and role.
 * Returns { token, user: { id, firstName, lastName, email, role } }
 * Also persists token + user in localStorage for session persistence.
 */
export async function login({ email, password, role }) {
  const data = await request("/api/auth/login", { email, password, role });
  if (data.token) {
    localStorage.setItem("cc_token", data.token);
    localStorage.setItem("cc_user", JSON.stringify(data.user));
  }
  return data;
}

/**
 * Returns the currently stored user from localStorage, or null.
 */
export function getStoredUser() {
  try {
    const raw = localStorage.getItem("cc_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Clears the stored session.
 */
export function logout() {
  localStorage.removeItem("cc_token");
  localStorage.removeItem("cc_user");
}
