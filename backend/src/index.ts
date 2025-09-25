import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import { connectDatabase } from './database/connection';
import apiRoutes from './routes';
import authRoutes from './routes/auth';

const app = express();

// CORS configuration with explicit origin function
const corsOptions = {
    origin: function (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) {
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:5173',
            'http://localhost:8080',
            'http://localhost:8081',
            'http://localhost:8082',
            'https://prism-nine-jade.vercel.app',
            'vscode://extension'
        ];
        
        // Allow requests with no origin (mobile apps, curl, etc)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log('CORS blocked origin:', origin);
            callback(new Error('Not allowed by CORS'), false);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Team-ID', 'Accept', 'Origin'],
    optionsSuccessStatus: 200 // For legacy browsers
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session configuration (optional, mainly for web dashboard)
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/prism';

app.use(session({
    secret: process.env.SESSION_SECRET || 'prism-session-secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: MONGODB_URI,
        touchAfter: 24 * 3600 // Lazy session update
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    }
}));

// Connect to MongoDB
connectDatabase();

// Health check route
app.get('/', (_req, res) => {
  res.json({
    message: 'Welcome to Prism Backend!',
    status: 'running',
    version: '2.0.2',
    timestamp: new Date().toISOString(),
    features: {
      authentication: 'User login/register with JWT',
      teams: 'Team creation and management with invite codes',
      projects: 'Project collaboration and management',
      tasks: 'Task management and tracking',
      conflicts: 'AI-powered conflict detection',
      chat: 'Real-time team communication',
      extension: 'VS Code extension integration'
    },
    endpoints: {
      auth: '/api/auth/*',
      tasks: '/api/tasks',
      team: '/api/team',
      conflicts: '/api/conflicts',
      chat: '/api/chat',
      status: '/api/status'
    }
  });
});

// API status endpoint
app.get('/api/status', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: 'connected',
    version: '2.0.2'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    message: 'Internal server error',
    code: 'SERVER_ERROR',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({
    message: 'Endpoint not found',
    code: 'NOT_FOUND',
    path: req.path,
    method: req.method
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Prism Server v2.0.2 running on port ${PORT}`);
  console.log(`📱 VS Code Extension API: http://localhost:${PORT}/api`);
  console.log(`🔐 Authentication API: http://localhost:${PORT}/api/auth`);
  console.log(`🌐 Frontend Dashboard: http://localhost:5173 (if running)`);
  console.log(`📋 API Documentation: http://localhost:${PORT}/`);
  console.log(`🔗 CORS enabled for: https://prism-nine-jade.vercel.app`);
});
