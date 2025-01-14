export interface Song {
  id: string;
  title: string;
  artist: string;
  genre: string[];
  lyrics?: string;
  chordProgression?: string[];
  bpm?: number;
  productionNotes?: string;
  analysis?: SongAnalysis;
  sourceUrl?: string | null;
  source?: 'youtube' | 'spotify' | 'file';
  createdAt?: {
    seconds: number;
    nanoseconds: number;
  } | string | null; // Firebase Timestamp or ISO string or null
}