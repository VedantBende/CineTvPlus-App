# 🎬 CineTvPlus — Frontend

CineTvPlus is a **modern movie & TV streaming-style web application** focused on delivering a **clean, responsive, and immersive UI/UX** experience.
This folder contains the complete **frontend codebase** of the project.

---

## ⚠️ Important Note

> This frontend is **currently designed to work independently**.
> A **backend is connected and planned for future updates**, such as:
>
> * Watchlist synchronization
> * Dynamic data handling
> * Scalability & performance improvements
>
> At present, backend integration is **limited / under development**, and the frontend primarily showcases **UI, routing, and client-side functionality**.

---

## ✨ Features

* 🎥 Movie & TV series browsing UI
* 🔍 Search & filter interface
* ❤️ Watchlist / favorites UI (client-side)
* 📱 Fully responsive design
* 🎨 Netflix-inspired modern UI
* ⚡ Fast performance with Vite

---

## 🧱 Tech Stack

* **React**
* **Vite**
* **React Router**
* **Tailwind CSS**
* **JavaScript (ES6+)**

---

## 📦 Prerequisites

* **Node.js** (v16 or higher)
* **npm / yarn / pnpm**

---

## 🚀 Getting Started

Clone the repository and navigate to the frontend folder:

```bash
git clone https://github.com/VedantBende/CineTvPlus.git
cd CineTvPlus/frontend
```

Install dependencies:

```bash
npm install
```

---

## 🧪 Run Locally

```bash
npm run dev
```

Open:

```
http://localhost:3000
```

---

## 🏗️ Build for Production

```bash
npm run build
```

Preview build:

```bash
npm run preview
```

---

## 📁 Project Structure

```
frontend/
├─ public/
│  ├─ CineLogo.svg
│  └─ manifest.json
├─ src/
│  ├─ assets/
│  │  └─ react.svg
│  ├─ components/
│  │  ├─ common/
│  │  │  ├─ Footer.jsx
│  │  │  ├─ Navbar.jsx
│  │  │  ├─ Sidebar.jsx
│  │  │  └─ ThemeToggle.jsx
│  │  ├─ media/
│  │  │  ├─ ContinueWatching.jsx
│  │  │  ├─ EpisodeList.jsx
│  │  │  ├─ FavoriteButton.jsx
│  │  │  ├─ MovieCard.jsx
│  │  │  └─ PlayerFrame.jsx
│  │  └─ ui/
│  │     ├─ ErrorMessage.jsx
│  │     ├─ Loader.jsx
│  │     └─ OptimizedImage.jsx
│  ├─ context/
│  │  └─ ThemeContext.jsx
│  ├─ hooks/
│  │  └─ useClickProtection.js
│  ├─ layouts/
│  │  └─ MainLayout.jsx
│  ├─ pages/
│  │  ├─ FavoritesPage.jsx
│  │  ├─ HomePage.jsx
│  │  ├─ Login.jsx
│  │  ├─ MovieDetails.jsx
│  │  ├─ MoviesPage.jsx
│  │  ├─ Register.jsx
│  │  ├─ SearchPage.jsx
│  │  ├─ SettingsPage.jsx
│  │  ├─ TVDetails.jsx
│  │  ├─ TVShowsPage.jsx
│  │  └─ WatchPage.jsx
│  ├─ router/
│  │  └─ index.jsx
│  ├─ store/
│  │  ├─ authStore.js
│  │  └─ mediaStore.js
│  ├─ styles/
│  │  ├─ globals.css
│  │  ├─ tailwind.css
│  │  ├─ themes.css
│  │  └─ variables.css
│  ├─ utils/
│  │  ├─ api.js
│  │  ├─ formatters.js
│  │  ├─ googleCseApi.js
│  │  ├─ progressTracker.js
│  │  └─ tmdbApi.js
│  ├─ App.css
│  ├─ App.jsx
│  ├─ index.css
│  └─ main.jsx
├─ .env
├─ .gitignore
├─ eslint.config.js
├─ index.html
├─ package-lock.json
├─ package.json
├─ postcss.config.cjs
├─ README.md
├─ tailwind.config.js
└─ vite.config.js

```

---

## 🎯 Project Vision

CineTvPlus is built as a **scalable streaming platform**, with the frontend ready for:

* Backend-driven content
* Secure authentication
* User personalization
* Real-time updates

The current version emphasizes **frontend architecture, UI quality, and performance**, while leaving room for future backend enhancements.

---

## 📜 License

MIT License

---

