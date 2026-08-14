# 🚀 Aman Singh Kunwar — Personal Portfolio & Admin Control Center

[![CI / Quality & Security Pipeline](https://github.com/Aman-Singh-Kunwar/Portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/Aman-Singh-Kunwar/Portfolio/actions/workflows/ci.yml)
![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?logo=node.js)
![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)
![License](https://img.shields.io/badge/License-MIT-amber)

A modern, high-performance, full-stack Developer Portfolio and Admin Control System built with **React, Node.js/Express, MongoDB, PHP, MySQL, WordPress, and Tailwind CSS**. Features a dynamic public client site, interactive skill metrics, career timeline tree, fullscreen photo lightboxes, recruiter contact CRM, and a secure admin control center.

---

## 🔗 Live Links

- **🌐 Live Portfolio Application**: [https://aman-singh-kunwar-portfolio1.onrender.com/](https://aman-singh-kunwar-portfolio1.onrender.com/)
- **🏛️ Curriculum Management System**: [https://cms.dbuu.ac.in/](https://cms.dbuu.ac.in/)
- **🐙 GitHub Repository**: [https://github.com/Aman-Singh-Kunwar/Portfolio](https://github.com/Aman-Singh-Kunwar/Portfolio)

---

## ✨ Features & Key Highlights

### 🎨 1. Client Portfolio Site (`frontend/client`)
- **Executive Career Timeline**: Glowing milestone nodes for work experience (Evon Technologies, Aasraa Trust) and education (B.Tech CSE - CGPA 9.29, 12th Board 93.6% - 18th Rank in State, 10th Board 96.2%).
- **Interactive Skills Section**: Gradient progress bars categorized into **`Frontend`**, **`Backend & DB`**, and **`CMS & Core`**.
- **Technical Case Studies Modal**: Deep architectural breakdowns of real-world distributed systems, RAG assessment pipelines, and multi-tenant RBAC systems with problem-solution strategies and metrics.
- **Project & Certificate Lightboxes**: Fullscreen zoomable lightbox image modals with thumbnail navigation, prev/next buttons, and keyboard controls (Arrow keys, Esc).
- **Interactive Resume Modal**: Inline PDF preview tab + ATS plain-text converter tab with 1-click copying.
- **Multi-Platform Share Modal**: Share profile cards to WhatsApp, LinkedIn, Twitter/X, Email, or copy URL to clipboard.
- **Google SEO & Microdata**: Dynamic Open Graph tags, JSON-LD microdata (`Person`, `WebSite`, `SoftwareSourceCode`), `sitemap.xml`, and `robots.txt`.

### 🛠️ 2. Admin Control Center (`frontend/admin`)
- **🔐 HMAC Session Token Auth**: Secure `POST /api/auth/login` endpoint issuing 24-hour signed session tokens with optional `Remember Me` browser storage.
- **🎨 Matched Ambient Glow UI & Theme Customizer**: Sleek dark ambient gradients matching client UI + 1-click Accent Theme Switcher (**Amber**, **Emerald**, **Violet**, **Sky**, **Rose**).
- **📦 Visual Projects Manager**: Visual grid view to add, edit, feature, or delete projects with live database sync.
- **🏆 Achievements Manager**: Visual CRUD manager for hackathons, certifications, and milestone achievements with link previews.
- **💼 Work Experience & Education Manager**: Edit internship bullet points, tech stack tags, university CGPA, and board exam scores visually.
- **🛠️ Visual Skills Manager**: Visual editor with category groups and 0–100% proficiency sliders.
- **📝 JSON Editor + Split Live Preview**: Code editor with syntax validation + side-by-side interactive Client iFrame Preview & Modal Preview.
- **📩 Recruiter Inbox CRM**: Inbound hiring leads inbox with status pipeline tags (`🆕 New`, `💬 In Discussion`, `🎯 Interview Scheduled`, `📁 Archived`), mailto replies, and CSV export.
- **📊 7-Day Live Traffic Bar Chart**: Real-time traffic analytics and daily visitor trend bar chart on the main Admin Dashboard.

### ⚙️ 3. Backend API Service (`backend`)
- **RESTful Endpoints**: `/api/auth/login`, `/api/portfolio`, `/api/contact`, `/api/contact/:id/status`, `/api/visits`, `/sitemap.xml`, and `/api/health`.
- **Security & Performance**: HMAC-SHA256 token verification, timing-safe equality checks (`crypto.timingSafeEqual`), CORS origin protection, IP rate limiting (`express-rate-limit`), and compression middleware.

---

## 🛠️ Technology Stack

- **Frontend & UI**: React 18, Tailwind CSS, Vite, React Router 6, React Icons
- **Backend & APIs**: Node.js 24, Express, Cryptography (HMAC-SHA256)
- **Database & Storage**: MongoDB Atlas, Mongoose, Local JSON Fallbacks
- **Deployment & Security**: Render, Compression, Rate Limiter, Helmet Security Headers

---

## 📂 Directory Structure

```txt
Portfolio/
├── backend/
│   ├── server.js
│   └── src/
│       ├── app.js
│       ├── config.js
│       ├── db.js
│       ├── middleware/        # Rate Limiter, Request Logger, requireAdmin Auth
│       ├── models/            # ContactMessage.js, Portfolio.js, VisitSession.js
│       ├── routes/            # auth.js, portfolio.js, contact.js, visits.js
│       ├── services/          # portfolioStore.js, visitStore.js
│       └── utils/             # http.js, logger.js, token.js
├── data/
│   └── portfolio.json         # Master dataset (Projects, Achievements, Skills, Experience)
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
│       │   ├── pages/         # DashboardPage.jsx, ProjectsPage.jsx, AchievementsPage.jsx, SkillsPage.jsx, ExperiencePage.jsx, JsonEditorPage.jsx, MessagesPage.jsx
│       │   └── App.jsx
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas or local MongoDB instance

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

### 4. Running Automated Tests & Quality Checks

Run the integration test suite and quality verification:

```bash
# Run full-stack test suite (Backend, Client, Admin)
npm test

# Run syntax and architecture checks
npm run check
```

---

## 🧪 CI/CD Pipeline

Continuous Integration is automated via **GitHub Actions** (`.github/workflows/ci.yml`). On every push to `main`, GitHub:
- Sets up Node.js 22 environment.
- Executes backend integration tests and syntax checks.
- Validates production builds for both Client and Admin applications.

---

## 📄 License

MIT License — Aman Singh Kunwar

This repository is open-source and available under the [MIT License](LICENSE).
