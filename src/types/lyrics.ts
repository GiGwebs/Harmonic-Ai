export interface GenerateOptions {
  genre: string;
  subGenre?: string;
  featuredGenre?: string;
  featuredSubGenre?: string;
  mood: string;
  theme: string;
  structure: string;
}

export interface GeneratedLyrics {
  title: string;
  content: string;
  options: GenerateOptions;
  createdAt: string;
}

export interface LyricsSection {
  type: 'verse' | 'chorus' | 'bridge' | 'outro';
  content: string;
}