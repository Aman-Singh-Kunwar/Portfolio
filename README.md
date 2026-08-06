# 🚀 Aman Singh Kunwar — Personal Portfolio & Admin Control Center

A modern, high-performance, full-stack Developer Portfolio and Admin Control System built with **React 18, Node.js/Express, MongoDB, PHP, MySQL, WordPress, and Tailwind CSS**. Features a dynamic public client site, interactive skill metrics, career timeline tree, lightbox galleries, recruiter contact inbox, and a secure admin control center.

---

## 🔗 Live Links

- **🌐 Live Portfolio Application**: [https://aman-singh-kunwar-portfolio1.onrender.com/](https://aman-singh-kunwar-portfolio1.onrender.com/)
- **🐙 GitHub Repository**: [https://github.com/Aman-Singh-Kunwar/Portfolio](https://github.com/Aman-Singh-Kunwar/Portfolio)

---

## ✨ Features & Key Highlights

### 🎨 1. Client Portfolio Site (`frontend/client`)
- **Executive Career Timeline**: Connected with glowing milestone nodes for work experience and education (B.Tech CSE, 12th Board 93.6% - 18th Rank, 10th Board 96.2%).
- **Interactive Skills Section**: Brand-tinted gradient progress bars with category filter tabs (**`All`**, **`Frontend`**, **`Backend & DB`**, **`CMS & Core`**).
- **Direct Recruiter Contact Form**: Rate-limited contact form allowing recruiters to submit messages with instant UI confirmation, Copy Icon buttons, and toast alerts.
- **Project & Certificate Lightbox**: Dedicated detail pages with full-screen zoomable lightbox image modals for hackathons and internship certificates.
- **Google SEO & Rich Snippets**: Integrated JSON-LD microdata (`Person`, `WebSite`, `SoftwareSourceCode`, `BreadcrumbList`) and dynamic Open Graph meta tags.

### 🛠️ 2. Admin Control Center (`frontend/admin`)
- **Recruiter Messages Inbox**: Live inbox tab fetching recruiter submissions (`GET/DELETE /api/contact`) from MongoDB with unread message counters, search filters, and modal deletion.
- **Visual Portfolio Editor**: Visual form editor and JSON editor syncing directly with the backend API (`PUT /api/portfolio`).

### ⚙️ 3. Backend API Service (`backend`)
- **RESTful Endpoints**: `/api/portfolio`, `/api/contact`, `/api/visits`, `/api/visits/session`, `/sitemap.xml`, and `/api/health`.
- **Production Hardening**: Security headers (`helmet`), CORS origin protection, IP rate limiting (`express-rate-limit`), body validation, and structured logging.

---

## 🛠️ Technology Stack

- **Frontend & UI**: React 18, Tailwind CSS, Vite, React Router 6, React Icons, Simple Icons
- **Backend & APIs**: Node.js 24, Express, PHP
- **CMS & Databases**: WordPress, MongoDB, Mongoose, MySQL
- **Tooling & Deployment**: Render, GitHub Actions, Nodemon, Compression, Rate Limiter

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
│       ├── middleware/        # Security, Rate Limiter, Request Logger, Admin Auth
│       ├── models/            # ContactMessage.js, Portfolio.js, Visit.js
│       ├── routes/            # portfolio.js, contact.js, visits.js
│       ├── services/          # portfolioStore.js
│       └── utils/             # http.js, logger.js
├── data/
│   └── portfolio.json         # Master dataset (Projects, Achievements, Skills, Experience)
├── frontend/
│   ├── client/                # Public Portfolio React App
│   │   ├── src/
│   │   │   ├── components/    # SeoManager.jsx, etc.
│   │   │   ├── pages/         # Home.jsx, ProjectDetail.jsx, AchievementDetail.jsx
│   │   │   ├── api.js
│   │   │   └── App.jsx
│   └── admin/                 # Recruiter Messages Inbox & Visual Portfolio Editor
│       ├── src/
│       │   ├── api.js
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

---

## 📄 License

This repository is open-source and available under the [MIT License](LICENSE).
