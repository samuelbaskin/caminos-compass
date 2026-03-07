---
name: Home page navigation bar
overview: Add a top navigation bar to the home page with branding and two options—Teachers and Coach—using the existing green theme. Nav links will target new in-page sections so no router is required.
todos: []
isProject: false
---

# Home Page Navigation Bar

## Current state

- Single-page app in [my-app/src/App.js](my-app/src/App.js): no router, no existing header/nav.
- Layout is `<main className="page">` with hero, overview, and features sections.
- Styling in [my-app/src/App.css](my-app/src/App.css) uses green theme variables (`--accent`, `--panel-subtle`, etc.).

## Approach

Add a **static top nav** above the existing content (no `react-router`). The two options will be **Teachers** and **Coach**, linking to new in-page sections so the nav is functional without new dependencies.

## 1. Markup and structure (App.js)

- Wrap the app in a fragment or a wrapper and insert a **nav** before `<main>`.
- Nav structure:
  - **Left:** Site branding (e.g. “Coaching Caminos” as a link to `#` or `#overview`).
  - **Right:** Two links — “Teachers” (e.g. `href="#teachers"`) and “Coach” (e.g. `href="#coach"`).
- Add two minimal **sections** so the links have targets:
  - `<section id="teachers">` and `<section id="coach">` with a short heading and placeholder text (you can refine copy later).

## 2. Styles (App.css)

- **Nav container:** Full-width bar, flex layout, aligned to existing `.container` max-width for the inner content; background using `var(--panel)` or `var(--panel-subtle)`, bottom border using `var(--border)`.
- **Brand:** Bold text, optional green accent for “Coaching”; no structural change to the rest of the page.
- **Nav links:** Spaced links (e.g. gap between “Teachers” and “Coach”), font weight and size consistent with the rest of the site; **active/hover** using `var(--accent)` (e.g. underline or color change).
- **Responsive:** Stack or collapse nav on small screens only if needed (optional: hamburger or single-row wrap).

## 3. Outcome

- Nav bar fixed at the top of the home page with “Coaching Caminos” + Teachers | Coach.
- Clicking “Teachers” or “Coach” scrolls to the corresponding section on the same page.
- Visual style matches the existing green theme and does not change the structure of the hero, overview, or features sections.

## Optional later

- If you want **separate pages** for Teachers and Coach, we can add `react-router-dom` and replace these sections with routes like `/teachers` and `/coach`.

