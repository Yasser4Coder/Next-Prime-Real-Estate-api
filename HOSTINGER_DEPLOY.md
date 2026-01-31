# Deploy this backend on Hostinger (Express + Node.js)

Use these **exact** settings in hPanel so Hostinger finds your app and runs it.

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

With a backend-only repo, Root directory must be **`/`** or blank so Hostinger uses the repo root where `package.json` and `server.js` are.

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
