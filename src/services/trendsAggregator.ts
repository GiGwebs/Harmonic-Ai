import { SpotifyService } from './spotify';
import { YouTubeService } from './youtube';
import { SpotifyTrends, Genre } from '../types/spotify';
import { YouTubeInsightsResponse } from '../types/youtube';

interface CombinedTrendsSummary {
  timestamp: string;
  spotify: {
    topGenres: Genre[];
    audioFeatures: {
      avgTempo: number;
      avgDanceability: number;
      avgEnergy: number;
      avgValence: number;
    };
    lastUpdated: string;
  };
  youtube: {
    topVideos: Array<{
      title: string;
      viewCount: number;
      likeCount: number;
      commentCount: number;
    }>;
    totalViews: number;
    avgEngagement: number;
    lastUpdated: string;
  };
  insights: {
    dominantGenre: string;
    avgTempo: string; // e.g., "Medium-fast (120-140 BPM)"
    engagement: string; // e.g., "High engagement across platforms"
    summary: string; // e.g., "Pop-Dance tracks dominating with upbeat tempos"
  };
}

export class TrendsAggregator {
  private spotifyService: SpotifyService;
  private youtubeService: YouTubeService;

  constructor() {
    this.spotifyService = new SpotifyService();
    this.youtubeService = new YouTubeService();
  }

  private calculateAudioFeatureAverages(trends: SpotifyTrends) {
    const { mood } = trends;
    return {
      avgTempo: Math.round(mood.tempo || 0),
      avgDanceability: Number(mood.danceability.toFixed(2)) || 0,
      avgEnergy: Number(mood.energy.toFixed(2)) || 0,
      avgValence: Number(mood.valence.toFixed(2)) || 0,
    };
  }

  private getTempoCategory(bpm: number): string {
    if (bpm < 80) return "Slow (< 80 BPM)";
    if (bpm < 120) return "Medium (80-120 BPM)";
    if (bpm < 140) return "Medium-fast (120-140 BPM)";
    return "Fast (> 140 BPM)";
  }

  private generateInsights(
    spotifyTrends: SpotifyTrends,
    youtubeInsights: YouTubeInsightsResponse
  ) {
    const audioFeatures = this.calculateAudioFeatureAverages(spotifyTrends);
    const dominantGenre = spotifyTrends.topGenres[0]?.name || "Unknown";
    
    // Generate engagement description
    const avgEngagement = youtubeInsights.avgEngagement;
    let engagementDesc = "Moderate";
    if (avgEngagement > 0.8) engagementDesc = "Very high";
    else if (avgEngagement > 0.6) engagementDesc = "High";
    else if (avgEngagement < 0.3) engagementDesc = "Low";

    // Generate summary based on combined data
    const moodDesc = audioFeatures.avgValence > 0.6 ? "positive" : 
                    audioFeatures.avgValence < 0.4 ? "melancholic" : "balanced";
    const energyDesc = audioFeatures.avgEnergy > 0.6 ? "energetic" : 
                      audioFeatures.avgEnergy < 0.4 ? "calm" : "moderate";

    return {
      dominantGenre,
      avgTempo: this.getTempoCategory(audioFeatures.avgTempo),
      engagement: `${engagementDesc} engagement across platforms`,
      summary: `${dominantGenre} tracks with ${moodDesc}, ${energyDesc} vibes are trending. Average tempo is ${this.getTempoCategory(audioFeatures.avgTempo).toLowerCase()}.`
    };
  }

  public async getCombinedTrends(): Promise<CombinedTrendsSummary> {
    try {
      console.log('[TrendsAggregator] Fetching combined trends');
      
      // Fetch data from both services
      const [spotifyTrends, youtubeInsights] = await Promise.all([
        this.spotifyService.getTrends(),
        this.youtubeService.getInsights()
      ]);

      // Calculate audio feature averages
      const audioFeatures = this.calculateAudioFeatureAverages(spotifyTrends);

      // Generate insights
      const insights = this.generateInsights(spotifyTrends, youtubeInsights);

      const summary: CombinedTrendsSummary = {
        timestamp: new Date().toISOString(),
        spotify: {
          topGenres: spotifyTrends.topGenres,
          audioFeatures,
          lastUpdated: spotifyTrends.timestamp || new Date().toISOString()
        },
        youtube: {
          topVideos: youtubeInsights.videos.slice(0, 3).map(video => ({
            title: video.title,
            viewCount: video.metrics.viewCount,
            likeCount: video.metrics.likeCount,
            commentCount: video.metrics.commentCount
          })),
          totalViews: youtubeInsights.totalViews,
          avgEngagement: youtubeInsights.avgEngagement,
          lastUpdated: youtubeInsights.lastUpdated
        },
        insights
      };

      console.log('[TrendsAggregator] Combined trends generated successfully');
      return summary;

    } catch (error) {
      console.error('[TrendsAggregator] Error generating combined trends:', error);
      throw new Error('Failed to generate combined trends summary');
    }
  }
}
