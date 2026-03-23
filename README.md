# ⚠️ Educational Purpose Only

**This project is built strictly for educational and demonstration purposes.**

It does **NOT** promote, support, or encourage any form of illegal activity.

All movie and TV show related data (such as titles, posters, and metadata) is publicly fetched from third-party APIs (such as TMDB). **This application does NOT host, store, or distribute any copyrighted media content.**

The platform enables users to explore and interact with media content through third-party integrations and embedded sources for demonstration purposes only. The servers only store user-related data such as account information, preferences, watch history, and favorites.

---

# 🍿 CineTv+

A full-stack, OTT-style streaming platform designed to provide a premium cinematic browsing experience. Built with a modern tech stack, CineTv+ features secure authentication, an admin-controlled access system, and deep integration with the TMDB API for rich, dynamic media exploring.

---

## ✨ Features

- **Robust Authentication & Sync**: Seamless email and social login via Clerk, instantly synced with a custom MongoDB backend.
- **Admin-Controlled Access Gate**: New users are placed behind a "Request Access" gate upon signup. An administrative layer must manually approve, reject, or revoke network access.
- **Dynamic Media Browsing**: Explore thousands of movies and TV shows securely via the TMDB API, featuring Trending, Popular, Now Playing, and Top Rated sections.
- **Personalized Watchlists**: Save and manage a persistent list of favorites scoped directly to your account.
- **Watch History Tracking**: Automatically tracks the content you interact with for easy resume viewing.
- **Admin Dashboard**: A dedicated, role-based control panel to monitor platform metrics and moderate the user base.
- **Light & Dark Modes**: Complete styling overhauls specifically crafted for both light mode enthusiasts and dark cinematic experiences.

---

## 💻 Tech Stack

### 🎨 Frontend
- **Framework**: React (Vite)
- **Styling**: Tailwind CSS 
- **State Management**: Zustand (Auth, Media, UI state)
- **Routing**: React Router DOM
- **Authentication**: Clerk

### ⚙️ Backend
- **Environment**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (via Mongoose)
- **Security**: Helmet, CORS configurations for strict origin allowance

### ☁️ APIs & Deployment
- **External Data**: TMDB API (The Movie Database)
- **Frontend Hosting**: Vercel
- **Backend Hosting**: Render

---

## 🏗️ Project Architecture

CineTv+ utilizes a classic decoupled Client-Server architecture:
1. **Frontend (React)**: Handles all UI visualization, complex state management, and user interaction.
2. **Backend (Express)**: Acts as a secure intermediary layer, guarding the database and protecting sensitive API keys (like TMDB).
3. **Database (MongoDB)**: Stores immutable user records, access statuses (pending/approved/revoked), and user preferences (Watchlists/History).

*Data Flow*: The frontend sends authenticated REST requests using Clerk's JWT tokens. The Express backend validates these tokens via middleware before fulfilling requests against MongoDB or proxying media data from TMDB to bypass strict client-side CORS issues.

---

## 📂 Folder Structure

```text
cinetv-plus/
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable UI elements (Navbar, Cards, Modals)
│   │   ├── pages/        # Route-level components (Home, AccessGate, AdminPage)
│   │   ├── store/        # Zustand global state (authStore, mediaStore)
│   │   └── utils/        # Axios interceptors, TMDB fetching logic, helpers
│   ├── .env              # Local frontend environment variables
│   └── vite.config.js    # Vite configuration & development proxy
└── backend/
    ├── config/           # Database connections (db.js)
    ├── controllers/      # Route request/response logic 
    ├── middleware/       # JWT verifications, Role-checking, Rate limiters
    ├── models/           # Mongoose schemas (User.js)
    ├── routes/           # Express API endpoints
    ├── .env              # Sensitive backend secrets
    └── server.js         # Backend entry point
```

---

## 🚀 Installation & Setup

### 1. Fork and Clone the repository

1. Click the **Fork** button at the top right of this repository to create a copy under your account.
2. Clone your forked repository:
```bash
git clone https://github.com/your-username/cinetvplus.git
cd cinetvplus
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
TMDB_API_KEY=your_tmdb_api_key
FRONTEND_URL=http://localhost:3000
```
Start the backend development server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
```
Create a `.env` file in the `frontend/` directory:
```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_URL=/api
VITE_TMDB_API_KEY=your_tmdb_api_key
```
Start the frontend development server:
```bash
npm run dev
```

---

## 🌍 Deployment

- **Backend (Render)**: The `backend/` directory is deployed as a Web Service on Render. The `FRONTEND_URL` environment variable is strictly set to the Vercel app domain to enforce secure CORS policies.
- **Frontend (Vercel)**: The `frontend/` directory is deployed seamlessly via Vercel. `VITE_API_URL` points directly to the live Render backend URL (`https://your-backend.onrender.com/api`).

---

## 🎮 Usage Guide

1. **Register**: Sign up using the Clerk-powered authentication screen.
2. **Request Access**: Upon registration, your account is immediately flagged as "Pending". You will be directed to the Access Gate screen.
3. **Admin Approval**: An administrative account must log in, navigate to the Admin Dashboard, and manually "Approve" your account.
4. **Cinematic Experience**: Once approved, refresh your page to explore TMDB catalogs, manage your Watchlist across devices, and utilize the full UI!

---

## 🔒 Security & Access Control

- **Role-Based Middlewares**: Express routes verifying `req.user.role === 'admin'` before allowing data mutations to sensitive endpoints (like modifying other users' access statuses).
- **Hardened Preflights**: The production backend enforces an explicit loopback array rejecting any traffic that does not originate organically from the authenticated Vercel frontend.
- **Token Verification**: Database mutations verify Clerk session tokens natively on the backend to prevent malicious client-side data tampering.

---

## 🔮 Future Improvements

- **Real-time Metrics**: Integrating Socket.io or Server-Sent Events (SSE) to display live active user counts on the Admin Dashboard natively.
- **Cine-AI Recommendations**: Training custom ML vector embeddings on a user's Watchlist history to recommend un-discovered, highly relevant TMDB entries.
- **Advanced Caching**: Storing aggressively fetched TMDB grids on a Redis layer to cut backend compute costs and drastically decrease Time-To-First-Byte (TTFB).

---

## 👨‍💻 Author

**Vedant Bende**
- [GitHub](https://github.com/VedantBende)
- [Portfolio](https://vedantbende.github.io/Portfolio-2.0/)
- [LinkedIn](https://www.linkedin.com/in/vedant-bende-3aa28b2a8/)
