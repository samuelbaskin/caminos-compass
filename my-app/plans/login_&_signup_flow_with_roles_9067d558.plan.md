---
name: Login & signup flow with roles
overview: Make the app default to a login page that matches the provided Coaching Caminos design, with role-aware login (teacher, coach, admin) and a signup flow (teacher/coach) backed by MongoDB-friendly API endpoints.
todos: []
isProject: false
---

## Goal

Implement a **default login experience** that looks like the provided mock, lets users log in as **teacher, coach, or admin**, and supports a **signup flow for teacher/coach** (admin created separately). Design corresponding **MongoDB-backed API endpoints** for signup and login.

---

## Frontend plan (React app)

### 1. App structure & routing

- Keep the app entry in `[my-app/src/index.js](my-app/src/index.js)` the same, still rendering `<App />`.
- In `[my-app/src/App.js](my-app/src/App.js)`:
  - Introduce two high-level views:
    - `LoginPage` (new component) – **default view** shown on first load.
    - `HomePage` – wraps the existing content (current header + hero + sections) so existing work remains intact.
  - Use simple **local state** first (e.g. `const [user, setUser] = useState(null);`) to switch between pages:
    - If `user == null` → render `LoginPage`.
    - If `user != null` → render `HomePage`.
  - Later, this can be swapped for a router or global auth context without changing the basic layout.

### 2. Login page UI

- Create `[my-app/src/LoginPage.js](my-app/src/LoginPage.js)` with:
  - **Top bar**: brand row matching the screenshot (left-aligned `Coaching Caminos` logo/title; right-aligned small link text like `Teacher Portal Access`). Reuse/extend existing header styles where possible.
  - **Centered card** (form container):
    - Uses the same green-accent visual language (rounded card, light shadow, subtle green gradient background behind it).
    - Title: “Welcome back, Educator” + supporting subtitle text.
    - **Inputs**: Email, Password.
    - **Login role selector**: three options **Teacher**, **Coach**, **Admin**.
      - Implementation: either three pill buttons or segmented control above the Login button.
      - Selected role stored in component state (`loginRole: 'teacher' | 'coach' | 'admin'`).
    - **Login button**: full-width bright green button (e.g. “Login as Teacher/Coach/Admin” – text changes based on selected role).
    - Ancillary items (can be non-functional initially): “Forgot Password?”, “Stay signed in for 30 days” checkbox, footer line (`Need help? Contact Support`).
  - Below the card (or as text under the button), include: “Don’t have an account? Sign up” which switches to the signup form.

### 3. Signup page UI

- In the same `LoginPage` component or a sibling `SignupPage`, implement a **signup form** toggled by local state (no external routing required):
  - Fields (as specified): **First Name**, **Last Name**, **Email**, **Password**.
  - **Role selector** (teacher vs coach only):
    - Radio buttons or pill toggles with values `teacher` and `coach`.
    - Admin is **not** shown here because those accounts are created separately.
  - Submit button: e.g. “Create Account”.
  - After successful signup, automatically switch back to the login view and optionally show a short success message.
- Layout and visual style reuses the same card styling as the login form so they feel like two states of the same screen.

### 4. Styling

- Continue using the existing green theme in `[my-app/src/App.css](my-app/src/App.css)` and `[my-app/src/index.css](my-app/src/index.css)`:
  - Ensure the body background for the login screen uses a very light green gradient, similar to the new mock.
  - Add styles for:
    - `.auth-page`, `.auth-card`, `.auth-header`, `.auth-input`, `.auth-role-toggle`, `.auth-role-pill`, `.auth-footer`.
    - Focus and error states for inputs (border turns green or red; subtle shadows).
  - Keep the **home page structure unchanged**; its header/hero should still look as designed, just not be visible until after login.

### 5. Wiring to the backend

- For now, stub the network calls in the frontend with functions that call the future endpoints, e.g. in `[my-app/src/api/auth.js](my-app/src/api/auth.js)`:
  - `signup({ firstName, lastName, email, password, role })` → `POST /api/auth/signup`.
  - `login({ email, password, role })` → `POST /api/auth/login`.
- Handle success and failure states in `LoginPage`:
  - On **signup success**: show a toast/message “Account created, please log in” and switch to login state.
  - On **login success**: store returned user + token in memory (and optionally `localStorage`) and call `setUser` in `App`.

---

## Backend plan (Node/Express + MongoDB)

Assuming a simple Node/Express service with Mongoose for MongoDB. If your backend stack differs later, these structures can be translated.

### 1. Data model

