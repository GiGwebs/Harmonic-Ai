import { Request, Response } from 'express';
import { spotifyService } from '../services/spotify.js';
import { db } from '../lib/db/firebase.js';
import { collection, query, orderBy, limit, getDocs, addDoc } from 'firebase/firestore';

const CACHE_COLLECTION = 'trends';
const CACHE_DURATION = 3600000; // 1 hour in milliseconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function trendsHandler(req: Request, res: Response) {
  console.log('[TrendsAPI] Handling request');
  
  try {
    // Check cache first
    const cachedData = await getLatestTrends();
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      console.log('[TrendsAPI] Returning cached data');
      return res.json({
        success: true,
        data: cachedData.data,
        cached: true,
        timestamp: new Date(cachedData.timestamp).toISOString()
      });
    }

    console.log('[TrendsAPI] Cache miss, fetching fresh data');
    
    // Get tracks from Spotify with retries
    let tracks = null;
    let lastError = null;
    
    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        console.log(`[TrendsAPI] Fetching tracks attempt ${i + 1}/${MAX_RETRIES}`);
        tracks = await spotifyService.getPlaylistTracks();
        
        if (tracks && tracks.length > 0) {
          console.log('[TrendsAPI] Successfully fetched', tracks.length, 'tracks');
          break;
        }
        
        console.warn('[TrendsAPI] No tracks returned');
        lastError = new Error('No tracks returned from Spotify');
      } catch (error: any) {
        lastError = error;
        console.error(`[TrendsAPI] Attempt ${i + 1}/${MAX_RETRIES} failed:`, {
          error: error.message,
          status: error.response?.status,
          data: error.response?.data
        });
        
        if (i < MAX_RETRIES - 1) {
          const waitTime = RETRY_DELAY * Math.pow(2, i);
          console.log(`[TrendsAPI] Waiting ${waitTime}ms before retry`);
          await delay(waitTime);
        }
      }
    }

    if (!tracks || tracks.length === 0) {
      console.error('[TrendsAPI] All attempts to fetch tracks failed:', {
        error: lastError?.message,
        status: lastError?.response?.status
      });
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch tracks from Spotify',
        details: lastError?.message,
        timestamp: new Date().toISOString()
      });
    }

    // Analyze trends
    console.log('[TrendsAPI] Analyzing trends for', tracks.length, 'tracks');
    const trends = await spotifyService.analyzeTrends(tracks);

    // Cache the results
    const trendData = {
      data: trends,
      timestamp: Date.now()
    };
    
    try {
      await cacheTrends(trendData);
      console.log('[TrendsAPI] Successfully cached trend data');
    } catch (error) {
      console.error('[TrendsAPI] Failed to cache trend data:', error);
      // Continue even if caching fails
    }

    return res.json({
      success: true,
      data: trends,
      cached: false,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('[TrendsAPI] Error handling request:', {
      error: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch trending genres',
      details: error?.message,
      timestamp: new Date().toISOString()
    });
  }
}

async function getLatestTrends() {
  try {
    const trendsRef = collection(db, CACHE_COLLECTION);
    const q = query(trendsRef, orderBy('timestamp', 'desc'), limit(1));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.log('[TrendsAPI] No cached trends found');
      return null;
    }
    
    const data = snapshot.docs[0].data();
    console.log('[TrendsAPI] Found cached trends from:', new Date(data.timestamp).toISOString());
    return data;
  } catch (error) {
    console.error('[TrendsAPI] Error getting cached trends:', error);
    return null;
  }
}

async function cacheTrends(data: any) {
  try {
    const trendsRef = collection(db, CACHE_COLLECTION);
    await addDoc(trendsRef, data);
  } catch (error) {
    console.error('[TrendsAPI] Error caching trends:', error);
    throw error;
  }
}
