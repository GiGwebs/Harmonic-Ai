import { Request, Response } from 'express';
import { TrendsAggregator } from '../services/trendsAggregator';
import { db } from '../lib/db/firebase';
import { collection, doc, getDoc, setDoc } from 'firebase/firestore';

const CACHE_COLLECTION = 'trendsSummaries';
const CACHE_DURATION = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

export async function trendsSummaryHandler(req: Request, res: Response) {
  try {
    console.log('[TrendsSummary] Processing request');

    // Check cache first
    const cacheRef = doc(collection(db, CACHE_COLLECTION), 'latest');
    const cacheDoc = await getDoc(cacheRef);
    
    if (cacheDoc.exists()) {
      const cachedData = cacheDoc.data();
      const cacheAge = Date.now() - new Date(cachedData.timestamp).getTime();
      
      if (cacheAge < CACHE_DURATION) {
        console.log('[TrendsSummary] Returning cached data');
        return res.json({
          ...cachedData,
          cached: true
        });
      }
    }

    // Cache miss or expired, fetch fresh data
    console.log('[TrendsSummary] Fetching fresh data');
    const trendsAggregator = new TrendsAggregator();
    const summary = await trendsAggregator.getCombinedTrends();

    // Cache the new data
    await setDoc(cacheRef, {
      ...summary,
      timestamp: new Date().toISOString()
    });

    console.log('[TrendsSummary] Successfully processed and cached new data');
    res.json({
      ...summary,
      cached: false
    });

  } catch (error: any) {
    console.error('[TrendsSummary] Error processing request:', error);
    res.status(500).json({
      error: 'Failed to fetch trends summary',
      message: error.message
    });
  }
}
