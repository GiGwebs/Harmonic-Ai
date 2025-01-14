import axios from 'axios';
import { load } from 'cheerio';

interface LyricsResult {
  lyrics: string;
  source: string;
  error?: string;
}

// YouTube URL validation
function isYouTubeUrl(url: string): boolean {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
  return youtubeRegex.test(url);
}

// Extract video ID from YouTube URL
function extractVideoId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

// Fetch song metadata from YouTube
async function fetchYouTubeMetadata(videoId: string) {
  try {
    const response = await axios.get(`https://www.youtube.com/watch?v=${videoId}`);
    const $ = load(response.data);
    const title = $('meta[property="og:title"]').attr('content') || '';
    return { title };
  } catch (error) {
    console.error('Error fetching YouTube metadata:', error);
    return { title: '' };
  }
}

// Search for lyrics using song title
async function searchLyrics(songTitle: string): Promise<string> {
  try {
    // Remove common YouTube suffixes like "Official Video", "Lyrics", etc.
    const cleanTitle = songTitle
      .replace(/\(.*?\)|\[.*?\]|ft\..*|feat\..*|Official.*|Video.*|Lyrics.*/gi, '')
      .trim();

    // First try Genius API
    const geniusResponse = await axios.get(
      `https://api.genius.com/search?q=${encodeURIComponent(cleanTitle)}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.GENIUS_ACCESS_TOKEN}`
        }
      }
    );

    if (geniusResponse.data.response.hits.length > 0) {
      const firstHit = geniusResponse.data.response.hits[0];
      const lyricsUrl = firstHit.result.url;
      
      // Fetch the lyrics page
      const lyricsResponse = await axios.get(lyricsUrl);
      const $ = load(lyricsResponse.data);
      
      // Extract lyrics from Genius page
      const lyrics = $('.lyrics').text().trim();
      if (lyrics) {
        return lyrics;
      }
    }

    // Fallback to Musixmatch if Genius fails
    const musixmatchResponse = await axios.get(
      `https://api.musixmatch.com/ws/1.1/track.search?q=${encodeURIComponent(cleanTitle)}&apikey=${process.env.MUSIXMATCH_API_KEY}`
    );

    if (musixmatchResponse.data.message.body.track_list.length > 0) {
      const trackId = musixmatchResponse.data.message.body.track_list[0].track.track_id;
      const lyricsResponse = await axios.get(
        `https://api.musixmatch.com/ws/1.1/track.lyrics.get?track_id=${trackId}&apikey=${process.env.MUSIXMATCH_API_KEY}`
      );

      return lyricsResponse.data.message.body.lyrics.lyrics_body;
    }

    throw new Error('No lyrics found');
  } catch (error) {
    console.error('Error searching lyrics:', error);
    throw error;
  }
}

// Main function to extract lyrics from YouTube URL
export async function extractLyricsFromYouTube(url: string): Promise<LyricsResult> {
  try {
    if (!isYouTubeUrl(url)) {
      return {
        lyrics: '',
        source: '',
        error: 'Invalid YouTube URL'
      };
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      return {
        lyrics: '',
        source: '',
        error: 'Could not extract video ID'
      };
    }

    const { title } = await fetchYouTubeMetadata(videoId);
    if (!title) {
      return {
        lyrics: '',
        source: '',
        error: 'Could not fetch video metadata'
      };
    }

    const lyrics = await searchLyrics(title);
    return {
      lyrics,
      source: 'YouTube',
    };
  } catch (error) {
    return {
      lyrics: '',
      source: '',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// Function to extract lyrics from uploaded audio file
export async function extractLyricsFromAudio(file: File): Promise<LyricsResult> {
  try {
    // Get the filename without extension
    const fileName = file.name.replace(/\.[^/.]+$/, "");
    
    // Search for lyrics using the filename
    const lyrics = await searchLyrics(fileName);
    
    return {
      lyrics,
      source: 'Audio File',
    };
  } catch (error) {
    return {
      lyrics: '',
      source: '',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}