- Collection: `users`.
- Schema fields:
  - `_id` – ObjectId (from Mongo).
  - `firstName` – string, required.
  - `lastName` – string, required.
  - `email` – string, required, **unique**, stored lowercase.
  - `passwordHash` – string (bcrypt hash), required.
  - `role` – string enum: `'teacher' | 'coach' | 'admin'`.
    - For **signup**, only `'teacher'` or `'coach'` are accepted.
    - `'admin'` users are seeded or created via an internal/admin tool.
  - `createdAt`, `updatedAt` – timestamps.
- Example Mongoose model in `[server/models/User.js](server/models/User.js)` (if you adopt this structure).

### 2. Auth utilities

- In `[server/utils/auth.js](server/utils/auth.js)`:
  - Use **bcrypt** for password hashing:
    - `hashPassword(plain)`.
    - `verifyPassword(plain, hash)`.
  - Use **JWT** for session tokens:
    - `signToken({ userId, role })` with a secret from env; shortish expiry (e.g. 1h) and refresh tokens later if needed.

### 3. Signup endpoint

- **Route:** `POST /api/auth/signup`.
- **Body:**

```json
  {
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "password": "string",
    "role": "teacher" | "coach"
  }
  

```

- **Validation & behavior:**
  - Ensure all fields are present; trim and lowercase `email`.
  - Validate `role` is either `teacher` or `coach`; reject `'admin'` here.
  - Check for existing user with same email; if found, return `409 Conflict` with a clear message.
  - Hash password with bcrypt and store as `passwordHash`.
  - Save new user document.
  - **Response:** `201 Created` with a minimal payload (no password hash), e.g.:

```json
    {
      "user": {
        "id": "...",
        "firstName": "...",
        "lastName": "...",
        "email": "...",
        "role": "teacher"
      }
    }
    

```

- Do **not** auto-login on signup; the frontend, upon `201`, redirects/switches back to the login form, matching your requirement.

### 4. Login endpoint

- **Route:** `POST /api/auth/login`.
- **Body:**

```json
  {
    "email": "string",
    "password": "string",
    "role": "teacher" | "coach" | "admin"
  }
  

```

- **Validation & behavior:**
  - Require all three fields.
  - Lookup user by lowercase email.
  - If not found, return `401 Unauthorized` with generic message.
  - Verify `password` with bcrypt; on mismatch, return `401`.
  - Compare requested `role` with stored `user.role`:
    - If they differ (e.g., user is `teacher` but tries `admin`), return `403 Forbidden` or `401` with generic message.
  - On success, sign a JWT containing at least `userId` and `role`.
  - **Response:** `200 OK` with:

```json
    {
      "token": "<jwt>",
      "user": {
        "id": "...",
        "firstName": "...",
        "lastName": "...",
        "email": "...",
        "role": "teacher"
      }
    }
    

```

### 5. Admin user creation

- Provide a separate script or protected endpoint to create the first admin account:
  - Example script `[server/scripts/createAdmin.js](server/scripts/createAdmin.js)` that reads credentials from env and inserts a user with `role: 'admin'`.
  - Future admin management can happen from an authenticated admin UI.

### 6. Auth middleware (for later screens)

- Implement `requireAuth` middleware in `[server/middleware/auth.js](server/middleware/auth.js)`:
  - Extract JWT from `Authorization: Bearer <token>` header.
  - Verify token and attach `{ userId, role }` to `req.user`.
  - Optionally provide `requireRole('admin')`/`requireRole(['coach','admin'])` helpers for route-level protection.
- When you later build teacher/coach/admin dashboards, the frontend will send the token on API calls, and the backend will authorize based on `role`.

---

## Flow summary

1. **Initial load**: User hits `/` → `App` renders `LoginPage` by default.
2. **Signup**:
  - User switches to signup view, enters first name, last name, email, password, selects **Teacher** or **Coach**.
  - Frontend calls `POST /api/auth/signup`.
  - On success (201), UI shows a confirmation and returns to login state.
3. **Login**:
  - User selects login role (Teacher/Coach/Admin), enters email & password.
  - Frontend calls `POST /api/auth/login` with the chosen `role`.
  - On success, token + user info are stored; `App` sets `user` state and shows the existing homepage (or, later, a role-specific dashboard).
4. **Admin**: Admin accounts are not created via the public signup form; they’re inserted via script or restricted tools and then log in the same way as other roles.

This plan keeps your current homepage intact, adds a new login/signup experience that matches the mock, and defines clear MongoDB-friendly auth endpoints and data structures for teacher/coach/admin roles.