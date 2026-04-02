require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');

const { requireAuth } = require('./middleware/auth');
const gameInjector = require('./middleware/gameInjector');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// --- Security headers ---
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.jsdelivr.net", "https://fonts.googleapis.com"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'", "https://cdn.jsdelivr.net"],
      mediaSrc: ["'self'", "blob:", "data:"],
      workerSrc: ["'self'", "blob:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// --- CORS ---
app.use(cors({
  origin: isProduction ? (process.env.ALLOWED_ORIGIN || true) : true,
  credentials: true,
}));

// --- Trust proxy (for Render) ---
app.set('trust proxy', 1);

// --- Body parsing ---
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// --- Global rate limiter ---
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
}));

// --- Auth rate limiter (stricter) ---
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts. Please try again later.' },
});

// --- API Routes ---
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/admin', adminRoutes);

// --- Paths ---
const publicDir = path.join(__dirname, '..', 'public');
const gamesDir = path.join(publicDir, 'games');

// --- Protected game routes (MUST come before general static serving) ---
// 1. Auth check for all /games/* requests
app.use('/games', requireAuth);

// 2. Inject back button into game index.html files
app.use(gameInjector(gamesDir));

// 3. Serve game static files (CSS, JS, images, audio, etc.)
app.use('/games', express.static(gamesDir));

// --- Serve public static files (login.html, library.html, CSS, JS) freely ---
// Games are already handled above, so they won't reach this middleware
app.use(express.static(publicDir, {
  index: false, // Don't auto-serve index.html for /
  extensions: ['html'],
}));

// --- Root redirect ---
app.get('/', (req, res) => {
  const token = req.cookies?.token;
  if (token) {
    return res.redirect('/library.html');
  }
  return res.redirect('/login.html');
});

// --- Admin page guard ---
app.get('/admin.html', requireAuth, (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.redirect('/library.html');
  }
  res.sendFile(path.join(publicDir, 'admin.html'));
});

// --- 404 ---
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// --- Error handler ---
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({
    error: isProduction ? 'Internal server error' : err.message,
  });
});

// --- Env validation ---
const requiredEnv = ['DATABASE_URL', 'JWT_SECRET'];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`Missing required env var: ${key}`);
    process.exit(1);
  }
}

// --- Start server ---
app.listen(PORT, () => {
  console.log(`Game Portal running on http://localhost:${PORT}`);
  console.log(`Environment: ${isProduction ? 'production' : 'development'}`);
});
