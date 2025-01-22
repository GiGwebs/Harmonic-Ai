import { db } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, where, orderBy, limit } from 'firebase/firestore';
import type { GenerateOptions, GeneratedLyrics } from '../../types/lyrics';
import type { DatabaseOptions } from './types';

const LYRICS_COLLECTION = 'lyrics';

export async function saveLyrics(lyrics: GeneratedLyrics): Promise<string> {
  try {
    const lyricsWithType = {
      ...lyrics,
      type: lyrics.type || 'generated',
      createdAt: lyrics.createdAt || new Date().toISOString()
    };

    console.log('[Firestore] Saving lyrics:', {
      title: lyricsWithType.title,
      type: lyricsWithType.type,
      createdAt: lyricsWithType.createdAt,
      hasOptions: !!lyricsWithType.options
    });

    if (!db) throw new Error('Firestore not initialized');
    const docRef = await addDoc(collection(db, LYRICS_COLLECTION), lyricsWithType);
    console.log('[Firestore] Lyrics saved successfully with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('[Firestore] Error saving lyrics:', error);
    throw error;
  }
}

export async function getAllGeneratedLyrics(): Promise<Array<GeneratedLyrics & { id: string }>> {
  try {
    console.log('[Firestore] Starting getAllGeneratedLyrics');
    
    if (!db) {
      console.error('[Firestore] Database not initialized');
      throw new Error('Firestore not initialized');
    }
    
    console.log('[Firestore] Creating collection reference:', LYRICS_COLLECTION);
    const lyricsRef = collection(db, LYRICS_COLLECTION);
    
    console.log('[Firestore] Building query');
    // First try without orderBy to test connection
    const q = query(
      lyricsRef,
      where('type', '==', 'generated')
    );
    
    console.log('[Firestore] Executing query');
    const querySnapshot = await getDocs(q);
    
    console.log('[Firestore] Query completed:', {
      size: querySnapshot.size,
      empty: querySnapshot.empty,
      metadata: querySnapshot.metadata,
      exists: !querySnapshot.empty
    });
    
    const lyrics = querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    })) as Array<GeneratedLyrics & { id: string }>;

    // Sort in memory for development
    lyrics.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
    
    return lyrics;
  } catch (error: any) {
    console.error('[Firestore] Error in getAllGeneratedLyrics:', error);
    if (error.code === 'failed-precondition' && error.message.includes('index')) {
      throw new Error('Database index not ready. Please wait a few moments and try again.');
    }
    throw new Error(`Failed to fetch lyrics: ${error.message}`);
  }
}

export async function deleteGeneratedLyrics(id: string): Promise<void> {
  try {
    if (!db) throw new Error('Firestore not initialized');
    await deleteDoc(doc(db, LYRICS_COLLECTION, id));
  } catch (error) {
    console.error('Error deleting lyrics:', error);
    throw error;
  }
}

export async function getLyrics(
  options?: DatabaseOptions
): Promise<Array<GeneratedLyrics & { id: string }>> {
  return getDocuments<GeneratedLyrics>(LYRICS_COLLECTION, options);
}

export async function getLatestLyrics(
  limit: number = 10
): Promise<Array<GeneratedLyrics & { id: string }>> {
  return getDocuments<GeneratedLyrics>(LYRICS_COLLECTION, {
    orderBy: {
      field: 'createdAt',
      direction: 'desc'
    },
    limit
  });
}

export async function deleteLyrics(id: string): Promise<void> {
  if (!id) {
    throw new Error('Lyrics ID is required');
  }

  try {
    if (!db) throw new Error('Firestore not initialized');
    const docRef = doc(db, LYRICS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error: any) {
    console.error('Error deleting lyrics:', error);
    throw new Error(`Failed to delete lyrics: ${error.message}`);
  }
}

export async function searchLyrics(
  searchTerm: string
): Promise<Array<GeneratedLyrics & { id: string }>> {
  if (!searchTerm.trim()) {
    return [];
  }

  const normalizedTerm = searchTerm.toLowerCase().trim();
  
  try {
    if (!db) throw new Error('Firestore not initialized');
    const q = query(
      collection(db, LYRICS_COLLECTION),
      orderBy('createdAt', 'desc'),
      limit(100)
    );
    const snapshot = await getDocs(q);

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

async function getDocuments<T>(
  collectionName: string,
  options?: DatabaseOptions
): Promise<Array<T & { id: string }>> {
  try {
    if (!db) throw new Error('Firestore not initialized');
    
    const constraints: any[] = [];
    if (options?.orderBy) {
      constraints.push(orderBy(options.orderBy.field, options.orderBy.direction));
    }
    if (options?.limit) {
      constraints.push(limit(options.limit));
    }
    
    const q = query(collection(db, collectionName), ...constraints);
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Array<T & { id: string }>;
  } catch (error) {
    console.error('Error fetching documents:', error);
    throw error;
  }
}
