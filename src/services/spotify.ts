import axios, { AxiosError } from 'axios';
import { spotifyAuthService } from './spotifyAuth.js';

interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    release_date: string;
  };
}

interface AudioFeatures {
  danceability: number;
  energy: number;
  key: number;
  tempo: number;
  valence: number;
}

class SpotifyService {
  private requestCount: number = 0;
  private requestReset: number = Date.now();
  private readonly RATE_LIMIT = 100;
  private readonly RATE_WINDOW = 30000; // 30 seconds
  private readonly FEATURED_PLAYLIST_ENDPOINT = 'https://api.spotify.com/v1/browse/featured-playlists';
  private readonly BACKUP_PLAYLIST_ID = '37i9dQZEVXbNG2KDcFcKOF'; // Top 50 Global (public)
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000; // 1 second
  private readonly MAX_BATCH_SIZE = 50;

  constructor() {
    setInterval(() => {
      this.requestCount = 0;
      this.requestReset = Date.now();
    }, this.RATE_WINDOW);
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private checkRateLimit() {
    if (this.requestCount >= this.RATE_LIMIT) {
      const waitTime = this.RATE_WINDOW - (Date.now() - this.requestReset);
      if (waitTime > 0) {
        throw new Error(`Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds.`);
      }
      this.requestCount = 0;
    }
    this.requestCount++;
  }

  private async makeRequest<T>(
    url: string,
    options: {
      method?: string;
      params?: Record<string, any>;
      headers?: Record<string, any>;
    } = {},
    retryCount = 0
  ): Promise<T> {
    try {
      this.checkRateLimit();
      
      const token = await spotifyAuthService.getAccessToken();
      if (!token) {
        throw new Error('No access token available');
      }

      console.log(`[SpotifyService] Making request to ${url}`);
      const response = await axios({
        method: options.method || 'GET',
        url,
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        const status = error.response?.status;
        console.error(`[SpotifyService] Request failed with status ${status}:`, error.response?.data);
        
        if (status === 429 && retryCount < this.MAX_RETRIES) {
          const retryAfter = parseInt(error.response?.headers['retry-after'] || '1');
          console.log(`[SpotifyService] Rate limited, retrying after ${retryAfter} seconds`);
          await this.delay(retryAfter * 1000);
          return this.makeRequest<T>(url, options, retryCount + 1);
        }
        
        if (status === 401 && retryCount < this.MAX_RETRIES) {
          console.log('[SpotifyService] Token expired, refreshing token and retrying');
          await spotifyAuthService.refreshToken();
          await this.delay(this.RETRY_DELAY);
          return this.makeRequest<T>(url, options, retryCount + 1);
        }

        // For 404, try backup playlist
        if (status === 404 && url.includes('/playlists/') && retryCount === 0) {
          console.log('[SpotifyService] Playlist not found, trying backup playlist');
          const newUrl = `https://api.spotify.com/v1/playlists/${this.BACKUP_PLAYLIST_ID}/tracks`;
          return this.makeRequest<T>(newUrl, options, retryCount + 1);
        }

        if (retryCount < this.MAX_RETRIES) {
          const waitTime = this.RETRY_DELAY * Math.pow(2, retryCount);
          console.log(`[SpotifyService] Request failed, retrying in ${waitTime}ms`);
          await this.delay(waitTime);
          return this.makeRequest<T>(url, options, retryCount + 1);
        }
      }
      
      console.error('[SpotifyService] Request failed:', {
        url,
        error: error instanceof Error ? error.message : 'Unknown error',
        retryCount
      });
      throw error;
    }
  }

  async getPlaylistTracks(): Promise<SpotifyTrack[]> {
    console.log('[SpotifyService] Fetching featured playlists');
    try {
      // First try to get featured playlists
      const featuredResponse = await this.makeRequest<any>(
        this.FEATURED_PLAYLIST_ENDPOINT,
        {
          params: {
            country: 'US',
            limit: 1
          }
        }
      );

      let playlistId = this.BACKUP_PLAYLIST_ID;
      if (featuredResponse.playlists?.items?.length) {
        playlistId = featuredResponse.playlists.items[0].id;
        console.log(`[SpotifyService] Using featured playlist: ${playlistId}`);
      } else {
        console.log('[SpotifyService] No featured playlists found, using backup playlist');
      }

      const response = await this.makeRequest<any>(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        {
          params: {
            limit: this.MAX_BATCH_SIZE,
            market: 'US',
            fields: 'items(track(id,name,artists(name),album(name,release_date)))'
          }
        }
      );

      if (!response.items?.length) {
        throw new Error('No tracks found in playlist');
      }

      return response.items.map((item: any) => item.track).filter((track: any) => track !== null);
    } catch (error) {
      console.error('[SpotifyService] Failed to fetch playlist tracks:', error);
      throw error;
    }
  }

  async getAudioFeatures(trackIds: string[]): Promise<AudioFeatures[]> {
    if (!trackIds.length) {
      console.warn('[SpotifyService] No track IDs provided for audio features');
      return [];
    }

    try {
      console.log('[SpotifyService] Fetching audio features for', trackIds.length, 'tracks');
      
      // Spotify API has a limit of 100 tracks per request
      const chunks = [];
      for (let i = 0; i < trackIds.length; i += this.MAX_BATCH_SIZE) {
        chunks.push(trackIds.slice(i, i + this.MAX_BATCH_SIZE));
      }

      const features = await Promise.all(
        chunks.map(chunk =>
          this.makeRequest<{ audio_features: AudioFeatures[] }>(
            'https://api.spotify.com/v1/audio-features',
            {
              params: { ids: chunk.join(',') }
            }
          )
        )
      );

      const audioFeatures = features
        .flatMap(response => response.audio_features)
        .filter((feature): feature is AudioFeatures => feature !== null);

      if (!audioFeatures.length) {
        console.warn('[SpotifyService] No audio features found');
        throw new Error('No audio features found');
      }

      console.log('[SpotifyService] Successfully fetched audio features for', audioFeatures.length, 'tracks');
      return audioFeatures;
    } catch (error: any) {
      console.error('[SpotifyService] Failed to fetch audio features:', {
        error: error.message,
        status: error.response?.status,
        trackCount: trackIds.length
      });
      throw error;
    }
  }

  async analyzeTrends(tracks: SpotifyTrack[]): Promise<any> {
    console.log('[SpotifyService] Analyzing trends for', tracks.length, 'tracks');
    try {
      // Get audio features for all tracks
      const audioFeatures = await this.getAudioFeatures(tracks.map(t => t.id));
      
      // Count genres
      const genreCounts = new Map<string, number>();
      let totalTracks = 0;
      
      // Create a map of artist names to prevent duplicate API calls
      const uniqueArtists = new Set(tracks.flatMap(track => track.artists.map(a => a.name)));
      const artistGenres = new Map<string, string[]>();

      // Fetch genres for all unique artists
      await Promise.all(
        Array.from(uniqueArtists).map(async (artistName) => {
          const genres = await this.getArtistGenres(artistName);
          artistGenres.set(artistName, genres);
        })
      );
      
      // Count genres using the cached results
      for (const track of tracks) {
        const trackGenres = track.artists
          .flatMap(artist => artistGenres.get(artist.name) || ['Pop']);
        
        for (const genre of trackGenres) {
          genreCounts.set(genre, (genreCounts.get(genre) || 0) + 1);
          totalTracks++;
        }
      }

      // Calculate average audio features
      const avgFeatures = audioFeatures.reduce(
        (acc, feature) => ({
          danceability: acc.danceability + (feature.danceability || 0),
          energy: acc.energy + (feature.energy || 0),
          valence: acc.valence + (feature.valence || 0)
        }),
        { danceability: 0, energy: 0, valence: 0 }
      );

      const count = audioFeatures.length || 1; // Prevent division by zero
      avgFeatures.danceability /= count;
      avgFeatures.energy /= count;
      avgFeatures.valence /= count;

      // Convert genre counts to percentages and sort
      const topGenres = Array.from(genreCounts.entries())
        .map(([name, count]) => ({
          name,
          count,
          percentage: (count / (totalTracks || 1)) * 100 // Prevent division by zero
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return {
        topGenres,
        mood: avgFeatures
      };
    } catch (error: any) {
      console.error('[SpotifyService] Failed to analyze trends:', {
        error: error.message,
        tracksCount: tracks.length
      });
      throw error;
    }
  }

  private async getArtistGenres(artistName: string): Promise<string[]> {
    try {
      console.log('[SpotifyService] Searching for artist:', artistName);
      
      // Search for the artist
      const searchResponse = await this.makeRequest<any>(
        'https://api.spotify.com/v1/search',
        {
          params: {
            q: encodeURIComponent(artistName.trim()),
            type: 'artist',
            limit: 1
          }
        }
      );

      if (!searchResponse?.artists?.items?.length) {
        console.log('[SpotifyService] No artist found for:', artistName);
        return ['Pop']; // Default to Pop if artist not found
      }

      const artist = searchResponse.artists.items[0];
      if (!artist.genres?.length) {
        console.log('[SpotifyService] No genres found for artist:', artistName);
        return ['Pop']; // Default to Pop if no genres found
      }

      console.log('[SpotifyService] Found genres for artist:', {
        artist: artistName,
        genres: artist.genres
      });

      return artist.genres;
    } catch (error: any) {
      console.error('[SpotifyService] Error getting artist genres:', {
        artist: artistName,
        error: error.message,
        status: error.response?.status
      });
      return ['Pop']; // Default to Pop on error
    }
  }

  private inferGenre(track: SpotifyTrack, audioFeatures: { danceability: number; energy: number; valence: number }): string {
    const { danceability, energy, valence } = audioFeatures;
    
    if (energy > 0.8) return 'High Energy';
    if (danceability > 0.7) return 'Dance';
    if (valence > 0.7) return 'Happy';
    if (valence < 0.3) return 'Melancholic';
    return 'Pop'; // Default genre
  }
}

export const spotifyService = new SpotifyService();
