import { env } from '../../config/env';
import type { SongMetadata } from '../../types';

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

export async function extractYouTubeMetadata(url: string): Promise<SongMetadata> {
  try {
    const videoId = extractVideoId(url);
    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }

    const response = await fetch(
      `${YOUTUBE_API_BASE}/videos?part=snippet&id=${videoId}&key=${env.YOUTUBE_API_KEY}`
    );
    const data = await response.json();

    if (!data.items?.[0]) {
      throw new Error('Video not found');
    }

    const { snippet } = data.items[0];
    return {
      title: snippet.title,
      artist: snippet.channelTitle,
      source: 'youtube',
      sourceUrl: url,
      duration: null, // Would require additional API call to get duration
    };
  } catch (error) {
    throw new Error('Failed to extract YouTube metadata');
  }
}

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }

  return null;
}