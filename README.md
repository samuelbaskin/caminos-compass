# Caminos Compass

Web application for **The Coaching Camino**: a structured coaching workflow for educators working through six reflection “Pasos” (steps), with optional AI-generated lesson plans. Teachers manage **coaching cycles**, student rosters, and submissions; **coaches** and **admins** have separate dashboards for oversight.

## Tech stack

| Layer | Technology |
|--------|------------|
| Frontend | React 19 (Create React App), React Router |
| Backend | Node.js, Express 5 |
| Database | MongoDB (Mongoose) |
| Auth | JWT (Bearer tokens), role-based access |
| AI | Google Gemini (`@google/genai`) for lesson plan generation and writing-sample evaluation |

## Repository layout

- **`my-app/`** — React client. In development it proxies API requests to `http://localhost:5000` (see `package.json` `proxy`).
- **`server/`** — Express API (`index.js`), Mongoose models, routes, middleware, Gemini integration.
- **`api/`** — Vercel serverless entry that re-exports the Express app from `server/` for deployment.

## Roles

- **Teacher** — Cycles, Pasos 1–6 per coaching stage, students, lesson plans (draft / AI-generated / finalized).
- **Coach** — View teachers and cycle/Paso summaries, lesson plans, evaluations.
- **Admin** — User management, full cycle and lesson plan visibility.

## Coaching model (high level)

- **Stages** — Each cycle separates work into three contexts: **Pre Conference**, **Observation**, and **Post Conference / Reflection**. Paso submissions and lesson plans are scoped by `stage` so data for one phase does not overwrite another.
- **Pasos 1–6** — Framework sections (e.g. knowledge of self, learner profiles, teaching practice, sociopolitical dynamics, community, advocacy). The teacher UI loads and saves Paso data per selected stage.
- **Lesson plans** — Create a **blank draft** or **generate** from the current stage’s Paso data (generation does not require completing all fields). Plans store a snapshot of inputs used for generation.

## Prerequisites

- Node.js (LTS recommended)
- MongoDB (local or hosted URI)

## Environment variables

Configure the **server** (e.g. `server/.env` for local runs; Vercel/hosting dashboard in production).

| Variable | Purpose |
|----------|---------|
| `MONGO_URI` | MongoDB connection string (default local: `mongodb://localhost:27017/caminos-compass`) |
| `JWT_SECRET` | Secret for signing JWTs |
| `GEMINI_API_KEY` | Google AI API key for Gemini features |
| `PORT` | API port (default `5000`) |
| `CLIENT_ORIGIN` | Comma-separated allowed origins for CORS in production |
| `VERCEL` | Set by Vercel; enables lazy DB connect and serverless behavior |

For the **React app**, when the API is not on the same origin/proxy, set:

- `REACT_APP_API_URL` — Base URL of the API (no trailing slash), e.g. `https://your-api.example.com`.

## Local development

1. Install server dependencies and start the API:

   ```bash
   cd server
   npm install
   npm start
   ```

   API listens on `http://localhost:5000` by default. Health check: `GET http://localhost:5000/api/health`.

2. In another terminal, install and start the client:

   ```bash
   cd my-app
   npm install
   npm start
   ```

   The app opens on `http://localhost:3000` and proxies `/api` to the server in development.

## Production build (frontend only)

```bash
cd my-app
npm run build
```

Serve the `my-app/build` folder with any static host; point `REACT_APP_API_URL` at your deployed API if it is not same-origin.

## Deployment notes

- **Vercel** — The `api/` handler loads `server/index.js`. Ensure `MONGO_URI`, `JWT_SECRET`, and `GEMINI_API_KEY` are set in the project environment.
- **CORS** — Non-development environments restrict origins when `CLIENT_ORIGIN` is set; include your production web app URL.

## API overview (prefix `/api`)

- **`/auth`** — Register, login, session.
- **`/cycles`** — Teacher coaching cycles; Paso read/write with optional `stage` query/body; **`/cycles/:id/progress`** for per-stage and total completion.
- **`/students`** — Roster and writing samples (per cycle).
- **`/lesson-plans`** — List/create draft, generate, get/update/delete by id.
- **`/coaches`** — Coach-facing teacher/cycle views.
- **`/admin`** — Admin user and cycle management.

## License

Private project; no license file is included unless added by the maintainers.
