import { Router } from 'express';
import { callSpotifyApi } from '../services/spotifyApi.js';

const router = Router();

// Get user's Spotify profile
router.get('/profile', async (req, res) => {
  try {
    const response = await callSpotifyApi(req, '/me');
    const data = await response.json();

    if (!response.ok) {
      console.error('[SpotifyRoutes] Failed to fetch user profile:', data);
      return res.status(response.status).json(data);
    }

    return res.json({ success: true, profile: data });
  } catch (error) {
    console.error('[SpotifyRoutes] Profile error:', error);
    return res.status(500).json({ error: 'Failed to fetch Spotify profile' });
  }
});

// Get user's playlists
router.get('/playlists', async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 20;
    const offset = Number(req.query.offset) || 0;

    const response = await callSpotifyApi(
      req,
      `/me/playlists?limit=${limit}&offset=${offset}`
    );
    const data = await response.json();

    if (!response.ok) {
      console.error('[SpotifyRoutes] Failed to fetch playlists:', data);
      return res.status(response.status).json(data);
    }

    return res.json({ success: true, playlists: data });
  } catch (error) {
    console.error('[SpotifyRoutes] Playlists error:', error);
    return res.status(500).json({ error: 'Failed to fetch Spotify playlists' });
  }
});

export default router;
