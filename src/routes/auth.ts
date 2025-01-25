import express from 'express';
import { spotifyAuthService } from '../services/spotifyAuth.js';

const router = express.Router();

router.get('/spotify/login', (req, res) => {
  const authUrl = spotifyAuthService.getAuthorizationURL();
  res.redirect(authUrl);
});

// Changed from /spotify/callback to /callback to match Spotify Dashboard
router.get('/callback', async (req, res) => {
  await spotifyAuthService.getAccessTokenFromCode(req, res);
});

router.get('/spotify/refresh', async (req, res) => {
  try {
    await spotifyAuthService.refreshUserToken(req);
    res.json({
      success: true,
      message: 'Token refreshed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('[AuthRoutes] Token refresh failed:', error);
    res.status(401).json({
      error: 'Failed to refresh token',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    });
  }
});

router.get('/spotify/status', (req, res) => {
  res.json({
    authenticated: spotifyAuthService.isAuthenticated(req),
    timestamp: new Date().toISOString()
  });
});

export default router;
