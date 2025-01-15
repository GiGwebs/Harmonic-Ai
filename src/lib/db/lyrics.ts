import { collection, deleteDoc, doc, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { db } from '../../config/firebase';
import type { DatabaseOptions } from './types';
import type { GeneratedLyrics } from '../../types/lyrics';
import { saveDocument, getDocuments } from './core';

const COLLECTION_NAME = 'lyrics';

/**
 * Saves lyrics to the database with validation and metadata
 */
export async function saveLyrics(lyrics: GeneratedLyrics): Promise<string> {
  // Validate required fields
  if (!lyrics.title || !lyrics.content || !lyrics.options) {
    throw new Error('Missing required fields in lyrics data');
  }

  // Validate content length
  if (lyrics.content.length > 50000) { // 50KB limit
    throw new Error('Lyrics content exceeds maximum length');
  }

  // Sanitize and prepare data
  const sanitizedLyrics = {
    ...lyrics,
    title: lyrics.title.trim(),
    content: lyrics.content.trim(),
    options: {
      ...lyrics.options,
      genre: lyrics.options.genre.toLowerCase(),
      mood: lyrics.options.mood.toLowerCase(),
      theme: lyrics.options.theme.toLowerCase()
    },
    metadata: {
      wordCount: lyrics.content.split(/\s+/).length,
      verseCount: (lyrics.content.match(/\[verse/gi) || []).length,
      hasChorus: /\[chorus\]/i.test(lyrics.content),
      language: 'en', // Default to English for now
      lastModified: new Date().toISOString()
    }
  };

  return saveDocument(COLLECTION_NAME, sanitizedLyrics);
}

/**
 * Retrieves lyrics with optional filtering and sorting
 */
export async function getLyrics(
  options?: DatabaseOptions
): Promise<Array<GeneratedLyrics & { id: string }>> {
  return getDocuments<GeneratedLyrics>(COLLECTION_NAME, options);
}

/**
 * Gets the most recently generated lyrics
 */
export async function getLatestLyrics(
  limit: number = 10
): Promise<Array<GeneratedLyrics & { id: string }>> {
  return getDocuments<GeneratedLyrics>(COLLECTION_NAME, {
    orderBy: {
      field: 'createdAt',
      direction: 'desc'
    },
    limit
  });
}

/**
 * Deletes lyrics by ID with validation
 */
export async function deleteLyrics(id: string): Promise<void> {
  if (!id) {
    throw new Error('Lyrics ID is required');
  }

  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error: any) {
    console.error('Error deleting lyrics:', error);
    throw new Error(`Failed to delete lyrics: ${error.message}`);
  }
}

/**
 * Searches lyrics by content or metadata
 */
export async function searchLyrics(
  searchTerm: string
): Promise<Array<GeneratedLyrics & { id: string }>> {
  if (!searchTerm.trim()) {
    return [];
  }

  const normalizedTerm = searchTerm.toLowerCase().trim();
  
  try {
    const snapshot = await getDocs(
      query(
        collection(db, COLLECTION_NAME),
        orderBy('createdAt', 'desc'),
        limit(100) // Reasonable limit for search results
      )
    );

    return snapshot.docs
      .map(doc => ({ ...doc.data() as GeneratedLyrics, id: doc.id }))
      .filter(lyrics => 
        lyrics.title.toLowerCase().includes(normalizedTerm) ||
        lyrics.content.toLowerCase().includes(normalizedTerm) ||
        lyrics.options.genre.toLowerCase().includes(normalizedTerm) ||
        lyrics.options.theme.toLowerCase().includes(normalizedTerm)
      );
  } catch (error: any) {
    console.error('Error searching lyrics:', error);
    throw new Error(`Failed to search lyrics: ${error.message}`);
  }
}