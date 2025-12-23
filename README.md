# 🎬 CineTvPlus

CineTvPlus is a **full-stack movie & TV streaming-style web application** built as a **learning project with production-ready architecture in mind**.
It focuses on clean UI/UX, modern authentication, scalable backend design, and future extensibility.

🔗 **Live Demo:** [CineTv+](https://cinetvplus.vercel.app/)

---

## 📌 Project Overview

* **Type:** Full-Stack Application
* **Purpose:** Learning project (structured as production-ready)
* **Frontend:** Deployed on Vercel
* **Backend:** Under active development
* **Authentication:** Clerk

---

## 🧱 Tech Stack

### Frontend

* React
* Vite
* React Router
* Tailwind CSS

### Backend

* Node.js
* Express.js
* MongoDB (connected)
* Mongoose

### Authentication

* **Clerk** (current auth & user management)

---

## 🔐 Authentication & Data Handling

* Authentication is handled via **Clerk**
* User data is **currently stored in Clerk**
* MongoDB is connected and ready
* **Future updates will store user data in MongoDB**, while continuing to use Clerk for authentication

---

## 📡 Data Source

* Movie & TV content is fetched from a **third-party source**
* Backend APIs are being prepared for future data handling, persistence, and personalization

---

## 🚧 Development Status

### Completed

* Frontend UI & routing
* Clerk authentication integration
* MongoDB connection
* Core backend structure

### In Progress

* Backend routing
* Testing & validation
* Frontend ↔ backend integration
* User data persistence in MongoDB

---

## 📁 Repository Structure

```
cinetv-plus/
├─ backend/
│  ├─ config/
│  │  └─ db.js
│  ├─ middleware/
│  │  └─ clerkAuth.middleware.js
│  ├─ models/
│  │  ├─ User.js
│  │  └─ WatchProgress.js
│  ├─ routes/
│  │  ├─ continueWatching.routes.js
│  │  ├─ progress.routes.js
│  │  └─ watchlist.routes.js
│  ├─ utils/
│  │  └─ dbConnection.js
│  ├─ .env
│  ├─ .gitignore
│  ├─ package.json
│  ├─ server.js
│  └─ vercel.json
│
├─ frontend/
│  ├─ public/
│  │  ├─ CineLogo.svg
│  │  └─ manifest.json
│  ├─ src/
│  │  ├─ assets/
│  │  ├─ components/
│  │  │  ├─ common/
│  │  │  ├─ media/
│  │  │  └─ ui/
│  │  ├─ context/
│  │  ├─ hooks/
│  │  ├─ layouts/
│  │  ├─ pages/
│  │  ├─ router/
│  │  ├─ store/
│  │  ├─ styles/
│  │  ├─ utils/
│  │  ├─ App.jsx
│  │  └─ main.jsx
│  ├─ index.html
│  ├─ package.json
│  └─ vite.config.js
├─ package.json
└─ README.md
```

---

## 🎯 Project Goal

The goal of CineTvPlus is to evolve into a **fully functional, scalable streaming platform** while serving as a **strong learning and portfolio project**, following real-world development practices.

---

## 📜 License

MIT License
