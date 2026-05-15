# Full Stack Portfolio (MERN)

Clean, responsive portfolio with a public client, an admin editor, and a Node/Express API backed by MongoDB. Portfolio content lives in `data/portfolio.json` and is synced into MongoDB by the backend.

## Overview

- **Purpose:** Showcase projects, skills, experience, education, and achievements.
- **Client:** Public portfolio site built with React, Vite, and Tailwind CSS.
- **Admin:** Internal JSON editor for portfolio content.
- **Backend:** Express API with MongoDB, admin-token protection, validation, security headers, rate limiting, and structured logging.
- **Database:** MongoDB via Mongoose.

## Project Architecture

```txt
Portfolio/
  backend/
    server.js
    src/
      app.js
      config.js
      db.js
      middleware/
      models/
      routes/
      services/
      utils/
      validators/
  data/
    portfolio.json
  frontend/
    client/
    admin/
```

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS
- **Admin:** React, Vite, Tailwind CSS
- **Backend:** Node.js, Express
- **Database:** MongoDB, Mongoose

## Features

- Responsive portfolio UI
- Project detail pages
- Achievement detail pages with gallery support
- Admin JSON editor
- MongoDB-backed API
- Portfolio JSON validation before saving
- Local JSON and database sync
- Request hardening with CORS, security headers, rate limits, and admin auth

## Quick Start

### Backend

Create `backend/.env` with your local values, then run:

```bash
cd backend
npm install
npm run dev
```

Required backend environment variables:

```env
PORT=4000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
ADMIN_TOKEN=your_admin_token
CORS_ORIGINS=http://localhost:5173,http://localhost:5174
CLIENT_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174
JSON_BODY_LIMIT=1mb
CACHE_SECONDS=60
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=120
LOG_LEVEL=info
```

### Client

```bash
cd frontend/client
npm install
npm run dev
```

Optional client environment variable:

```env
VITE_API_URL=http://localhost:4000
VITE_SITE_URL=http://localhost:5173
```

### Admin

```bash
cd frontend/admin
npm install
npm run dev
```

Optional admin environment variable:

```env
VITE_API_URL=http://localhost:4000
```

## Updating Content

- Use the admin app to load, validate, edit, and save portfolio JSON.
- Or edit `data/portfolio.json` manually and restart the backend to sync it into MongoDB.

## Visitor Count and Render Sleep

The client counts one visitor per browser session. It retries quietly in the background so a sleeping free Render backend can wake up and still count the visitor.

For faster cold starts, you can optionally add an UptimeRobot monitor:

- **Monitor type:** HTTP(s)
- **URL:** `https://your-backend.onrender.com/api/health`
- **Interval:** 10 or 15 minutes
- **Expected status:** `200`

The health endpoint returns a small no-cache JSON response and does not increment visitor count.

## Useful Commands

```bash
cd backend
npm run check
```

```bash
cd frontend/client
npm run build
```

```bash
cd frontend/admin
npm run build
```

## License

This project is open-source and free to use.
