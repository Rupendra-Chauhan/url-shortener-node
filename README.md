## URL Shortener API (Node + MongoDB)

Backend-only URL shortener built with **Node.js**, **Express**, and **MongoDB**.  
This version is intentionally simple and interview-friendly: **no auth**, just a clean API that:

- Shortens any URL
- Redirects using a short code
- Tracks how many times each short URL has been visited
- Applies a **5 short-URL-per-day rate limit per IP** to demonstrate basic protection

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
  - Simple analytics via a `hits` counter

### 2. Features at a glance

- **API-only backend** (no frontend)
- **API versioning** under `/api/v1`
- **Main APIs**:
  - **POST** `/api/v1/urls/shorten` – create a short URL
  - **GET** `/api/v1/urls/:code` – fetch analytics for a short URL
  - **GET** `/:code` – public redirect to the original URL and increment hit count
- **Rate limiting**:
  - Each IP can create **up to 5 short URLs per 24 hours**

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
  - `Url` – `{ code, originalUrl, shortUrl, hits, createdAt, updatedAt }`
- **Controllers**:
  - `urlController` – create short URLs and expose analytics
  - `redirectController` – handle public redirects and increment `hits`
- **Routing**:
  - `src/routes/v1/index.js` – wraps all v1 routes
  - `src/routes/v1/url.js` – URL shortener + public analytics

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
- **`PORT`** – defaults to `4000` if not set

#### 5.3. Run the server

```bash
npm run dev
```

The server will start on `http://localhost:4000` by default.

### 6. API reference

#### 6.1. Health

- **GET** `/health`  
  - **Response**: `{ "status": "ok" }`

#### 6.2. Create a short URL

- **POST** `/api/v1/urls/shorten`  
  - **Rate limit**: max **5 requests per IP per 24 hours**
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

#### 6.4. Analytics (public)

- **GET** `/api/v1/urls/:code`  
  - **Behavior**:
    - Looks up the `Url` by `code`.
    - Returns metadata including `hits`, `createdAt`, and `updatedAt`.
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

1. **Create a short URL**
   - `POST /api/v1/urls/shorten` with `{ "originalUrl": "https://example.com" }`.
2. **Use the short URL**
   - Open `GET /<code>` in the browser (for example `http://localhost:4000/AbCdEf12`).
3. **Check hit count and metadata**
   - `GET /api/v1/urls/<code>` (for example `/api/v1/urls/AbCdEf12`).

### 8. Notes for recruiters

- **Focus**: This project is intentionally **simple and focused**: URL shortening, redirects, analytics, and rate limiting.
- **Structure**: The codebase is organized in a way that mirrors common production backends (clear folders for routes, controllers, models, and config), similar in spirit to how frameworks like Next.js encourage structure and clarity.
- **Extensibility**: Easy to extend with authentication, richer analytics, or a dedicated frontend (e.g. a Next.js UI) without changing the core API design.

