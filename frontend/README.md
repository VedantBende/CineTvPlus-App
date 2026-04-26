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
A custom gatekeeping UI component built to handle the "Pending" user state. Fresh signups are held here globally until an Admin explicitly grants network access through the dashboard. Users are automatically notified via **email** once their access status reflects a change.

### 3. Progressive Admin Dashboard
A dedicated admin route protected by Role-Based Access Control (RBAC). It features dynamic stat cards, real-time user filtering (Name/Email), status categorization, and visually polished sliding drawers for managing user network access (Approve/Reject/Revoke).

### 4. Advanced Interactive Video Player
Powered by scalable architecture, the Video Player integrates proxy abstractions securely handling dynamic stream structures:
- **Multi-Server UI**: Users pick and freely toggle between multiple abstracted servers (Alpha, Beta, Gamma, Delta, Epsilon) safely storing their preference for fallback streaming capability.
- **TV Controls & URL Sync**: Features intuitive Season & Episode modal selectors natively modifying query parameters synchronously so deep-linking TV shows simply works.

### 5. Seamless Onboarding & States
- To protect UX, all fresh engagements on the watch-route load a mandatory "Before You Start" onboard flow safely persisting acknowledgement tokens directly to the `localStorage` minimizing database fetches.
- Progress and history optimistically mutate Zustand states while flushing to backend gracefully.

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

# TMDB Configuration (used for movie/TV metadata)
VITE_TMDB_API_KEY=your_tmdb_api_key
VITE_TMDB_BASE_URL=https://api.themoviedb.org/3
VITE_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p/w500
VITE_TMDB_BACKDROP_BASE_URL=https://image.tmdb.org/t/p/original

# Video Playback Proxy URLs (Intentional Obfuscation abstractions)
VITE_PLAYER_ALPHA_MOVIE=disabled
VITE_PLAYER_ALPHA_TV=disabled
VITE_PLAYER_BETA_MOVIE=disabled
VITE_PLAYER_BETA_TV=disabled
VITE_PLAYER_GAMMA_MOVIE=disabled
VITE_PLAYER_GAMMA_TV=disabled
VITE_PLAYER_DELTA_MOVIE=disabled
VITE_PLAYER_DELTA_TV=disabled
VITE_PLAYER_EPSILON_MOVIE=disabled
VITE_PLAYER_EPSILON_TV=disabled
VITE_PLAYER_DELTA_EPSILON_ORIGIN=disabled

# TMDB Cast Image (used in MovieDetails and TVDetails)
VITE_TMDB_CAST_IMAGE_BASE_URL=https://image.tmdb.org/t/p/w185
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
