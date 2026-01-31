# Next Prime Real Estate – Backend

Express (ES6), MySQL (Sequelize ORM), Cloudinary for images. Admin auth via JWT.

## Setup

1. **Node**
   - Node 18+

2. **MySQL**
   - Create a database: `CREATE DATABASE nextprime_db;`
   - Create user and grant privileges if needed.

3. **Env**
   - Copy `.env.example` to `.env`
   - Set `DB_*`, `JWT_SECRET`, `FRONTEND_URL`, and Cloudinary keys.

4. **Install & DB**
   ```bash
   cd backend
   npm install
   npm run db:sync
   npm run db:seed
   ```

5. **Run**
   ```bash
   npm run dev
   ```
   API: `http://localhost:5000`

## Scripts

- `npm start` – run server
- `npm run dev` – run with watch
- `npm run db:sync` – sync Sequelize models to MySQL (alter tables)
- `npm run db:seed` – create default admin, contact, areas, locations, social links

## Default admin (after seed)

- **Email:** `admin@nextprimerealestate.com` (or `admin`)
- **Password:** `admin123`

## API

Base URL: `/api`

### Public (no auth)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/site-data` | All site data (properties, testimonials, areas, locationsList, contact, socialLinks, featuredPropertyIds) |
| GET | `/api/properties` | List properties |
| GET | `/api/properties/:id` | One property |
| GET | `/api/featured-properties` | Featured property objects (dashboard order) |

### Admin (Bearer token required)

Send header: `Authorization: Bearer <token>`

**Auth**

| Method | Path | Body | Description |
|--------|------|------|-------------|
| POST | `/api/admin/login` | `{ "email", "password" }` | Returns `{ token, admin }` |

**Properties**

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/properties` | List |
| GET | `/api/admin/properties/:id` | One |
| POST | `/api/admin/properties` | Create (JSON or multipart: `image` = 1 main, `photos` = up to 10 gallery images) |
| PUT | `/api/admin/properties/:id` | Update (same; multiple images uploaded to Cloudinary) |
| DELETE | `/api/admin/properties/:id` | Delete |

**Testimonials**

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/testimonials` | List |
| GET | `/api/admin/testimonials/:id` | One |
| POST | `/api/admin/testimonials` | Create |
| PUT | `/api/admin/testimonials/:id` | Update |
| DELETE | `/api/admin/testimonials/:id` | Delete |

**Areas (map)**

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/areas` | List (returns `{ id, name, subtitle, center: [lat, lng] }`) |
| POST | `/api/admin/areas` | Create `{ name, subtitle, lat, lng }` |
| PUT | `/api/admin/areas/:id` | Update |
| DELETE | `/api/admin/areas/:id` | Delete |

**Locations list (search dropdown)**

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/locations-list` | List (array of names) |
| POST | `/api/admin/locations-list` | Add `{ name }` |
| DELETE | `/api/admin/locations-list/:name` | Remove |

**Contact**

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/contact` | Get |
| PUT | `/api/admin/contact` | Update `{ phoneDisplay, phoneTel, email, whatsappText }` |

**Social links**

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/social` | List |
| PUT | `/api/admin/social` | Add/update one `{ name, href, icon? }` |
| DELETE | `/api/admin/social/:name` | Remove |

**Featured**

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/featured` | List (array of property IDs) |
| PUT | `/api/admin/featured` | Set `{ ids: number[] }` |

**Upload**

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/admin/upload/image` | Multipart `image` file → Cloudinary, returns `{ url, publicId }` |

## Cloudinary

- Create a Cloudinary account and get cloud name, API key, API secret.
- Set in `.env`: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
- Property create/update: send multipart with `image` (1 main image) and/or `photos` (up to 10 gallery images); all are uploaded to folder `nextprime/properties`. You can also send `image` and `photos` (newline-separated URLs) in JSON body instead of files.
