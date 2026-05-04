import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { toNodeHandler } from "better-auth/node";
import { auth } from './app/lib/auth';
import router from './app/routes';
import globalErrorHandler from './app/middleware/globalErrorHandler';
import notFound from './app/middleware/notFound';


console.log('App.ts loading...');
const app: Application = express();
const SELF_ASSIGNABLE_ROLES = new Set(['USER', 'ORGANIZER']);

// CORS (must be before parsers for preflight OPTIONS handling)
const allowedOrigins = [
  process.env.CLIENT_URL?.replace(/\/$/, '') || 'http://localhost:3000',
  process.env.CLIENT_URL || 'http://localhost:3000',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      console.error(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Parsers
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Request Logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Better-Auth Core Handler
app.use('/api/v1/auth', (req, res, next) => {
  console.log(`Auth Middleware Hit: ${req.method} ${req.url}`);
  if (req.method !== 'POST') {
    return next();
  }

  const isSignUpPath = req.path.includes('sign-up');
  if (!isSignUpPath) {
    return next();
  }

  const role = req.body?.role;
  if (typeof role === 'string' && !SELF_ASSIGNABLE_ROLES.has(role)) {
    req.body.role = 'USER';
  }

  return next();
});

app.all("/api/v1/auth/*path", toNodeHandler(auth));

// Application Routes
app.use('/api/v1', router);

// Base Route
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Planora API!'
  });
});

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    status: 'ok',
    message: 'Planora backend is healthy',
    timestamp: new Date().toISOString(),
  });
});

// Global Error Handler & Not Found Middleware
app.use(notFound);
app.use(globalErrorHandler);

export default app;
