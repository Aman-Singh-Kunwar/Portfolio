# 🚀 Aman Singh Kunwar — Personal Portfolio & Admin Control Center

[![CI / Quality & Security Pipeline](https://github.com/Aman-Singh-Kunwar/Portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/Aman-Singh-Kunwar/Portfolio/actions/workflows/ci.yml)
![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?logo=node.js)
![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)
![Playwright](https://img.shields.io/badge/Playwright-E2E-45ba4b?logo=playwright)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)
![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)
![License](https://img.shields.io/badge/License-MIT-amber)

A modern, high-performance, full-stack Developer Portfolio, Recruiter CRM, and Admin Content Studio built with **React 18, Node.js/Express, TypeScript, Redis, MongoDB Atlas, and Tailwind CSS**. Features a public client site, interactive case study breakdowns, recruiter contact pipeline, self-documenting OpenAPI 3.0 explorer, Prometheus APM metrics, and a secure admin control center.

---

## 🔗 Live Links

- **🌐 Live Client Portfolio**: [https://aman-singh-kunwar-portfolio1.onrender.com/](https://aman-singh-kunwar-portfolio1.onrender.com/)
- **🔐 Live Admin Control Center**: [https://aman-singh-kunwar-portfolio2.onrender.com/admin](https://aman-singh-kunwar-portfolio2.onrender.com/admin)
- **🐙 GitHub Repository**: [https://github.com/Aman-Singh-Kunwar/Portfolio](https://github.com/Aman-Singh-Kunwar/Portfolio)

---

## ✨ Features & Engineering Highlights

### 🎨 1. Client Portfolio Site (`frontend/client`)
- **Executive Career Timeline**: Glowing milestone nodes for work experience (Evon Technologies, Aasraa Trust) and education (B.Tech CSE - CGPA 9.29, 12th Board 93.6% - 18th Rank in State, 10th Board 96.2%).
- **Interactive Skills Section**: Gradient progress bars categorized into **`Frontend`**, **`Backend & DB`**, and **`CMS & Core`**.
- **Technical Case Studies Modal**: Deep architectural breakdowns of distributed systems (*Eventory*, *CMS*) with problem-solution strategies, metrics, and security tabs.
- **Project & Certificate Lightboxes**: Fullscreen zoomable lightbox image modals with thumbnail navigation, prev/next buttons, and keyboard controls (Arrow keys, Esc).
- **Interactive Resume Modal**: Inline PDF preview tab + ATS plain-text converter tab with 1-click copying.
- **Multi-Platform Share Modal**: Share profile cards to WhatsApp, LinkedIn, Twitter/X, Email, or copy URL to clipboard.
- **Google SEO & Microdata**: Dynamic Open Graph tags, JSON-LD microdata (`Person`, `WebSite`, `SoftwareSourceCode`), `sitemap.xml`, and `robots.txt`.
- **Crash Recovery**: React Error Boundaries prevent white-screen crashes with styled fallback UI.

### 🛠️ 2. Admin Control Center (`frontend/admin`)
- **🔐 HMAC Session Token Auth**: Secure `POST /api/auth/login` endpoint issuing 24-hour signed session tokens stored in the Redis cache tier with optional `Remember Me` browser storage.
- **🎨 Matched Ambient Glow UI & Theme Customizer**: Sleek dark ambient gradients matching client UI + 1-click Accent Theme Switcher (**Amber**, **Emerald**, **Violet**, **Sky**, **Rose**).
- **📦 Visual Projects Manager**: Visual grid view to add, edit, feature, or delete projects with live database sync.
- **🏆 Achievements Manager**: Visual CRUD manager for hackathons, certifications, and milestone achievements with link previews.
- **💼 Work Experience & Education Manager**: Edit internship bullet points, tech stack tags, university CGPA, and board exam scores visually.
- **🛠️ Visual Skills Manager**: Visual editor with category groups and 0–100% proficiency sliders.
- **📝 JSON Editor + Split Live Preview**: Code editor with syntax validation + side-by-side interactive Client iFrame Preview & Modal Preview.
- **📩 Recruiter Inbox CRM**: Inbound hiring leads inbox with status pipeline tags (`🆕 New`, `💬 In Discussion`, `🎯 Interview Scheduled`, `📁 Archived`), mailto replies, and CSV export.
- **📊 7-Day Live Traffic Bar Chart**: Real-time traffic analytics and daily visitor trend bar chart on the main Admin Dashboard.

### ⚙️ 3. Backend API Service (`backend`)
- **RESTful Endpoints**: `/api/auth/login`, `/api/portfolio`, `/api/contact`, `/api/contact/:id/status`, `/api/visits`, `/sitemap.xml`, `/api/metrics`, and `/api/health`.
- **Interactive API Documentation**: Swagger/OpenAPI 3.0 explorer at `/api/docs` with full request/response schemas.
- **Runtime Input Validation (Zod)**: Strict input validation and sanitization on all mutating endpoints.
- **Distributed Caching (Redis + In-Memory)**: Sub-millisecond reads with automatic cache invalidation on admin edits.
- **Prometheus Telemetry**: Native Prometheus APM metrics export at `GET /api/metrics`.
- **Security & Performance**: HMAC-SHA256 token verification, timing-safe equality checks (`crypto.timingSafeEqual`), CORS origin protection, IP rate limiting (`express-rate-limit`), and compression middleware.
- **Observability**: `X-Request-Id` correlation headers on every response, ETag-based conditional requests (304 Not Modified), and structured cache control directives.
- **Environment Validation**: Structured boot-time validation of all required environment variables with clear error tables on missing config.

### 🐳 4. Docker Containerization & Healthchecks
- **5-Service Stack**: One-command launch for `mongo`, `redis`, `backend`, `client`, and `admin` via `docker compose up -d`.
- **Active Healthchecks**: Automated startup probes (`mongosh`, `redis-cli ping`) with `service_healthy` dependency ordering.
- **Multi-Stage Builds**: Vite production builds served by nginx with SPA routing and aggressive static asset caching.

---

## 🛠️ Technology Stack

- **Frontend & UI**: React 18, TypeScript, Tailwind CSS, Vite, React Router 6, React Icons
- **Backend & APIs**: Node.js 22, Express, Zod, Cryptography (HMAC-SHA256), Swagger/OpenAPI 3.0
- **Database & Cache**: MongoDB Atlas, Mongoose, Redis 7 In-Memory Cache
- **Testing Suite**: Playwright (E2E Browser Testing), Node.js Native Test Runner (Integration Tests)
- **Infrastructure**: Docker, Docker Compose, Nginx, GitHub Actions CI/CD
- **Deployment & Security**: Render, Compression, Rate Limiter, Helmet Security Headers

---

## 📂 Directory Structure

```txt
Portfolio/
├── backend/
│   ├── server.js              # Server entry point & graceful shutdown
│   └── src/
│       ├── app.js             # Express app, Prometheus metrics & Swagger UI
│       ├── config.js          # ENV_SCHEMA startup validation
│       ├── db.js              # Mongoose connection
│       ├── docs/swagger.js    # OpenAPI 3.0 specification
│       ├── middleware/        # Rate Limiter, Request Logger, requireAdmin
│       ├── models/            # ContactMessage.js, Portfolio.js, VisitSession.js
│       ├── routes/            # auth.js, portfolio.js, contact.js, visits.js
│       ├── services/          # cache.js (Redis/Memory), portfolioStore.js
│       ├── utils/             # http.js, logger.js, metrics.js, token.js
│       └── validators/        # schemas.js (Zod), portfolio.js
├── data/
│   └── portfolio.json         # Master dataset (Projects, Achievements, Skills, Experience)
├── e2e/                       # Playwright Browser Test Suite
│   ├── playwright.config.js   # Test runner & webServer orchestration
│   └── tests/                 # homepage.spec.js, contact.spec.js, admin.spec.js
├── frontend/
│   ├── client/                # Public Portfolio React App
│   │   ├── src/
│   │   │   ├── components/    # SeoManager.jsx, ResumeModal.jsx, ShareModal.jsx
│   │   │   ├── pages/         # Home.jsx, ProjectDetail.jsx, AchievementDetail.jsx
│   │   │   └── App.jsx
│   └── admin/                 # Admin Control Center
│       ├── src/
│       │   ├── components/    # AdminLayout.jsx, ProtectedRoute.jsx, Icons.jsx
│       │   ├── context/       # AuthContext.jsx
│       │   ├── pages/         # DashboardPage.jsx, ProjectsPage.jsx, AchievementsPage.jsx, MessagesPage.jsx
│       │   └── App.jsx
│   types/
│   └── portfolio.d.ts         # Shared cross-stack TypeScript contracts
├── docker-compose.yml         # 5-Service Docker Orchestration
├── tsconfig.json              # Workspace TypeScript configuration
└── README.md
```

---

## 🚀 Quick Start Guide

### 🐳 Option A: Docker (Recommended — One Command)

```bash
docker compose up -d --build
```

| Service | Local URL |
|---|---|
| 🌐 **Client Portfolio** | `http://localhost:5173` |
| 🔐 **Admin Panel** | `http://localhost:5174` |
| ⚙️ **Backend Status Portal** | `http://localhost:4000` |
| 📖 **Swagger API Docs** | `http://localhost:4000/api/docs` |
| 📊 **Prometheus Metrics** | `http://localhost:4000/api/metrics` |

---

### 🛠️ Option B: Manual Setup

#### Prerequisites
- Node.js (v22+)
- MongoDB Atlas or local MongoDB instance
- Redis (Optional — automatic in-memory fallback enabled)

### 1. Backend API Service

```bash
cd backend
npm install
npm run dev
```

Create `backend/.env`:

```env
PORT=4000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
REDIS_URL=redis://localhost:6379
ADMIN_TOKEN=your_admin_token
CORS_ORIGINS=http://localhost:5173,http://localhost:5174
CLIENT_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174
```

### 2. Client Application

```bash
cd frontend/client
npm install
npm run dev
```

App runs locally at `http://localhost:5173`.

### 3. Admin Control Center

```bash
cd frontend/admin
npm install
npm run dev
```

App runs locally at `http://localhost:5174`.

---

## 🧪 Testing Suite & Quality Verification

This repository maintains **29 automated tests** across all architectural layers:

```bash
# 1. Run Unit & Integration Tests (21 tests across Backend, Client, Admin)
npm test

# 2. Run Playwright E2E Browser Tests (8 tests in real Chromium)
npm run test:e2e

# 3. Launch Interactive Playwright UI Studio
npm run test:e2e:ui

# 4. Run TypeScript Typecheck
npm run typecheck

# 5. Run Syntax & Architecture Checks
npm run check
```

---

## 🧪 CI/CD Pipeline

Continuous Integration is automated via **GitHub Actions** (`.github/workflows/ci.yml`). On every push to `main`, GitHub:
1. Sets up Node.js 22 environment.
2. Installs dependencies across Root, Backend, Client, and Admin.
3. Executes Node.js syntax checks (`node --check`).
4. Runs workspace TypeScript typecheck (`tsc --noEmit`).
5. Executes all 21 unit/integration tests.
6. Builds production client and admin Vite bundles.
7. Validates Docker Compose multi-service configuration (`docker compose config`).
8. Executes dependency vulnerability audits (`npm audit --audit-level=high`).

---

## 📄 License

MIT License — Aman Singh Kunwar

This repository is open-source and available under the [MIT License](LICENSE).
