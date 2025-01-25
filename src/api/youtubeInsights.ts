import { Request, Response } from 'express';
import { youtubeService } from '../services/youtube.js';
import { db } from '../lib/db/firebase.js';
import { collection, query, orderBy, limit, getDocs, addDoc } from 'firebase/firestore';
import { YouTubeInsightsResponse } from '../types/youtube.js';

const CACHE_COLLECTION = 'youtube_trends';
const CACHE_DURATION = parseInt(process.env.YOUTUBE_CACHE_DURATION || '3600000');

async function getLatestInsights(): Promise<YouTubeInsightsResponse | null> {
  try {
    const trendsRef = collection(db, CACHE_COLLECTION);
    const q = query(trendsRef, orderBy('lastUpdated', 'desc'), limit(1));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log('[YouTubeInsights] No cached data found');
      return null;
    }

    const data = snapshot.docs[0].data() as YouTubeInsightsResponse;
    const lastUpdated = new Date(data.lastUpdated).getTime();
    const now = Date.now();

    if (now - lastUpdated > CACHE_DURATION) {
      console.log('[YouTubeInsights] Cache expired');
      return null;
    }

    console.log('[YouTubeInsights] Using cached data');
    return data;
  } catch (error) {
    console.error('[YouTubeInsights] Error reading cache:', error);
    return null;
  }
}

async function cacheInsights(data: YouTubeInsightsResponse): Promise<void> {
  try {
    const trendsRef = collection(db, CACHE_COLLECTION);
    await addDoc(trendsRef, data);
    console.log('[YouTubeInsights] Cache updated');
  } catch (error) {
    console.error('[YouTubeInsights] Error updating cache:', error);
  }
}

export const youtubeInsightsHandler = async (req: Request, res: Response) => {
  console.log('[YouTubeInsights] Starting request from:', req.headers.origin);
  
  try {
    // Validate environment config first
    if (!process.env.YOUTUBE_API_KEY) {
      throw new Error('YouTube API key not configured');
    }

    // Check cache first
    const cachedData = await getLatestInsights();
    if (cachedData) {
      console.log('[YouTubeInsights] Returning cached data');
      return res.json({
        ...cachedData,
        cached: true,
        timestamp: cachedData.lastUpdated
      });
    }

    // Fetch fresh data
    console.log('[YouTubeInsights] Fetching fresh data');
    const videos = await youtubeService.getTrendingMusicVideos();
    
    // Validate response format
    if (!Array.isArray(videos) || videos.length === 0) {
      throw new Error('Invalid YouTube API response format');
    }

    // Calculate metrics
    const totalViews = videos.reduce((sum, video) => sum + video.metrics.viewCount, 0);
    const avgEngagement = videos.reduce((sum, video) =>
      sum + (video.metrics.likeCount + video.metrics.commentCount) / video.metrics.viewCount, 0
    ) / videos.length;

    const insights: YouTubeInsightsResponse = {
      trends: {
        videos: videos.slice(0, 10),
        totalViews,
        avgEngagement
      },
      lastUpdated: new Date().toISOString(),
      source: 'youtube'
    };

    // Cache results
    await cacheInsights(insights);
    
    res.json({
      ...insights,
      cached: false,
      timestamp: insights.lastUpdated
    });

  } catch (error: any) {
    console.error('[YouTubeInsights] Error:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });

    // Try to return cached data if available
    const cachedData = await getLatestInsights();
    if (cachedData) {
      console.log('[YouTubeInsights] Falling back to cached data');
      return res.json({
        ...cachedData,
        cached: true,
        timestamp: cachedData.lastUpdated
      });
    }

    res.status(500).json({
      error: 'Failed to fetch YouTube insights',
      details: error.message,
      retryAfter: 60
    });
  }
};
