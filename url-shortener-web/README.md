# URL Shortener — React client

Separate **Vite + React** app that talks to the backend in the parent folder (`../`). It covers every major API area: shorten, QR (tracked / raw / direct), “my links”, analytics, OTP login, profile, and the disabled report endpoint.

## Prerequisites

1. **Backend** running on **port 4000** (default). From repo root: `npm run dev` in the API project.
2. **MongoDB** configured for the API (see parent `README.md`).

## Run the UI (development)

```bash
cd url-shortener-web
npm install
npm run dev
```

Open **http://localhost:5173**.  
API calls are **proxied** to `http://localhost:4000` (see `vite.config.js`), so you usually do **not** need CORS changes for local dev.

## Production API URL

To point at a deployed API, set:

```env
VITE_API_URL=https://your-api.example.com
```

Build:

```bash
npm run build
npm run preview
```

## What each tab does

| Tab | Maps to API |
|-----|-------------|
| **Shorten** | `POST /api/v1/urls/shorten` (sends JWT when logged in) |
| **QR** | Tracked: `POST /api/v1/urls/qr` · Direct: `POST /api/v1/urls/qr/direct` |
| **My links** | `GET /api/v1/urls`, `GET /api/v1/urls/qr/list` |
| **Analytics** | `GET /api/v1/urls/:code` or `GET /api/v1/urls/qr/:code` |
| **Account** | OTP, `PUT /api/v1/auth/profile`, demo `GET /api/v1/report/me` (403) |

## Stack

- React 18 · Vite 5 · fetch API · no extra UI framework (plain CSS)

## Folder layout

```
src/
  api/client.js       # HTTP helpers + api.* methods
  context/            # AuthProvider + JWT in localStorage
  hooks/useAuth.js
  modules/            # One screen per feature area
  App.jsx             # Navigation + API health indicator
```
