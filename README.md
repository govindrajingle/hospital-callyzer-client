# Sozo Patient Management UI

React + Material UI frontend for the Sozo hospital backend
(`hospital-callyzer-server`). Connects to real, live API endpoints — nothing
here is mocked.

## Centralized theme

`src/theme/theme.js` is the single source of truth for colors, typography,
and component styling (rounded corners, card borders, button style) across
the entire app. Every future screen should be built using MUI components as-is
(no inline hardcoded colors) so it automatically stays visually consistent
with this theme — matching the existing "Hospital User Hierarchy" dashboard's
blue branded look.

## Getting started

```bash
npm install
cp .env.example .env   # set VITE_API_BASE_URL if your backend isn't on localhost:3000
npm run dev
```

The backend must be running with `CORS_ORIGINS` including this app's origin
(`http://localhost:5173` by default) — see the backend's `.env.example`.

## What's built

- **Login** (`/login`) — real JWT login against `POST /api/auth/login`,
  token persisted in localStorage, session restored on page refresh
- **Patients** (`/patients`) — protected route (redirects to `/login` if not
  authenticated):
  - List all patients, paginated from the backend
  - Search by name or mobile number
  - Register a new patient, including the full duplicate-detection flow:
    if the backend returns 409 (same mobile + date of birth already exists),
    the matching record(s) are shown with a "Register anyway" action that
    resubmits with `confirmDuplicate: true`
  - Edit an existing patient
  - Activate / deactivate a patient

## Structure

```
src/
├── theme/theme.js          → centralized MUI theme
├── api/                    → axios client + one file per backend resource
├── context/AuthContext.jsx → login state, persisted across refresh
├── components/
│   ├── Layout.jsx           → branded app shell (header, user chip, logout)
│   ├── ProtectedRoute.jsx   → redirects to /login if not authenticated
│   └── PatientFormDialog.jsx→ create/edit form + duplicate-warning flow
├── pages/
│   ├── LoginPage.jsx
│   └── PatientsListPage.jsx
└── App.jsx                  → routing
```

## Not yet built

- Hospital / User / Role management screens (the dashboard in the reference
  screenshot) — only Patients is built so far
- Pagination controls in the UI (backend supports `limit`/`offset`, but the
  list page currently just requests the first 100)
