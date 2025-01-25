console.log('=== Starting server.ts ===');

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

import express from 'express';
import net from 'net';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { analyzeHandler } from './api/analyze.js';
import { generateHandler } from './api/generate.js';
import { titleHandler } from './api/title.js';
import { trendsHandler } from './api/trends.js';
import { trendsSummaryHandler } from './api/trendsSummary.js';
import { youtubeInsightsHandler } from './api/youtubeInsights.js';
import { validateServerEnv, getHealthStatus } from './config/server-env.js';
import { spotifyAuthService } from './services/spotifyAuth.js';
import dotenv from 'dotenv';
import path from 'path';
import session from 'express-session';
import crypto from 'crypto';
import authRoutes from './routes/auth.js';
import spotifyRoutes from './routes/spotify.js';

// Port conflict resolution utility
const getAvailablePort = (startPort: number): Promise<number> => {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(startPort, () => {
      const port = (server.address() as net.AddressInfo).port;
      server.close(() => resolve(port));
    });
    server.on('error', () => resolve(getAvailablePort(startPort + 1)));
  });
};

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

// Validate environment variables before starting the server
try {
  validateServerEnv();
  console.log('[Server] Environment validation passed');
} catch (error: unknown) {
  const message = error instanceof Error ? error.message : 'Unknown error during environment validation';
  console.error('[Server] Environment validation failed:', message);
  process.exit(1);
}

async function initializeSpotifyWithRetry(maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[Server] Initializing Spotify authentication (attempt ${attempt}/${maxRetries})...`);
      await spotifyAuthService.getAccessToken();
      console.log('[Server] Spotify authentication initialized successfully');
      return true;
    } catch (error) {
      console.error(`[Server] Spotify authentication failed (attempt ${attempt}/${maxRetries}):`, error);
      if (attempt === maxRetries) {
        throw error;
      }
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
  return false;
}

async function initializeServer() {
  try {
    // Initialize Spotify authentication with retry
    await initializeSpotifyWithRetry();

    const app = express();
    const port = await getAvailablePort(3000);
    process.env.VITE_API_PORT = port.toString();

    // Enable CORS and JSON parsing
    app.use(cors({
      origin: process.env.NODE_ENV === 'production' 
        ? process.env.CLIENT_URL 
        : 'http://localhost:5173',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));
    app.use(express.json());

    // Add session middleware with secure configuration
    const sessionSecret = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
    app.use(session({
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      }
    }));

    // Request logging middleware
    app.use((req, res, next) => {
      const start = Date.now();
      const requestId = Math.random().toString(36).substring(7);
      
      // Log request
      console.log(`[${new Date().toISOString()}][${requestId}] ${req.method} ${req.url}`);
      if (req.method === 'POST') {
        console.log(`[${requestId}] Request body:`, JSON.stringify(req.body, null, 2));
      }

      // Log response
      const oldJson = res.json;
      res.json = function(body) {
        const responseTime = Date.now() - start;
        console.log(`[${requestId}] Response (${responseTime}ms):`, JSON.stringify(body, null, 2));
        return oldJson.apply(res, [body]);
      };

      next();
    });

    // Enhanced health check endpoint
    app.get('/api/health', (req, res) => {
      const health = getHealthStatus();
      res.json({
        ...health,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        spotify: {
          authenticated: req.session.spotifyTokens ? true : false
        }
      });
    });

    // Mount auth routes
    app.use('/api/auth', authRoutes);
    app.use('/api/spotify', spotifyRoutes);

    // API routes with error handling
    const asyncHandler = (fn: Function) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
      return Promise.resolve(fn(req, res, next)).catch(next);
    };

    app.post('/api/analyze', asyncHandler(analyzeHandler));
    app.post('/api/generate', asyncHandler(generateHandler));
    app.post('/api/title', asyncHandler(titleHandler));
    app.get('/api/trending-genres', asyncHandler(trendsHandler));
    app.get('/api/youtube-insights', asyncHandler(youtubeInsightsHandler));
    app.get('/api/trends/summary', asyncHandler(trendsSummaryHandler));

    // Error handling middleware
    app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('[Server] Error:', err);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred',
        timestamp: new Date().toISOString()
      });
    });

    // Start server
    app.listen(port, () => {
      console.log(`[Server] Server is running on port ${port}`);
      console.log('[Server] Available endpoints:');
      console.log(`- http://localhost:${port}/api/health`);
      console.log(`- http://localhost:${port}/api/trending-genres`);
      console.log(`- http://localhost:${port}/api/youtube-insights`);
      console.log(`- http://localhost:${port}/api/trends/summary`);
      console.log('[Server] Environment:', process.env.NODE_ENV || 'development');
      console.log('[Server] Node.js version:', process.version);
    });
  } catch (error) {
    console.error('[Server] Failed to initialize server:', error);
    process.exit(1);
  }
}

initializeServer();
