import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Load environment variables from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

interface ServerEnvConfig {
  NODE_ENV: string;
  YOUTUBE_API_KEY: string;
  SPOTIFY_CLIENT_ID: string;
  SPOTIFY_CLIENT_SECRET: string;
  SPOTIFY_REDIRECT_URI: string;
  SPOTIFY_SCOPES: string;
  SESSION_SECRET?: string;
  CLIENT_URL?: string;
}

export const serverEnv: ServerEnvConfig = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY || '',
  SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID || '',
  SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET || '',
  SPOTIFY_REDIRECT_URI: process.env.SPOTIFY_REDIRECT_URI || '',
  SPOTIFY_SCOPES: process.env.SPOTIFY_SCOPES || '',
  SESSION_SECRET: process.env.SESSION_SECRET,
  CLIENT_URL: process.env.CLIENT_URL,
};

/**
 * Validates required server environment variables
 * @throws {Error} If any required environment variables are missing
 */
export function validateServerEnv() {
  const requiredVars = [
    'YOUTUBE_API_KEY',
    'SPOTIFY_CLIENT_ID',
    'SPOTIFY_CLIENT_SECRET',
    'SPOTIFY_REDIRECT_URI',
    'SPOTIFY_SCOPES'
  ];

  const missing = requiredVars.filter(key => !serverEnv[key as keyof ServerEnvConfig]);

  if (missing.length > 0) {
    console.error('[Server Environment] Missing required variables:', {
      missing,
      timestamp: new Date().toISOString()
    });
    throw new Error(`Missing required server environment variables: ${missing.join(', ')}`);
  }

  // Validate production-specific variables
  if (serverEnv.NODE_ENV === 'production') {
    const prodVars = ['SESSION_SECRET', 'CLIENT_URL'];
    const missingProd = prodVars.filter(key => !serverEnv[key as keyof ServerEnvConfig]);
    
    if (missingProd.length > 0) {
      console.error('[Server Environment] Missing production variables:', {
        missing: missingProd,
        timestamp: new Date().toISOString()
      });
      throw new Error(`Missing required production environment variables: ${missingProd.join(', ')}`);
    }
  }

  // Log successful validation in development
  if (serverEnv.NODE_ENV === 'development') {
    console.log('[Server Environment] Variables validated successfully');
  }
}

/**
 * Get server health status
 * @returns {object} Health status object
 */
export function getHealthStatus() {
  return {
    status: 'ok',
    environment: serverEnv.NODE_ENV,
    apis: {
      youtube: !!serverEnv.YOUTUBE_API_KEY,
      spotify: !!(serverEnv.SPOTIFY_CLIENT_ID && serverEnv.SPOTIFY_CLIENT_SECRET)
    },
    timestamp: new Date().toISOString()
  };
}

// Validate environment variables on import
validateServerEnv();
