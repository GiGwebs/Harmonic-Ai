import { env } from '../../config/env';
import type { SongMetadata } from '../../types';

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

let accessToken: string | null = null;
let tokenExpiry: number | null = null;

async function getAccessToken(): Promise<string> {
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken;
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${btoa(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`)}`,
    },
    body: 'grant_type=client_credentials',
  });

  const data = await response.json();
  accessToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in * 1000);
  return accessToken;
}

export async function extractSpotifyMetadata(url: string): Promise<SongMetadata> {
  try {
    const trackId = extractTrackId(url);
    if (!trackId) {
      throw new Error('Invalid Spotify URL');
    }

    const token = await getAccessToken();
    const response = await fetch(`${SPOTIFY_API_BASE}/tracks/${trackId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (response.status !== 200) {
      throw new Error(data.error?.message || 'Failed to fetch Spotify track');
    }

    return {
      title: data.name,
      artist: data.artists.map(a => a.name).join(', '),
      source: 'spotify',
      sourceUrl: url,
      duration: Math.round(data.duration_ms / 1000),
      album: data.album.name,
    };
  } catch (error) {
    throw new Error('Failed to extract Spotify metadata');
  }
}

function extractTrackId(url: string): string | null {
  const pattern = /spotify\.com\/track\/([a-zA-Z0-9]+)/;
  const match = url.match(pattern);
  return match?.[1] || null;
}