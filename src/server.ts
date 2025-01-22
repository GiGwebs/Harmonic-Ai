import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { analyzeHandler } from './api/analyze.js';
import { generateHandler } from './api/generate.js';
import { titleHandler } from './api/title.js';
import dotenv from 'dotenv';
import path from 'path';
async function initializeServer() {
  try {
    // Load environment variables first
    const envPath = path.resolve(process.cwd(), '.env');
    console.log('[Server] Loading environment variables from:', envPath);
    const result = dotenv.config({
      path: envPath,
      override: true // Ensure variables are reloaded
    });

    if (result.error) {
      console.error('[Server] Error loading .env file:', result.error);
      process.exit(1);
    }

    // Force environment variable refresh
    Object.keys(result.parsed || {}).forEach(key => {
      process.env[key] = result.parsed?.[key];
    });

    // Log all environment variables for debugging
    console.log('[Server] Environment check:', {
      firebase: {
        admin: {
          projectId: process.env.FIREBASE_ADMIN_PROJECT_ID ? 'present' : 'missing',
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL ? 'present' : 'missing',
          privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY ? 'present' : 'missing'
        },
        client: {
          apiKey: process.env.VITE_FIREBASE_API_KEY ? 'present' : 'missing',
          projectId: process.env.VITE_FIREBASE_PROJECT_ID ? 'present' : 'missing'
        }
      }
    });

    // Initialize Firebase Admin
    const { initializeFirebaseAdmin } = await import('./lib/firebase.server.js');
    console.log('[Server] Importing Firebase Admin SDK...');
    const db = await initializeFirebaseAdmin();
    console.log('[Server] Firebase Admin initialized successfully with database:', !!db);

    return db;
  } catch (error) {
    console.error('[Server] Initialization error:', error);
    process.exit(1);
  }
}

// Initialize server before proceeding
await initializeServer();

// Verify environment variables
const requiredEnvVars = [
  'VITE_OPENAI_API_KEY',
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_PROJECT_ID'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

console.log('[Server] Environment variables loaded successfully');
console.log('[Server] OpenAI API Key present:', !!process.env.VITE_OPENAI_API_KEY);
console.log('[Server] Firebase config present:', !!process.env.VITE_FIREBASE_API_KEY);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  // Log request
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (req.method === 'POST') {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
  }

  // Log response
  const oldJson = res.json;
  res.json = function(body) {
    const responseTime = Date.now() - start;
    console.log(`Response time: ${responseTime}ms`);
    if (body.error) {
      console.error('Response error:', body.error);
    }
    return oldJson.call(this, body);
  };

  next();
});

// CORS configuration
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.path}`, {
    body: req.body,
    query: req.query,
    headers: req.headers
  });
  next();
});

// API routes
app.post('/generate', (req, res) => {
  console.log('[API] Generate request received:', {
    body: req.body,
    contentType: req.headers['content-type']
  });
  generateHandler(req, res);
});
app.post('/title', (req, res) => {
  console.log('[API] Title request received:', {
    body: req.body,
    contentType: req.headers['content-type']
  });
  titleHandler(req, res);
});
app.post('/analyze', analyzeHandler);

// Global error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', err);
  
  // Ensure we haven't already sent a response
  if (!res.headersSent) {
    res.status(500).json({
      error: 'Internal server error',
      message: err instanceof Error ? err.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`[Server] Listening on port ${port}`);
});
