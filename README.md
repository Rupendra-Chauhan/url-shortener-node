## URL Shortener API (Node + MongoDB)

Backend-only URL shortener built with **Node.js**, **Express**, and **MongoDB**.

This version is designed for interviews/recruiters:

- **Guests** can **shorten URLs** (rate-limited) and use **public redirects**
- **Logged-in users** (OTP + JWT) can **see analytics** (hit counts) for the URLs they created

### 1. What this project demonstrates (for recruiters)

- **Clean API design** with versioned routes under `/api/v1`
- **Clear separation of concerns**:
  - `server.js` – bootstrap and public redirect route
  - `app.js` – Express configuration and middleware
  - `routes` – HTTP routing
  - `controllers` – business logic
  - `models` – MongoDB schemas
- **Production-style patterns**:
  - Centralized MongoDB connection
  - Rate limiting using `express-rate-limit`
  - URL normalization and validation
  - OTP login + JWT auth
  - Analytics via a `hits` counter (per-user ownership)

### 2. Features at a glance

- **API-only backend** (no frontend)
- **API versioning** under `/api/v1`
- **Main APIs**:
  - **POST** `/api/v1/urls/shorten` – create a short URL (guest or logged-in)
  - **GET** `/:code` – public redirect to the original URL and increment hit count
- **Auth & analytics**:
  - **POST** `/api/v1/auth/request-otp` – request OTP
  - **POST** `/api/v1/auth/verify-otp` – verify OTP and receive JWT
  - **GET** `/api/v1/urls` – list my URLs (logged-in only)
  - **GET** `/api/v1/urls/:code` – analytics for my short URL (logged-in only)
- **Rate limiting (guests)**:
  - Guests can create **up to 5 short URLs per 24 hours per IP**
  - Logged-in users are not limited by this guest limiter

### 3. Tech stack

- **Runtime**: Node.js
- **Framework**: Express
- **Database**: MongoDB (via Mongoose)
- **Rate limiting**: `express-rate-limit`
- **Other libraries**: `dotenv`, `morgan`, `cors`

### 4. Architecture overview

- **Entry point**: `src/server.js`
  - Loads environment variables
  - Connects to MongoDB
  - Defines public redirect route `GET /:code`
  - Starts the Express app
- **App setup**: `src/app.js`
  - Common middlewares (`cors`, `express.json`, `morgan`)
  - Health check `GET /health`
  - API versioning under `/api/v1`
- **Config**: `src/config/db.js`
  - Central MongoDB connection using Mongoose
- **Models**:
  - `User` – `{ phone, name }`
  - `Otp` – `{ phone, code, expiresAt }` (TTL index cleanup)
  - `Url` – `{ code, originalUrl, shortUrl, owner, hits }`
- **Controllers**:
  - `urlController` – create short URLs and expose analytics
  - `redirectController` – handle public redirects and increment `hits`
  - `authController` – OTP request/verify, JWT issuing, profile update
- **Routing**:
  - `src/routes/v1/index.js` – wraps all v1 routes
  - `src/routes/v1/auth.js` – OTP login + profile
  - `src/routes/v1/url.js` – shortener (public), analytics (logged-in)

### 5. Getting started

#### 5.1. Install dependencies

```bash
cd d:\Node\url-shortner
npm install
```

#### 5.2. Configure environment

Create a `.env` file (or update the existing one) with:

- **`MONGODB_URI`** – connection string to your MongoDB instance  
  - Example: `mongodb://localhost:27017/url_shortner`
- **`BASE_URL`** – base URL for generating short links  
  - Example: `http://localhost:4000`
- **`JWT_SECRET`** – secret for signing JWTs (required for auth)
- **`PORT`** – defaults to `4000` if not set

#### 5.3. Run the server

```bash
npm run dev
```

The server will start on `http://localhost:4000` by default.

### 5.4. Run with Docker

This project is API-only and includes MongoDB using `docker-compose`.

