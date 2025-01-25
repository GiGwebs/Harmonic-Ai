import { Request, Response } from 'express';
import { serverEnv } from '../../config/server-env.js';
import axios from 'axios';

/**
 * Handles Spotify OAuth callback
 * Exchanges authorization code for access and refresh tokens
 */
export async function spotifyCallbackHandler(req: Request, res: Response) {
  const { code } = req.query;
  
  if (!code) {
    console.error('[SpotifyCallback] Missing authorization code');
    return res.status(400).json({ 
      error: 'Missing authorization code',
      timestamp: new Date().toISOString()
    });
  }

  try {
    console.log('[SpotifyCallback] Exchanging code for tokens');
    const auth = Buffer.from(
      `${serverEnv.SPOTIFY_CLIENT_ID}:${serverEnv.SPOTIFY_CLIENT_SECRET}`
    ).toString('base64');

    const tokenResponse = await axios.post(
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

    const { access_token, refresh_token, expires_in } = tokenResponse.data;
    
    // Store tokens securely (you might want to use a session store or secure cookie)
    req.session = req.session || {};
    req.session.spotifyTokens = {
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresAt: Date.now() + (expires_in * 1000)
    };

    console.log('[SpotifyCallback] Successfully obtained tokens');
    
    // Redirect to frontend or return tokens
    res.json({
      success: true,
      message: 'Authentication successful',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('[SpotifyCallback] Token exchange failed:', {
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
