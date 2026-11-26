# TASKMATE — Full-Stack Project Management Tool (Local Demo)

**CodeAlpha Task 3: Project Management Tool**

This is the **full-stack edition** of the earlier TASKMATE interactive demo. It keeps the clean React UI and adds **Node.js + Express, REST APIs, JWT login, bcryptjs password hashing, and MongoDB models**. It is designed for a **classroom/internship demonstration**, with no MongoDB Atlas account or online database credentials required.

## Features

- Professional responsive React dashboard with live project/task counts.
- Register accounts and sign in through Express with **bcrypt-hashed passwords and signed JWT tokens**.
- One-click sample workspace login: `demo@taskmate.test` / `Demo@12345`.
- Project create/edit/delete, team members, status, ownership, and colors.
- Task create/edit/delete; priorities, deadlines, assignees, labels, and checklists.
- Kanban board with drag-and-drop status changes, list view and search/filter.
- Task discussion/comments, activity history, and assignment notifications.
- My Tasks page, profile settings, workspace settings and JSON export.
- Demo-member switching (clearly marked **presentation-only impersonation**).
- Sample workspace seeds **5 team members, 3 projects and 16 tasks** automatically.
- Backend API stores changes in separate **MongoDB collections** in MongoDB modes.

## What is different from the frontend-only version?

All major UI actions communicate with Express through authenticated API calls. The frontend does **not** save projects or comments in browser localStorage. A browser session token is stored in `sessionStorage`. The backend stores the workspace in **MongoDB Memory Server** by default. The optional file-storage fallback is explained below.

### Database: no Atlas account required

**Default mode — `memory`:** The backend starts `mongodb-memory-server`, which runs a **real temporary MongoDB** database on your PC. MongoDB binaries are downloaded the **first time** (internet required) and then cached. It **does not** require MongoDB Compass, Atlas, a URI, or a separate database installation. **Stopping/restarting the backend loses the temporary MongoDB data** and the sample workspace automatically returns.

**Automatic fallback — `file`:** If the MongoDB binary cannot be downloaded/started (for example, blocked network/antivirus), the backend *automatically* switches to a local JSON datastore `backend/data/.local-demo-data.json`. The website and REST endpoints still work, and JSON data survives restarts. **This fallback is not MongoDB** and does not meet a strict MongoDB-storage requirement. The backend console and Settings page show which mode is active.

**Optional Atlas mode — `atlas`:** You can set `DB_MODE=atlas` and provide `MONGODB_URI` in backend `.env`, but this is NOT needed for the default demo.

## Windows quick start (beginner friendly)

1. Extract `TASKMATE_FULLSTACK_DEMO.zip`. It is packed **without an extra nested TASKMATE folder**, so the extracted folder contains `package.json`, `frontend`, `backend` and `START_FULLSTACK.bat` directly.
2. Open the **extracted folder** in VS Code (`File > Open Folder`).
3. Double-click **`START_FULLSTACK.bat`**. It installs the project's npm packages when needed and starts both servers in one terminal.
4. Keep the terminal open; **wait for the backend to print `TASKMATE API: http://localhost:5000/api/health`**. On the first startup MongoDB may need to download its binary.
5. Open **http://localhost:5173** in your browser (use the URL Vite prints if different).
6. Click **Explore demo workspace** or sign in with the credentials shown on the login page.

### VS Code terminal — simplest method

With VS Code opened **in the extracted folder**, run:

```cmd
npm install
npm run dev
```

This uses npm workspaces and starts **both frontend and backend together**. `package.json` is in this folder, so you will not get the `ENOENT package.json` error.

### Alternative: run in two VS Code terminals

**Terminal 1 — backend**:

```cmd
cd backend
npm install
npm run dev
```

**Terminal 2 — frontend**:

```cmd
cd frontend
npm install
npm run dev
```

**Important folder path:** If the terminal shows `...\TASKMATE_FULLSTACK_DEMO>`, you are already at the correct root folder. Just run `npm install` and `npm run dev`. No `cd TASKMATE` needed.

Node.js **20 or newer** is recommended; this project uses only JavaScript (no TypeScript). Internet is needed the first time to install npm packages. First MongoDB startup may also download the database binary.

### If MongoDB fails to download

The app automatically falls back to JSON storage and will display a console warning. To force the lightweight fallback for an offline presentation:

1. Go to `TASKMATE/backend`.
2. Copy `.env.example` to `.env` using `copy .env.example .env`.
3. Change `DB_MODE=memory` to `DB_MODE=file` in `.env`.
4. Restart backend. File mode **still uses Express, JWT, bcrypt and REST APIs**, but not MongoDB.

To use real temporary MongoDB again, change back to `DB_MODE=memory`, then restart the backend when internet is available.

## Folder layout

```text
TASKMATE_FULLSTACK_DEMO/ (extracted ZIP root)
├── package.json  (npm workspaces; start both servers)
├── START_FULLSTACK.bat
├── README.md
├── .gitignore
├── frontend/
│   ├── RUN_FRONTEND.bat
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   ├── src/
│   │   ├── App.jsx, main.jsx
│   │   ├── components/      (shell, cards, dialogs, task modal)
│   │   ├── context/         (API-backed WorkspaceContext)
│   │   ├── services/api.js  (authenticated HTTP client)
│   │   ├── pages/           (dashboard, projects, tasks, team, etc.)
│   │   ├── styles/app.css
│   │   └── utils/
│   └── tests/
└── backend/
    ├── RUN_BACKEND.bat
    ├── package.json
    ├── .env.example
    ├── server.js
    ├── config/store.js
    ├── lib/validation.js
    ├── middleware/auth.js
    ├── models/             (User, Project, Task, Activity, Notification, Workspace)
    ├── routes/             (auth, workspace and REST resources)
    ├── data/               (auto-generated sample data)
    ├── tests/              (unit tests and live API smoke test)
    └── utils/
```

