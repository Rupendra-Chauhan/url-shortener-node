# URL Shortener & QR API

Backend service built with **Node.js**, **Express**, and **MongoDB**. It shortens URLs, serves **public redirects** with hit counting, generates **QR codes** (tracked short links or member-only “direct” QR), and supports **OTP + JWT** login.

**Interactive API docs (Swagger UI):** after you start the server, open **`http://localhost:4000/api/docs`** (adjust host/port). Recruiters can explore every endpoint, schemas, and try requests without reading this file first.

### React frontend (separate app)

A full UI lives in **`url-shortener-web/`** (Vite + React). It is **not** mixed into the API codebase. Run the API on port **4000**, then:

```bash
cd url-shortener-web
npm install
npm run dev
```

Open **http://localhost:5173** — the dev server proxies `/api` and `/health` to the backend. See **`url-shortener-web/README.md`** for details.

---

## What this project demonstrates

| Area | Details |
|------|---------|
| **API design** | Versioned routes under `/api/v1`, consistent JSON errors, OpenAPI 3 spec |
| **Data model** | One `Url` collection for both “paste link” shortens and QR-backed short links (`fromQr` flag) |
| **Auth** | Optional Bearer JWT on public create endpoints; required where product rules say so |
| **Rate limiting** | Guests: separate daily limits for **shorten** vs **tracked QR** (logged-in users skip) |
| **Docs** | Swagger UI + `openapi.yaml`; CORS tuned for local Swagger on the API port |
| **Structure** | `routes` → `controllers` → `models` / `services` / `middleware` |

---

## Features: short links vs QR (at a glance)

| Capability | Without login | With JWT |
|------------|---------------|----------|
| **Create short URL** | Yes (`POST /urls/shorten`, guest limit) | Yes (link owned by user) |
| **Open short link** | `GET /:code` → redirect + `hits++` | Same |
| **Analytics** `GET /urls/{code}` | Yes if link has **no owner** | Yes if you **own** the link |
| **Tracked QR** (default) | Yes (`POST /urls/qr`, guest limit); QR encodes **short URL** | Same + ownership |
| **Direct QR** (raw URL in image) | No | Yes (`POST /urls/qr/direct` or `track: false` on `/qr`) |
| **QR analytics** `GET /urls/qr/{code}` | Yes if **guest** tracked link | Yes if **you own** it |
| **List “my” URLs / QR** | No | `GET /urls`, `GET /urls/qr/list` |
| **Dashboard report** | `GET /report/me` → **403** (intentionally disabled) | Same |

---

## Tech stack

- **Runtime:** Node.js 18+
- **Framework:** Express 4
- **Database:** MongoDB (Mongoose)
- **Auth:** OTP (demo: returned in API) + JWT (`jsonwebtoken`)
- **QR:** `qrcode` (PNG or JSON `qrDataUrl`)
- **API docs:** `swagger-ui-express`, `js-yaml`
- **Security / ops:** `helmet`, `cors`, `morgan`, `express-rate-limit`

---

## Project layout

```
src/
  server.js              # dotenv, DB connect, listen, mounts GET /:code redirect
  app.js                 # middleware, /api/v1, Swagger at /api/docs
  config/db.js           # Mongoose connect
  models/                # User, Otp, Url (+ fromQr on Url)
  routes/v1/             # auth, urls (shorten + all QR routes), report
  controllers/           # url, qr, redirect, auth, report (stub)
  services/shortLinkService.js   # unique 8-char code + Url.create (retry on collision)
  utils/urlNormalize.js          # shared URL validation
  middleware/auth.js, guestRateLimit.js
  docs/openapi.yaml      # Source of truth mirrored in Swagger UI
```

---

## Quick start

### 1. Install

```bash
npm install
```

### 2. Environment

Copy `.env.example` to `.env` and set at least:

| Variable | Purpose |
|----------|---------|
| `MONGODB_URI` | Mongo connection string |
| `JWT_SECRET` | Required to start the server (sign/verify JWT) |
| `BASE_URL` | Public base for generated short links (e.g. `http://localhost:4000`) |
| `CORS_ORIGIN` | Optional comma-separated browser origins; dev merges `localhost` + `BASE_URL` origin for Swagger |

### 3. Run

```bash
npm run dev
```

- Health: `GET /health`
- **Swagger:** `GET /api/docs`
- Redirect: `GET /<code>`

### 4. Docker

```bash
docker compose up --build
```

---

## Typical flows (for demos)

1. **Guest shorten** — `POST /api/v1/urls/shorten` with `{ "originalUrl": "https://example.com" }` → open `shortUrl` or `GET /{code}`.
2. **Guest tracked QR** — `POST /api/v1/urls/qr` with `{ "url": "https://example.com" }` → QR points at short link; hits count on redirect.
3. **Login** — `POST .../auth/request-otp` then `POST .../auth/verify-otp` → use **Authorize** in Swagger with `Bearer <token>`.
4. **Member direct QR** — `POST /api/v1/urls/qr/direct` with JWT → QR encodes the long URL only (no short link / no server hit count).
5. **Analytics** — `GET /api/v1/urls/{code}` or `GET /api/v1/urls/qr/{code}`: public for guest-created links; **403** if the link is owned by someone else.

---

## API index (summary)

| Method | Path | Notes |
|--------|------|--------|
| GET | `/health` | Liveness |
| GET | `/api/docs` | Swagger UI |
| GET | `/api/docs/openapi.yaml` | Raw spec |
| POST | `/api/v1/urls/shorten` | Create short link |
| POST | `/api/v1/urls/qr` | Tracked QR (default) or `track:false` + JWT |
| POST | `/api/v1/urls/qr/direct` | Direct QR (**JWT**) |
| GET | `/api/v1/urls/qr/list` | My tracked QR links (**JWT**) |
| GET | `/api/v1/urls/qr/:code` | QR short-link analytics |
| GET | `/api/v1/urls` | My URLs (**JWT**) |
| GET | `/api/v1/urls/:code` | Short-link analytics |
| POST | `/api/v1/auth/request-otp`, `/verify-otp` | OTP login |
| PUT | `/api/v1/auth/profile` | Update name (**JWT**) |
| GET | `/api/v1/report/me` | Always **403** |
| GET | `/:code` | Public redirect |

Full request/response shapes: **`src/docs/openapi.yaml`** or **Swagger UI**.

---

## Notes for recruiters

- **Single `Url` model** powers both the shortener and tracked QR; `fromQr` separates creation paths for listing and analytics.
- **Guest limits** are independent for shorten vs QR to avoid one feature starving the other.
- **Reports** are stubbed off to keep scope focused on links, QR, and auth; the endpoint remains for API stability.
- **Production hardening** left as obvious next steps: SMS for OTP, stricter CORS in prod, admin-only reports, richer analytics.

---

## License

MIT
