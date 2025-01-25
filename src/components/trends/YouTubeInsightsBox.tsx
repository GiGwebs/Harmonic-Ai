import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { YouTubeInsightsResponse } from '../../types/youtube.js';
import { Loader2, RefreshCw, Youtube, Eye, ThumbsUp, MessageCircle } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function YouTubeInsightsBox() {
  const [insights, setInsights] = useState<YouTubeInsightsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async () => {
    try {
      console.log('[YouTubeInsightsBox] Fetching insights');
      setLoading(true);
      setError(null);
      
      const response = await axios.get<YouTubeInsightsResponse>(
        `${API_BASE_URL}/api/youtube-insights`
      );
      
      setInsights(response.data);
      console.log('[YouTubeInsightsBox] Insights fetched successfully:', response.data);
    } catch (error) {
      console.error('[YouTubeInsightsBox] Error fetching insights:', error);
      setError('Failed to load YouTube insights');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const handleRefresh = () => {
    fetchInsights();
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  if (loading) {
    return (
      <div className="p-4 border rounded-lg bg-white shadow-sm mt-4">
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm text-gray-600">Loading insights...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border rounded-lg bg-white shadow-sm mt-4">
        <div className="flex flex-col items-center space-y-2">
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!insights) {
    return null;
  }

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm mt-4">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center space-x-2">
          <Youtube className="w-5 h-5 text-red-600" />
          <h3 className="text-sm font-medium text-gray-900">Trending on YouTube</h3>
        </div>
        <button
          onClick={handleRefresh}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          title="Refresh insights"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
      
      <div className="space-y-3">
        <div className="space-y-2">
          <p className="text-xs text-gray-500">Top Music Videos:</p>
          <div className="space-y-2">
            {insights.trends.videos.slice(0, 3).map((video) => (
              <div key={video.id} className="flex flex-col space-y-1">
                <p className="text-sm text-gray-800 font-medium truncate" title={video.title}>
                  {video.title}
                </p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span className="flex items-center">
                    <Eye className="w-3 h-3 mr-1" />
                    {formatNumber(video.metrics.viewCount)}
                  </span>
                  <span className="flex items-center">
                    <ThumbsUp className="w-3 h-3 mr-1" />
                    {formatNumber(video.metrics.likeCount)}
                  </span>
                  <span className="flex items-center">
                    <MessageCircle className="w-3 h-3 mr-1" />
                    {formatNumber(video.metrics.commentCount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Total Views: {formatNumber(insights.trends.totalViews)}</span>
            <span>Engagement: {(insights.trends.avgEngagement * 100).toFixed(1)}%</span>
          </div>
        </div>

        <p className="text-xs text-gray-400">
          Last updated: {new Date(insights.lastUpdated).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}
