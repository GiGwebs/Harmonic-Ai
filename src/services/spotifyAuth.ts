import axios from 'axios';
import * as crypto from 'crypto';
import { serverEnv } from '../config/server-env.js';
import { Request, Response } from 'express';

interface SpotifyTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

class SpotifyAuthService {
  private clientCredentialsToken: SpotifyTokens | null = null;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000; // 1 second
  private readonly TOKEN_REFRESH_BUFFER = 300000; // 5 minutes
  private isInitializing: boolean = false;
  private initializationPromise: Promise<void> | null = null;

  constructor() {
    this.clientId = serverEnv.SPOTIFY_CLIENT_ID;
    this.clientSecret = serverEnv.SPOTIFY_CLIENT_SECRET;

    if (!this.clientId || !this.clientSecret) {
      console.error('[SpotifyAuth] Missing Spotify credentials');
      throw new Error('Spotify credentials not configured');
    }

    // Initialize client credentials token on startup
    this.initialize().catch(error => {
      console.error('[SpotifyAuth] Failed to initialize token:', error);
    });
  }

  private async initialize(): Promise<void> {
    if (this.isInitializing) {
      return this.initializationPromise!;
    }

    this.isInitializing = true;
    this.initializationPromise = this.getClientCredentialsToken()
      .finally(() => {
        this.isInitializing = false;
        this.initializationPromise = null;
      });

    return this.initializationPromise;
  }

  private async getClientCredentialsToken(retryCount = 0): Promise<void> {
    try {
      console.log('[SpotifyAuth] Getting client credentials token...');
      const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      
      const response = await axios.post('https://accounts.spotify.com/api/token', 
        'grant_type=client_credentials',
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      if (!response.data.access_token) {
        throw new Error('No access token in response');
      }

      this.clientCredentialsToken = {
        accessToken: response.data.access_token,
        expiresAt: Date.now() + (response.data.expires_in * 1000)
      };
      
      console.log('[SpotifyAuth] Client credentials token obtained successfully');
    } catch (error: any) {
      console.error('[SpotifyAuth] Failed to get client credentials token:', {
        error: error.response?.data || error.message,
        status: error.response?.status,
        attempt: retryCount + 1
      });

      if (retryCount < this.MAX_RETRIES) {
        const delay = this.RETRY_DELAY * Math.pow(2, retryCount);
        console.log(`[SpotifyAuth] Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.getClientCredentialsToken(retryCount + 1);
      }

      throw new Error(`Failed to get client credentials token after ${this.MAX_RETRIES} attempts`);
    }
  }

  async getAccessToken(): Promise<string> {
    // If no token exists or we're close to expiration, refresh it
    if (!this.clientCredentialsToken || 
        Date.now() >= this.clientCredentialsToken.expiresAt - this.TOKEN_REFRESH_BUFFER) {
      await this.getClientCredentialsToken();
    }

    if (!this.clientCredentialsToken?.accessToken) {
      throw new Error('Failed to obtain access token');
    }

    return this.clientCredentialsToken.accessToken;
  }

  async getAccessTokenFromCode(req: Request, res: Response) {
    const { code } = req.query;
    
    if (!code) {
      console.error('[SpotifyAuth] Missing authorization code');
      return res.status(400).json({ 
        error: 'Missing authorization code',
        timestamp: new Date().toISOString()
      });
    }

    try {
      console.log('[SpotifyAuth] Exchanging code for tokens');
      const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

      const response = await axios.post(
        'https://accounts.spotify.com/api/token',
        new URLSearchParams({
          grant_type: 'authorization_code',
          code: code as string,
          redirect_uri: process.env.SPOTIFY_REDIRECT_URI!
        }).toString(),
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      const { access_token, refresh_token, expires_in } = response.data;
      
      // Store tokens in session
      req.session.spotifyTokens = {
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt: Date.now() + (expires_in * 1000)
      };

      console.log('[SpotifyAuth] Successfully obtained user tokens');
      
      // Redirect to frontend or return success
      res.json({
        success: true,
        message: 'Authentication successful',
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('[SpotifyAuth] Token exchange failed:', {
        error: error.response?.data || error.message,
        status: error.response?.status
      });
      
      res.status(500).json({
        error: 'Failed to exchange authorization code for tokens',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        timestamp: new Date().toISOString()
      });
    }
  }

  getAuthorizationURL(): string {
    const scopes = (process.env.SPOTIFY_SCOPES || '').split(',');
    const state = crypto.randomBytes(16).toString('hex');
    
    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
      scope: scopes.join(' '),
      state
    });

    return `https://accounts.spotify.com/authorize?${params.toString()}`;
  }

  isAuthenticated(req: Request): boolean {
    const tokens = req.session.spotifyTokens;
    return !!tokens?.accessToken && Date.now() < tokens.expiresAt - this.TOKEN_REFRESH_BUFFER;
  }

  async refreshUserToken(req: Request): Promise<void> {
    const tokens = req.session.spotifyTokens;
    if (!tokens?.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      const response = await axios.post(
        'https://accounts.spotify.com/api/token',
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: tokens.refreshToken
        }).toString(),
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      req.session.spotifyTokens = {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token || tokens.refreshToken,
        expiresAt: Date.now() + (response.data.expires_in * 1000)
      };
    } catch (error) {
      console.error('[SpotifyAuth] Failed to refresh user token:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const spotifyAuthService = new SpotifyAuthService();
