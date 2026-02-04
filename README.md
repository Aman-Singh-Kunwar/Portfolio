# Full Stack Portfolio (MERN)

> A clean, responsive, full stack portfolio with a public client, an admin panel to edit content, and a Node/Express API backed by MongoDB. Content is stored in `data/portfolio.json` and synced to the database.

---

## 📑 Table of Contents

1. [Overview](#overview)
2. [Project Architecture](#project-architecture)
3. [Tech Stack](#tech-stack)
4. [Features](#features)
5. [Quick Start](#quick-start)
6. [Updating Content](#updating-content)
7. [License](#license)
8. [Acknowledgments](#acknowledgments)

---

## Overview

- **Purpose:** Showcase projects, skills, experience, and achievements with editable data.
- **Live Demo:** [Portfolio Live Demo](https://aman-singh-kunwar.github.io/Portfolio/)
- **Repository:** [Portfolio GitHub Repo](https://github.com/Aman-Singh-Kunwar/Portfolio)
- **Screenshots:** ![Portfolio Screenshot](/frontend/client/public/images/portfolio.jpg)

---

## Project Architectures

- **Client:** Public portfolio site (React + Tailwind + Vite).
- **Admin:** Internal panel to edit JSON content (React + Tailwind + Vite).
- **Backend:** Express API (CRUD for portfolio + auth guard).
- **Database:** MongoDB via Mongoose.
- **Data Sync:** JSON file ⇄ DB sync on backend startup.

```
portfolio/
├── backend/
├── data/
│   └── portfolio.json
├── frontend/
│   ├── client/
│   └── admin/
└── README.md
```

---

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS
- **Admin:** React, Vite, Tailwind CSS
- **Backend:** Node.js, Express
- **Database:** MongoDB (Mongoose)

---

## Features

- Responsive client UI (projects, skills, experience, achievements)
- Admin panel to edit JSON content
- Project detail pages + achievement detail pages with gallery
- MongoDB-backed API with auto-seed from `data/portfolio.json`
- Local JSON + DB kept in sync on backend start

---

## Quick Start

### 1) Backend

1. Create `backend/.env` and set values:
   - `PORT`
   - `MONGO_URI`
   - `ADMIN_TOKEN`
   - `CORS_ORIGINS`
2. Install and run:

```bash
cd backend
npm install
npm run dev
```

### 2) Client

1. Create `frontend/client/.env` if needed:
   - `VITE_API_URL`
2. Install and run:

```bash
cd frontend/client
npm install
npm run dev
```

### 3) Admin

1. Create `frontend/admin/.env` if needed:
   - `VITE_API_URL`
2. Install and run:

```bash
cd frontend/admin
npm install
npm run dev
```

## Updating Content

- **Admin UI (recommended):** Load JSON, edit, and save.
- **Manual:** Edit `data/portfolio.json` and restart backend to sync.

---

## 📜 License

This project is open-source and free to use.

---
