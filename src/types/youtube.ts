export interface YouTubeTrendingVideo {
  id: string;
  title: string;
  description: string;
  metrics: {
    viewCount: number;
    likeCount: number;
    commentCount: number;
  };
  publishedAt: string;
}

export interface YouTubeInsightsResponse {
  trends: {
    videos: YouTubeTrendingVideo[];
    totalViews: number;
    avgEngagement: number;
  };
  lastUpdated: string;
  source: 'youtube';
}
