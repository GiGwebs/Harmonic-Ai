import type { GeneratedLyrics } from '../../types/lyrics';

export interface DatabaseOptions {
  genre?: string;
  mood?: string;
  theme?: string;
  structure?: string;
  limit?: number;
  orderBy?: SortOption;
}

export interface SortOption {
  field: keyof GeneratedLyrics;
  direction: 'asc' | 'desc';
}

export interface SaveOptions {
  generateId?: boolean;
  merge?: boolean;
}

export type DatabaseRecord<T> = T & {
  id: string;
  createdAt: string;
};