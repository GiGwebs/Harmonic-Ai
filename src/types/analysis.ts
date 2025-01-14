export interface SongMetadata {
  title: string;
  artist: string;
  source: 'youtube' | 'spotify' | 'file';
  sourceUrl: string | null;
  duration: number | null;
  album?: string;
}

export interface AudioAnalysis {
  tempo: number;
  key: string;
  chords: string[];
  duration: number;
}

export interface SongAnalysis {
  lyricalThemes: string[];
  musicalElements: {
    key?: string;
    tempo?: number;
    timeSignature?: string;
    dominantInstruments?: string[];
  };
  productionTechniques: string[];
  commercialViability: {
    score: number;
    factors: string[];
  };
}