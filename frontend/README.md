# 🎨 CineTv+ Frontend

This directory contains the user-facing React application for **CineTv+**, built with modern web technologies to deliver a premium, Netflix-inspired cinematic streaming experience.

---

## 🛠️ Tech Stack & Key Libraries

- **Framework**: React 18 powered by **Vite** for blazing fast HMR and optimized production builds.
- **Styling**: **Tailwind CSS** for strictly utility-first, responsive, and highly customizable UI design (including robust Light/Dark mode support).
- **State Management**: **Zustand** for lightweight, boilerplate-free global state (Auth state, Media browsing state).
- **Authentication**: **@clerk/clerk-react** for secure, drop-in user management, social logins, and JWT session handling.
- **Routing**: **React Router DOM** (v6) for seamless client-side navigation.
- **Network Requests**: Native `fetch` API structured intuitively via utility singletons.

---

## 🏗️ Core Functionalities

### 1. Interactive Media Explorer
Integrates with our backend proxy to dynamically fetch TMDB catalog data. Features distinct horizontal scroll rows for *Trending*, *Top Rated*, *Now Playing*, and *Popular* media.

### 2. Access Gate
A custom gatekeeping UI component built to handle the "Pending" user state. Fresh signups are held here globally until an Admin explicitly grants network access through the dashboard.

### 3. Progressive Admin Dashboard
A dedicated admin route protected by Role-Based Access Control (RBAC). It features dynamic stat cards, real-time user filtering (Name/Email), status categorization, and visually polished sliding drawers for managing user network access (Approve/Reject/Revoke).

### 4. Personal Watchlists & History
Users can seamlessly curate personal favorites and resume watching content. Local Zustand state updates optimistically, syncing quietly to the backend in the background to ensure high perceived performance.

---

## ⚙️ Local Development Setup

### Prerequisites
Make sure you have Node.js (v18+) installed.

1. **Install Dependencies**:
```bash
npm install
```

2. **Environment Variables**:
Create a `.env` file at the root of the `frontend/` directory:
```env
# Clerk Authentication Keys
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key

# Backend API Resolution (Use /api to leverage Vite's local proxy)
VITE_API_URL=/api

# Third-Party Keys
VITE_TMDB_API_KEY=your_tmdb_api_key
VITE_TMDB_BASE_URL=https://api.themoviedb.org/3
VITE_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p/w500
VITE_PLAYER_BASE_URL=https://www.vidking.net/embed
```

3. **Start the Development Server**:
```bash
npm run dev
```
The frontend will start on `http://localhost:3000`. By default, Vite is configured (`vite.config.js`) to seamlessly proxy `/api` requests over to `http://127.0.0.1:5000` assuming your backend is running simultaneously.

---

## 📦 Build & Deployment (Vercel)

To compile the application for production:
```bash
npm run build
```

**Deploying to Vercel**:
When deploying this frontend explicitly via Vercel, ensure you bind `VITE_API_URL` directly to your live production backend (e.g., `https://your-backend.onrender.com/api`) in Vercel's Environment Variables dashboard so API requests route correctly over the public internet.

---

## 👨‍💻 Maintainer

Created and maintained by **Vedant Bende**.
- [GitHub Profile](https://github.com/VedantBende)
- [LinkedIn Profile](https://www.linkedin.com/in/vedant-bende-3aa28b2a8/)
