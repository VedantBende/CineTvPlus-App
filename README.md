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
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ README.md
│  ├─ server.js
│  └─ vercel.json
├─ frontend/
│  ├─ public/
│  │  ├─ CineLogo.svg
│  │  └─ manifest.json
│  ├─ src/
│  │  ├─ assets/
│  │  │  └─ react.svg
│  │  ├─ components/
│  │  │  ├─ common/
│  │  │  │  ├─ Footer.jsx
│  │  │  │  ├─ Navbar.jsx
│  │  │  │  ├─ Sidebar.jsx
│  │  │  │  └─ ThemeToggle.jsx
│  │  │  ├─ media/
│  │  │  │  ├─ ContinueWatching.jsx
│  │  │  │  ├─ EpisodeList.jsx
│  │  │  │  ├─ FavoriteButton.jsx
│  │  │  │  ├─ MovieCard.jsx
│  │  │  │  └─ PlayerFrame.jsx
│  │  │  └─ ui/
│  │  │     ├─ ErrorMessage.jsx
│  │  │     ├─ Loader.jsx
│  │  │     └─ OptimizedImage.jsx
│  │  ├─ context/
│  │  │  └─ ThemeContext.jsx
│  │  ├─ hooks/
│  │  │  └─ useClickProtection.js
│  │  ├─ layouts/
│  │  │  └─ MainLayout.jsx
│  │  ├─ pages/
│  │  │  ├─ FavoritesPage.jsx
│  │  │  ├─ HomePage.jsx
│  │  │  ├─ Login.jsx
│  │  │  ├─ MovieDetails.jsx
│  │  │  ├─ MoviesPage.jsx
│  │  │  ├─ Register.jsx
│  │  │  ├─ SearchPage.jsx
│  │  │  ├─ SettingsPage.jsx
│  │  │  ├─ TVDetails.jsx
│  │  │  ├─ TVShowsPage.jsx
│  │  │  └─ WatchPage.jsx
│  │  ├─ router/
│  │  │  └─ index.jsx
│  │  ├─ store/
│  │  │  ├─ authStore.js
│  │  │  └─ mediaStore.js
│  │  ├─ styles/
│  │  │  ├─ globals.css
│  │  │  ├─ tailwind.css
│  │  │  ├─ themes.css
│  │  │  └─ variables.css
│  │  ├─ utils/
│  │  │  ├─ api.js
│  │  │  ├─ formatters.js
│  │  │  ├─ googleCseApi.js
│  │  │  ├─ progressTracker.js
│  │  │  └─ tmdbApi.js
│  │  ├─ App.css
│  │  ├─ App.jsx
│  │  ├─ index.css
│  │  └─ main.jsx
│  ├─ .env
│  ├─ .gitignore
│  ├─ eslint.config.js
│  ├─ index.html
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ postcss.config.cjs
│  ├─ README.md
│  ├─ tailwind.config.js
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
