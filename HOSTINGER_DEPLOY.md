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
| **Root directory** | **`public_html`** (no trailing slash; see note below) |
| **Entry file** | **`server.js`** (no leading slash) |
| **Package manager** | npm |
| **Build command** | `npm install` or `npm run build` |
| **Start command** | `npm start` or `node server.js` |

**Critical – avoid double slash:** If you see `Cannot find module '.../public_html//server.js'` in stderr.log, the path has a double slash. In hPanel set **Root directory** to **`public_html`** (no trailing `/`) and **Entry file** to **`server.js`** (no leading `/`).

**Where your files are:** If you deploy via Git, Hostinger may put the repo in `public_html`. From SSH run `ls -la ~/domains/server.nextprimerealestate.com/public_html` and confirm `server.js` and `package.json` are there. If they are in a subfolder (e.g. `public_html/backend`), set Root to **`public_html/backend`** and Entry to **`server.js`**.

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

**PORT bug (common):** The app must use `process.env.PORT` with a **fallback** (e.g. `parseInt(process.env.PORT, 10) || 3000`). If you had `const PORT = process.env.PORT` with no fallback and Hostinger didn’t set PORT, the app could listen on `undefined` and the proxy would get 503. This is now fixed in `server.js`.

**Isolate the crash:** Set **Entry file** to **`server.minimal.js`** and redeploy.  
- If **https://your-api/ping** returns `{"pong":true}` → Hostinger is fine; switch back to **Entry file** = **`server.js`** and check Logs.  
- If you still get 503 and **`minimal-started.txt` is not in `public_html`** → Hostinger is likely **not running your entry file** (wrong path or start command).

**Find where Node runs (SSH):** The minimal server writes `minimal-started.txt` and `deploy-info.txt` in both the script dir and process cwd. Search your whole home:

```bash
find /home/$USER -name "minimal-started.txt" 2>/dev/null
find /home/$USER -name "deploy-info.txt" 2>/dev/null
```

- **No files anywhere** → Node is not starting; check hPanel → Node.js apps → your app → **Logs** (Entry file, Root directory, Build/Start command).
- **Files in another path** → That is the app run directory; ensure your domain is pointed at this Node app in hPanel.

**Checklist:** Root directory **`/`** or empty; Entry file **`server.js`** (or **`server.minimal.js`** for test); Build = **`npm install`**; Start = **`npm start`** or **`node server.js`**; app **Deployed** and **Started** in the dashboard. MySQL: create DB/user in hPanel, then run migrations once (e.g. SSH: `node src/scripts/syncDb.js`).

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

---

## 7. stderr.log: "chdir ENOENT" and "Cannot find module ... public_html//server.js"

If **stderr.log** shows:

- **`Error setting directory to: ... public_html/: ENOENT: no such file or directory, chdir ... -> '.../public_html/'`**
- **`Cannot find module '.../public_html//server.js'`**

do this:

1. **Remove the double slash:** In hPanel → Node.js app → Build configuration set **Root directory** to **`public_html`** (no trailing slash) and **Entry file** to **`server.js`** (no leading slash). Save and redeploy.

2. **Confirm the path exists:** From SSH run:
   ```bash
   ls -la /home/u977993209/domains/server.nextprimerealestate.com/public_html/
   ```
   You must see `server.js` and `package.json` there. If your backend is in a subfolder (e.g. you have `public_html/backend/server.js`), set Root to **`public_html/backend`** and Entry to **`server.js`**.

3. **If chdir ENOENT persists:** The Node runner may expect a different path format. In hPanel try Root directory as **`domains/server.nextprimerealestate.com/public_html`** (relative to your home) if there is no “full path” option. If your panel has an “Application root” or “Document root” that expects a full path, use exactly: **`/home/u977993209/domains/server.nextprimerealestate.com/public_html`** (no trailing slash).
