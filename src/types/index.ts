// Re-export all types from their respective modules
export * from './analysis';
export * from './song';

// Add missing Window interface extension
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

export interface SongMetadata {
  title: string;
  artist: string;
  url?: string;
}

export interface MusicalElements {
  key: string;
  timeSignature: string;
  tempo: string;
  dominantInstruments: string[];
}

export interface CommercialViability {
  score: number;
  factors: string[];
}

export interface SentimentAnalysis {
  sentimentScore: number;
  sentimentLabel: 'positive' | 'negative' | 'neutral';
  emotionalTone: string;
  summary: string;
}

export interface SongAnalysis {
  metadata: SongMetadata;
  musicalElements: MusicalElements;
  productionTechniques: string[];
  commercialViability: CommercialViability;
  lyricalThemes: string[];
  uniqueCharacteristics: string[];
  sentimentAnalysis?: SentimentAnalysis;
  sections: Section[];
  createdAt: string;
}

export interface Song extends SongAnalysis {
  id: string;
}

export interface Section {
  id: string;
  type: 'verse' | 'chorus' | 'bridge' | 'intro' | 'outro';
  content: string;
  duration?: number;
}

export interface AnalyzedSection extends Section {
  analysis: {
    complexity: 'simple' | 'intermediate' | 'complex';
    moods: ('joyful' | 'somber' | 'energetic' | 'melancholic' | 'neutral')[];
    impact: number;
    recommendations: string[];
  };
}

export interface SectionInsight {
  title: string;
  description: string;
  themes: string[];
  tips: string[];
}

export interface FilterPreset {
  id: string;
  name: string;
  filters: {
    sectionTypes: string[];
    complexity: string[];
    mood: string[];
    themes: string[];
  };
}

export interface Preferences {
  advancedFilters: {
    sectionTypes: string[];
    complexity: string[];
    mood: string[];
    themes: string[];
  };
  filterPresets: FilterPreset[];
  activePresetId: string | null;
  snapScrollingEnabled: boolean;
}