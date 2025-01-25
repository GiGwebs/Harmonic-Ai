import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { TrendingGenresResponse } from '../../types/spotify';
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

export function TrendingGenresBox() {
  const [trends, setTrends] = useState<TrendingGenresResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const fetchTrends = async (retry = 0) => {
    try {
      console.log('[TrendingGenresBox] Fetching trends');
      setLoading(true);
      setError(null);
      
      const response = await axios.get<TrendingGenresResponse>(
        `${API_BASE_URL}/api/trending-genres`
      );
      
      if (!response.data?.success || !response.data?.data) {
        throw new Error('Invalid response format');
      }

      setTrends(response.data);
      setRetryCount(0);
      console.log('[TrendingGenresBox] Trends fetched successfully:', response.data);
    } catch (error: any) {
      console.error('[TrendingGenresBox] Error fetching trends:', error);
      
      // Get the retry delay from the header or use exponential backoff
      const retryAfter = error.response?.headers?.['retry-after'];
      const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : INITIAL_RETRY_DELAY * Math.pow(2, retry);
      
      // Handle retry logic
      if (retry < MAX_RETRIES) {
        console.log(`[TrendingGenresBox] Retrying (${retry + 1}/${MAX_RETRIES}) after ${waitTime}ms`);
        await delay(waitTime);
        return fetchTrends(retry + 1);
      }

      setRetryCount(retry);
      const errorMessage = error.response?.data?.error || error.response?.data?.details || error.message;
      setError(`Failed to load trending genres: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrends();

    // Cleanup function to handle component unmounting
    return () => {
      setTrends(null);
      setLoading(false);
      setError(null);
    };
  }, []);

  const handleRefresh = () => {
    setRetryCount(0); // Reset retry count on manual refresh
    fetchTrends();
  };

  if (loading) {
    return (
      <div className="p-4 border rounded-lg bg-white shadow-sm">
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm text-gray-600">Loading trends...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border rounded-lg bg-white shadow-sm">
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center justify-center w-full px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Retrying...' : 'Retry'}
          </button>
        </div>
      </div>
    );
  }

  if (!trends?.data?.topGenres?.length) {
    return (
      <div className="p-4 border rounded-lg bg-white shadow-sm">
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">No trending genres available</p>
          <button
            onClick={handleRefresh}
            className="flex items-center justify-center w-full px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Trending Genres</h3>
        <button
          onClick={handleRefresh}
          className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
          title="Refresh trends"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
      
      <div className="space-y-3">
        {trends.data.topGenres.map((genre) => (
          <div key={genre.name} className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{genre.name}</span>
            <div className="flex items-center space-x-2">
              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500"
                  style={{ width: `${genre.percentage}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">{Math.round(genre.percentage)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
