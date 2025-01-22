import type { Genre, Structure } from '../constants/genres';

export interface GenerateOptions {
  genre: Genre;
  subGenre?: string;
  featuredGenre?: Genre;
  featuredSubGenre?: string;
  mood: string;
  theme: string;
  structure: Structure;
  featuredArtist?: string;
}

export interface GeneratedLyrics {
  id?: string;
  title: string;
  content: string;
  type?: 'generated' | 'analyzed';
  options: {
    genre: string;
    mood: string;
    theme: string;
    structure: string;
  };
  analysis?: {
    sentiment: {
      score: number;
      label: string;
    };
    commercialViability: {
      score: number;
      reasons: string[];
    };
    suggestions: string[];
  };
  metadata?: {
    wordCount: number;
    verseCount: number;
    hasChorus: boolean;
    language: string;
    lastModified: string;
    createdAt: string;
  };
  createdAt?: string;
}

export interface LyricsSection {
  type: 'verse' | 'chorus' | 'bridge' | 'outro';
  content: string;
}
