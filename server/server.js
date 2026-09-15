require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const rateLimit  = require('express-rate-limit');

const connectDB      = require('./config/db');
const errorHandler   = require('./middleware/errorHandler');
const authRoutes     = require('./routes/auth');
const eventRoutes    = require('./routes/events');
const userRoutes     = require('./routes/users');

// ── Database ─────────────────────────────────────────────────────────────────
connectDB();

const app = express();

// ── Security ──────────────────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow Cloudinary images
  })
);

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  /\.vercel\.app$/,  // all Vercel preview deployments
  /\.netlify\.app$/, // all Netlify deployments
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // curl / Postman
      const allowed = allowedOrigins.some((o) =>
        o instanceof RegExp ? o.test(origin) : o === origin
      );
      allowed
        ? callback(null, true)
        : callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ── Logging ───────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ── Body parsers ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Rate limiting ─────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many auth attempts. Try again in 15 minutes.' },
});

app.use('/api', globalLimiter);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',   authLimiter, authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/users',  userRoutes);

// Health check (used by Render / Railway for uptime monitoring)
app.get('/api/health', (_req, res) => {
  res.json({
    status:    'OK',
    service:   'EventHub API',
    timestamp: new Date().toISOString(),
    env:       process.env.NODE_ENV,
  });
});

// 404
app.use('*', (_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Global error handler (must be last) ───────────────────────────────────────
app.use(errorHandler);

// ── Start server ──────────────────────────────────────────────────────────────
const PORT   = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(
    `🚀  EventHub API  |  Port ${PORT}  |  ${process.env.NODE_ENV || 'development'}`
  );
});

// Graceful shutdown
const shutdown = (signal) => {
  console.log(`\n${signal} received. Closing server…`);
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

process.on('unhandledRejection', (err) => {
  console.error('💥 Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err.message);
  process.exit(1);
});

module.exports = app;
