export interface Genre {
  name: string;
  count: number;
  percentage: number;
}

export interface AudioFeatures {
  danceability: number;
  energy: number;
  valence: number;
}

export interface SpotifyTrends {
  topGenres: Genre[];
  mood: AudioFeatures;
}

export interface TrendingGenresResponse {
  success: boolean;
  data: SpotifyTrends;
  cached: boolean;
  timestamp: string;
}
