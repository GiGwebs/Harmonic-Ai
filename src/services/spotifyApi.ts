import { Request } from 'express';
import { spotifyAuthService } from './spotifyAuth';

interface SpotifyApiOptions {
  method?: string;
  body?: any;
}

export async function callSpotifyApi(
  req: Request,
  endpoint: string,
  options: SpotifyApiOptions = {}
) {
  const accessToken = req.session.spotifyAccessToken;
  if (!accessToken) {
    throw new Error('Not authenticated with Spotify');
  }

  const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
    method: options.method || 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    ...(options.body && { body: JSON.stringify(options.body) }),
  });

  // If token expired, try refreshing once
  if (response.status === 401 && req.session.spotifyRefreshToken) {
    try {
      console.log('[SpotifyAPI] Access token expired, attempting refresh');
      await spotifyAuthService.refreshUserToken(req);
      
      // Retry the request with new token
      const retryResponse = await fetch(`https://api.spotify.com/v1${endpoint}`, {
        method: options.method || 'GET',
        headers: {
          'Authorization': `Bearer ${req.session.spotifyAccessToken}`,
          'Content-Type': 'application/json',
        },
        ...(options.body && { body: JSON.stringify(options.body) }),
      });

      return retryResponse;
    } catch (error) {
      console.error('[SpotifyAPI] Token refresh failed:', error);
      throw error;
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(`Spotify API error: ${error.error?.message || error.error || 'Unknown error'}`);
  }

  return response;
}
