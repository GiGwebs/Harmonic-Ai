import { google } from 'googleapis';
import { YouTubeTrendingVideo } from '../types/youtube';

const youtube = google.youtube('v3');

export class YouTubeService {
  private apiKey: string;
  private regionCode: string;
  private categoryId: string;
  private maxRetries: number = 3;
  private retryDelay: number = 1000;

  constructor() {
    this.apiKey = process.env.VITE_YOUTUBE_API_KEY!;
    this.regionCode = process.env.YOUTUBE_REGION_CODE || 'US';
    this.categoryId = process.env.YOUTUBE_MUSIC_CATEGORY_ID || '10';
  }

  private async retryOperation<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;
        console.error(`[YouTubeService] Attempt ${attempt} failed:`, error.message);
        
        if (attempt < this.maxRetries) {
          const delay = this.retryDelay * Math.pow(2, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError || new Error('Operation failed after retries');
  }

  async getTrendingMusicVideos(maxResults = 50): Promise<YouTubeTrendingVideo[]> {
    return this.retryOperation(async () => {
      console.log('[YouTubeService] Fetching trending music videos');
      
      const response = await youtube.videos.list({
        key: this.apiKey,
        part: ['snippet', 'statistics'],
        chart: 'mostPopular',
        regionCode: this.regionCode,
        videoCategoryId: this.categoryId,
        maxResults
      });

      if (!response.data.items?.length) {
        console.warn('[YouTubeService] No trending videos found');
        return [];
      }

      console.log(`[YouTubeService] Found ${response.data.items.length} trending videos`);
      
      return response.data.items.map(item => ({
        id: item.id!,
        title: item.snippet!.title!,
        description: item.snippet!.description!,
        metrics: {
          viewCount: parseInt(item.statistics!.viewCount || '0'),
          likeCount: parseInt(item.statistics!.likeCount || '0'),
          commentCount: parseInt(item.statistics!.commentCount || '0')
        },
        publishedAt: item.snippet!.publishedAt!
      }));
    });
  }
}

export const youtubeService = new YouTubeService();
