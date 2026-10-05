import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';

// Routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import eventRoutes from './routes/event.routes';
import meetingRoutes from './routes/meeting.routes';
import financeRoutes from './routes/finance.routes';
import documentRoutes from './routes/document.routes';
import serviceHoursRoutes from './routes/serviceHours.routes';
import applicationRoutes from './routes/application.routes';
import notificationRoutes from './routes/notification.routes';
import dashboardRoutes from './routes/dashboard.routes';

const app = express();
const PORT = process.env.PORT || 4000;
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';

// ── Ensure uploads directory exists ─────────────────────────────────────────
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      process.env.CLIENT_URL,
      'http://localhost:3000',
      'http://localhost:5173',
    ].filter(Boolean);
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin || allowed.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Static uploads ───────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.resolve(UPLOAD_DIR)));

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), env: process.env.NODE_ENV });
});

// ── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/finances', financeRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/service-hours', serviceHoursRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ── Serve Frontend (production) ─────────────────────────────────────────────
// __dirname in compiled JS = /app/backend/dist
// frontend/dist = /app/frontend/dist  → go up 3 levels from __dirname
const frontendDist = path.resolve(__dirname, '../../../frontend/dist');
const frontendDistAlt = path.resolve(__dirname, '../../frontend/dist');
const resolvedFrontend = fs.existsSync(frontendDist) ? frontendDist
  : fs.existsSync(frontendDistAlt) ? frontendDistAlt
  : null;

console.log(`📦 Frontend dist lookup: ${frontendDist}`);
console.log(`📦 Frontend dist exists: ${resolvedFrontend ? resolvedFrontend : 'NOT FOUND'}`);

if (resolvedFrontend) {
  app.use(express.static(resolvedFrontend));
  // SPA fallback: serve index.html for all non-API routes
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
    } else {
      res.sendFile(path.join(resolvedFrontend, 'index.html'));
    }
  });
} else {
  // Dev mode: no frontend dist
  app.use((req, res) => {
    res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
  });
}


// ── Global Error Handler ──────────────────────────────────────────────────────
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ── Start Server ──────────────────────────────────────────────────────────────
app.listen(PORT as number, '0.0.0.0', () => {
  console.log(`\n🦁 Lions Club API running on http://localhost:${PORT}`);
  console.log(`📁 Uploads directory: ${path.resolve(UPLOAD_DIR)}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}\n`);
});

export default app;
