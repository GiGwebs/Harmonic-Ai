import { db } from '../firebase';
import { collection, addDoc, deleteDoc, doc, getDocs, query, orderBy } from 'firebase/firestore';
import type { SongAnalysis } from '../../types/songs';

const SONGS_COLLECTION = 'songs';

// Helper function to sanitize data for Firestore
function sanitizeForFirestore(data: any): any {
  if (data === null || data === undefined) {
    return null;
  }
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizeForFirestore(item)).filter(Boolean);
  }
  
  if (typeof data === 'object') {
    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      const sanitizedValue = sanitizeForFirestore(value);
      if (sanitizedValue !== undefined && sanitizedValue !== null) {
        sanitized[key] = sanitizedValue;
      }
    }
    return sanitized;
  }
  
  return data;
}

// Export this as saveSongAnalysisFirebase for backward compatibility
export const saveSongAnalysisFirebase = async (analysis: SongAnalysis): Promise<string> => {
  try {
    if (!analysis.metadata?.title || !analysis.metadata?.artist) {
      throw new Error('Song metadata is missing required fields (title or artist)');
    }

    // Ensure all required fields are present with default values
    const sanitizedAnalysis = {
      metadata: {
        title: analysis.metadata.title,
        artist: analysis.metadata.artist,
        url: analysis.metadata.url || null
      },
      musicalElements: {
        key: analysis.musicalElements?.key || 'Unknown',
        timeSignature: analysis.musicalElements?.timeSignature || '4/4',
        tempo: analysis.musicalElements?.tempo || 'Unknown',
        dominantInstruments: analysis.musicalElements?.dominantInstruments || []
      },
      productionTechniques: analysis.productionTechniques || [],
      commercialViability: {
        score: analysis.commercialViability?.score || 0,
        factors: analysis.commercialViability?.factors || []
      },
      lyricalThemes: analysis.lyricalThemes || [],
      uniqueCharacteristics: analysis.uniqueCharacteristics || [],
      createdAt: new Date().toISOString()
    };

    // Sanitize the data to remove any undefined values
    const firestoreData = sanitizeForFirestore(sanitizedAnalysis);

    // Save to Firestore
    const docRef = await addDoc(collection(db, SONGS_COLLECTION), firestoreData);
    return docRef.id;
  } catch (error) {
    console.error('Error saving song analysis:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to save analysis to database');
  }
};

// Alias for consistency
export const saveSongAnalysis = saveSongAnalysisFirebase;

export async function deleteSongAnalysis(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, SONGS_COLLECTION, id));
  } catch (error) {
    console.error('Error deleting song analysis:', error);
    throw new Error('Failed to delete analysis from database');
  }
}

export async function getAllSongAnalyses(): Promise<Array<SongAnalysis & { id: string }>> {
  try {
    const q = query(
      collection(db, SONGS_COLLECTION),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        metadata: {
          title: data.metadata?.title || 'Unknown Title',
          artist: data.metadata?.artist || 'Unknown Artist',
          url: data.metadata?.url || null
        },
        musicalElements: {
          key: data.musicalElements?.key || 'Unknown',
          timeSignature: data.musicalElements?.timeSignature || '4/4',
          tempo: data.musicalElements?.tempo || 'Unknown',
          dominantInstruments: data.musicalElements?.dominantInstruments || []
        },
        productionTechniques: data.productionTechniques || [],
        commercialViability: {
          score: data.commercialViability?.score || 0,
          factors: data.commercialViability?.factors || []
        },
        lyricalThemes: data.lyricalThemes || [],
        uniqueCharacteristics: data.uniqueCharacteristics || [],
        createdAt: data.createdAt || new Date().toISOString()
      };
    });
  } catch (error) {
    console.error('Error fetching song analyses:', error);
    throw new Error('Failed to fetch analyses from database');
  }
}