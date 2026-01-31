# Deploy this backend on Hostinger (Express + Node.js)

Use these **exact** settings in hPanel so Hostinger finds your app and runs it.

---

## Important: Hostinger does not auto-start on GitHub push

**Pushing your repo to GitHub does NOT start the app on Hostinger.** You must:

1. **Create/configure the Node.js app** in Hostinger (Websites → Add Website → Node.js Apps → connect your GitHub repo).
2. **Set the build step** so dependencies are installed: **Build command** = `npm install` or `npm run build`.
3. **Set the start file**: **Entry file** = **`server.js`** (or **Start command** = `npm start` / `node server.js`).
4. **Deploy and start from the dashboard**: Click **Deploy** (or **Redeploy**) and, if needed, **Start** the app from the Node.js app dashboard.

Without these steps, the server will not run even if the code is on GitHub.

---

## Quick checklist

Before going live, confirm:

- [ ] **Node.js app is created on Hostinger** – Websites → Add Website → Node.js Apps → connect GitHub repo (or upload).
- [ ] **Dependencies are installed** – Build command = `npm install` or `npm run build`; redeploy so `node_modules` exists.
- [ ] **Server listens on `process.env.PORT`** – This app uses `const PORT = process.env.PORT || 3000` and `app.listen(PORT, '0.0.0.0', ...)`.
- [ ] **App logs checked for runtime errors** – Node.js apps → your app → Logs; fix any "Cannot find module", SyntaxError, or DB errors.
- [ ] **App is started in Hostinger dashboard** – After deploy, use **Redeploy** / **Start** (if shown) so the process is running.

---

## 1. Repository

- Deploy from **GitHub** (this repo).
- Repo is **backend only** – `package.json` and `server.js` are at the **repo root**.

---

## 2. Build configuration (hPanel → Node.js app → Build configuration)

| Setting | Value |
|--------|--------|
| **Framework preset** | Express |
| **Branch** | main |
| **Node version** | 18.x, 20.x, or 22.x |
| **Root directory** | **`/`** or **leave empty** (repo root = backend) |
| **Entry file** | **`server.js`** |
| **Package manager** | npm |
| **Build command** | `npm run build` or `npm install` (must run so `node_modules` exists) |
| **Start command** | `npm start` or `node server.js` |

With a backend-only repo, Root directory must be **`/`** or blank so Hostinger uses the repo root where `package.json` and `server.js` are. The **build step must run** (e.g. `npm install` or `npm run build`) before start, or you get "Cannot find module 'express'" and the app crashes.

---

## 3. Environment variables (hPanel → Node.js app → Environment variables)

Add these (no quotes in values):

| Key | Value |
|-----|--------|
| **DB_HOST** | `127.0.0.1` |
| **DB_PORT** | `3306` |
| **DB_NAME** | Your MySQL database name (e.g. `u977993209_nextprime`) |
| **DB_USER** | Your MySQL username (e.g. `u977993209_nextprime`) |
| **DB_PASSWORD** | MySQL password (use only letters/numbers, no `$` or `;`) |
| **JWT_SECRET** | Long random string |
| **FRONTEND_URL** | `https://nextprimerealestate.com` (or your frontend URL) |
| **CLOUDINARY_CLOUD_NAME** | Your Cloudinary cloud name |
| **CLOUDINARY_API_KEY** | Your Cloudinary API key |
| **CLOUDINARY_API_SECRET** | Your Cloudinary API secret |

Do **not** set `PORT`; the app uses Hostinger’s value.

---

## 4. After saving

1. Click **Save and redeploy** (or Save, then Redeploy).
2. Wait 1–2 minutes.
3. Open **https://api.nextprimerealestate.com/ping** → should return `{"pong":true}`.
4. Open **https://api.nextprimerealestate.com/health** → should return `{"ok":true,"db":true}`.

---

## 5. If you still get 503

- Confirm **Root directory** is **`/`** or **empty** (backend-only repo).
- Confirm **Entry file** is exactly **`server.js`**.
- In MySQL (hPanel), create the DB and user, then run migrations once (e.g. via SSH from `public_html`: `node src/scripts/syncDb.js` and `node src/scripts/seed.js` if Node is in PATH, or use Hostinger support).

---

## 6. App crashed on startup

Check **Hostinger → Node.js apps → your app → Logs** (runtime/application logs, not just deploy logs). Look for:

| Error | Fix |
|-------|-----|
| **Cannot find module 'express'** (or other module) | Build step didn’t run. In Build configuration set **Build command** to **`npm install`** or **`npm run build`**. Redeploy so `node_modules` is created before start. |
| **Cannot find module '../config/database'** | File missing on server. Ensure **`src/config/database.js`** is committed and pushed, then redeploy. |
| **SyntaxError** | Check the file and line number in the log; fix the syntax and redeploy. |
| **Module not found** (any path) | Either add the dependency to `package.json` and redeploy, or fix the require path so the file exists in the repo. |

Ensure **Build command** runs before **Start**: e.g. Build = `npm install` or `npm run build`, Start = `npm start`. Without a successful build, `node_modules` is missing and the app crashes on the first `require()`.
