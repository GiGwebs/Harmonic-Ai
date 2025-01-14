import { saveDocument, getDocuments } from './core';
import type { DatabaseOptions } from './types';
import type { GeneratedLyrics } from '../../types/lyrics';

const COLLECTION_NAME = 'lyrics';

export async function saveLyrics(lyrics: GeneratedLyrics): Promise<string> {
  return saveDocument(COLLECTION_NAME, {
    ...lyrics,
    createdAt: new Date().toISOString()
  });
}

export async function getLyrics(options?: DatabaseOptions): Promise<Array<GeneratedLyrics & { id: string }>> {
  // Default sorting by creation date, newest first
  const queryOptions: DatabaseOptions = {
    ...options,
    orderBy: {
      field: 'createdAt',
      direction: 'desc'
    }
  };

  return getDocuments<GeneratedLyrics>(COLLECTION_NAME, queryOptions);
}

export async function getLyricsByGenre(genre: string): Promise<Array<GeneratedLyrics & { id: string }>> {
  return getDocuments<GeneratedLyrics>(COLLECTION_NAME, {
    genre,
    orderBy: {
      field: 'createdAt',
      direction: 'desc'
    }
  });
}

export async function getLatestLyrics(limit: number = 10): Promise<Array<GeneratedLyrics & { id: string }>> {
  return getDocuments<GeneratedLyrics>(COLLECTION_NAME, {
    orderBy: {
      field: 'createdAt',
      direction: 'desc'
    },
    limit
  });
}