1. Create a local environment file for Docker (optional, but recommended):
   - Copy `.env.example` to `.env` and set `JWT_SECRET` (and any overrides you want).
   - Note: `.env` is gitignored.
2. Start the stack:
```bash
docker compose up --build
```
3. API:
   - Health check: `http://localhost:4000/health`
   - Public redirect: `http://localhost:4000/<code>`

To stop the stack:
```bash
docker compose down
```

### 6. API reference

#### 6.1. Health

- **GET** `/health`  
  - **Response**: `{ "status": "ok" }`

#### 6.2. Create a short URL

- **POST** `/api/v1/urls/shorten`  
  - **Guest rate limit**: max **5 requests per IP per 24 hours**
  - **Body**:
    - `{ "originalUrl": "https://example.com" }`
  - **Behavior**:
    - Normalizes the URL (adds `https://` if missing, validates protocol).
    - Generates an 8-character alphanumeric short code.
    - Saves `{ code, originalUrl, shortUrl, hits }` to MongoDB.
  - **Response example**:
    ```json
    {
      "message": "URL shortened successfully",
      "data": {
        "id": "665e7e5b7e6e7e5b7e6e7e5b",
        "code": "AbCdEf12",
        "originalUrl": "https://example.com",
        "shortUrl": "http://localhost:4000/AbCdEf12",
        "hits": 0
      }
    }
    ```

#### 6.3. Redirect (public)

- **GET** `/:code`  
  - **Behavior**:
    - Looks up the `Url` by `code`.
    - Increments the `hits` counter.
    - Issues an HTTP redirect to `originalUrl`.

#### 6.4. Auth (OTP + JWT)

- **POST** `/api/v1/auth/request-otp`
  - **Body**: `{ "phone": "1234567890" }`
  - **Behavior**: creates a 6-digit OTP valid for 10 minutes (returned in response for demo).

- **POST** `/api/v1/auth/verify-otp`
  - **Body**: `{ "phone": "1234567890", "otp": "123456" }`
  - **Behavior**: verifies OTP, creates user if needed, returns JWT.

#### 6.5. Analytics (logged-in users only)

- **GET** `/api/v1/urls`
  - **Headers**: `Authorization: Bearer <token>`
  - **Behavior**: returns URLs created by the logged-in user.

- **GET** `/api/v1/urls/:code`  
  - **Headers**: `Authorization: Bearer <token>`
  - **Behavior**:
    - Looks up the `Url` by `code` **and owner = current user**.
    - Returns analytics including `hits`, `createdAt`, and `updatedAt`.
  - **Response example**:
    ```json
    {
      "message": "URL analytics fetched successfully",
      "data": {
        "id": "665e7e5b7e6e7e5b7e6e7e5b",
        "code": "AbCdEf12",
        "originalUrl": "https://example.com",
        "shortUrl": "http://localhost:4000/AbCdEf12",
        "hits": 42,
        "createdAt": "2024-05-01T10:00:00.000Z",
        "updatedAt": "2024-05-02T12:34:56.000Z"
      }
    }
    ```

### 7. Example usage flow

1. **Create a short URL as guest**
   - `POST /api/v1/urls/shorten` with `{ "originalUrl": "https://example.com" }`.
2. **Use the short URL**
   - Open `GET /<code>` in the browser (for example `http://localhost:4000/AbCdEf12`).
3. **Log in to view analytics**
   - `POST /api/v1/auth/request-otp` then `POST /api/v1/auth/verify-otp`.
4. **Check hit count and metadata (logged-in)**
   - `GET /api/v1/urls/<code>` with `Authorization: Bearer <token>`.

### 8. Notes for recruiters

- **Focus**: Demonstrates URL shortening + redirects for guests, and authenticated analytics for users.
- **Structure**: Clear folder separation (config / models / controllers / middleware / routes) to stay easy to navigate during code review interviews.
- **Extensibility**: Easy to extend with richer analytics (per-day breakdown, referrers) or a frontend (e.g. Next.js UI) without changing the core API design.