## API reference (port 5000)

The routes below are genuine Express routes, not fake UI mock functions.

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | Backend status and database mode |
| POST | `/api/auth/register` | Create hashed-password user |
| POST | `/api/auth/login` | Get JWT after verifying password |
| POST | `/api/auth/demo` | Sign in as seeded demo admin |
| POST | `/api/auth/switch-demo-user` | Presentation-only change of user |
| GET | `/api/auth/me` | Validate JWT and get current user |
| GET / PUT | `/api/workspace` | Read/save full workspace snapshot |
| POST | `/api/workspace/reset-demo` | Restore sample workspace |
| GET / POST | `/api/projects` | Get/create projects |
| PATCH / DELETE | `/api/projects/:id` | Update/delete project |
| GET / POST | `/api/tasks` | Get/create tasks |
| PATCH / DELETE | `/api/tasks/:id` | Update/delete task |
| POST | `/api/tasks/:id/comments` | Add task comment |
| GET | `/api/team` | List team members |
| GET | `/api/activity` | Activity log |
| GET | `/api/notifications` | Personal notifications |
| PATCH | `/api/notifications/:id/read` | Mark notification read |

Except for `/health`, `/auth/login`, `/auth/register` and `/auth/demo`, API endpoints require `Authorization: Bearer YOUR_JWT`.

The React interface uses the *workspace snapshot* endpoint to preserve the original synchronous drag/drop experience; the backend also offers separate REST project/task/comment endpoints. This is a **local demo architecture**: whole-workspace saves are serialized per server, but concurrent editing by independent browser tabs may overwrite another tab's changes. There is no WebSocket real-time collaboration.

## Test the app

Backend unit tests:

```cmd
cd backend
npm test
```

Frontend demo-helper tests:

```cmd
cd frontend
npm test
npm run build
```

**Live API smoke test:** Start the backend, then from a **new backend terminal** run:

```cmd
node tests/smoke-api.js
```

It checks health, demo auth, project creation, task creation/update, comments, persistent API reads, and project deletion. **It resets the sample workspace at the end**, so only run it before your presentation, not after entering work you want to keep.

Suggested manual browser test:

1. Sign in as demo admin and verify all 3 sample projects.
2. Create `College Event Planner` from Projects.
3. Add two tasks; drag a task to In progress.
4. Edit an assignment, add a checklist item, and post a comment.
5. Open My Tasks, Team, Activity and Notifications.
6. Refresh browser. In file/Atlas mode data stays; in memory mode it stays **until the backend is restarted**.
7. Create and sign into a new account. Test logout/login.
8. Look at **Settings → Database mode**, or visit http://localhost:5000/api/health.

## Demo walkthrough (2–3 minutes)

Login → Dashboard → Projects → Website Redesign → Drag a task → Open task details → Assign team member → Post a comment → Notifications → My Tasks → Activity → Create a new project. Mention the Express API and the local database mode visible in Settings.

## Security and presentation limitations

- Account passwords are hashed in backend with bcrypt; JWTs are signed server-side. Do **not** share or commit real JWT secrets.
- For easy demonstration, `/api/auth/demo`, `/api/auth/switch-demo-user`, and workspace reset bypass normal real-world team permissions. **Never expose this demo backend on a public internet host.**
- This is a presentation build, not production multi-tenant software. It does not implement invitation email, real-time synchronization, account recovery, CSRF-token patterns for cookie auth (it uses Bearer JWT instead), or robust multi-user concurrency controls.
- File mode stores user password hashes in a local server-side JSON file. It does **not** store plaintext passwords.
- No external payment, email, or hosted MongoDB services are required.

## Troubleshooting

**`ENOENT package.json`:** Open the extracted folder containing root `package.json`; do not run npm in `Downloads` or a different parent directory.

**`Cannot find module 'express'` or `'dotenv'`:** Run `npm install` in the **backend** folder.

**`VITE` command not recognized:** Run `npm install` in **frontend** folder.

**`Failed to fetch` on login:** Backend is not running yet, MongoDB is still starting, or port 5000 is busy. Check the backend terminal and http://localhost:5000/api/health.

**`querySrv ENOTFOUND YOUR_CLUSTER`:** You are using old Atlas placeholder config. This edition uses local memory DB automatically; do not enter `YOUR_CLUSTER`.

**MongoDB download blocked:** Set `DB_MODE=file` for a guaranteed local fallback; explicitly describe it as a JSON-backed API demo, not MongoDB.

**Port 5173 in use:** Use the URL Vite prints, usually 5174. Port 5000 in use? Change `PORT=5001` in backend `.env` and `VITE_API_URL=http://localhost:5001/api` in frontend `.env`, then restart both.

**Node 26 / esbuild postinstall warning:** If Vite fails because esbuild was blocked, try `npm rebuild esbuild` in `frontend` and re-run `npm run dev`.
