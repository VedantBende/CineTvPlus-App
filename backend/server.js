import dotenv from 'dotenv';
import dns from 'dns';

// Force Node to prioritize IPv4 over IPv6 to avoid ENETUNREACH errors in some cloud environments (like Render)
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

// Load environment variables from .env file in development
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

// DNS bypass must be imported FIRST — before any network calls
import { getCacheStats } from './services/tmdbService.js';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import favoritesRoutes from './routes/favorites.routes.js';
import historyRoutes from './routes/history.routes.js';
import tmdbRoutes from './routes/tmdb.routes.js';
import continueWatchingRoutes from './routes/continueWatching.routes.js';
import animeRoutes from './routes/anime.routes.js';
import { initDatabaseKeepAlive, checkDatabaseHealth } from './utils/dbHealth.js';
import { startCronJobs } from './utils/cronJobs.js';
import { globalLimiter, tmdbLimiter, dbWriteLimiter } from './middleware/rateLimiter.middleware.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Trust reverse proxy (Render, Vercel, Nginx, etc.) so rate limiters use the correct client IP
app.set('trust proxy', 1);

// Connect to MongoDB
connectDB();

// Initialize DB Keep-Alive (runs every 24h)
initDatabaseKeepAlive();

// Initialize Time-Based Access Revocation Cron Job
startCronJobs();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", process.env.TMDB_BASE_URL],
      frameSrc: [
        "'self'", 
        process.env.PLAYER_ALPHA_BASE_URL,
        process.env.PLAYER_BETA_BASE_URL, 
        process.env.PLAYER_BETA_WILDCARD_URL,
        process.env.PLAYER_GAMMA_BASE_URL,
        process.env.PLAYER_DELTA_EPSILON_BASE_URL,
      ],
      frameAncestors: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS Configuration - BEFORE routes
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://cinetvplus.vercel.app',
  'http://localhost:3000',
  /\.devtunnels\.ms$/
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser middleware - BEFORE routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Additional security headers
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
});

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Root Wake Route (Instant response for Render Load Balancer)
app.get('/', (req, res) => {
  res.status(200).send('🚀 CineTv+ API: Active');
});

// Apply Global Rate Limiter to all routes EXCEPT the root health check
app.use(globalLimiter);

// Routes - AFTER all middleware
app.get('/api/health', async (req, res) => {
  const dbHealth = await checkDatabaseHealth();
  res.json({
    status: '✅ CineTv+ Backend Running',
    timestamp: new Date(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    database: dbHealth,
    cache: getCacheStats()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/favorites', dbWriteLimiter, favoritesRoutes);
app.use('/api/history', dbWriteLimiter, historyRoutes);
app.use('/api/tmdb', tmdbLimiter, tmdbRoutes);
app.use('/api/continue-watching', dbWriteLimiter, continueWatchingRoutes);
app.use('/api/anime', tmdbLimiter, animeRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Something went wrong!'
      : err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Startup Logging
const server = app.listen(PORT, () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🚀 CineTv+ Server listening on Port: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Health Check: http://localhost:${PORT}/api/health`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Process terminated');
  });
});

export default app;