import { 
  collection, 
  doc,
  getDocs,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  type QueryConstraint,
  type DocumentData
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import type { DatabaseOptions, SaveOptions } from './types';

export async function saveDocument<T extends DocumentData>(
  collectionName: string,
  data: T,
  options: SaveOptions = {}
): Promise<string> {
  try {
    const collectionRef = collection(db, collectionName);
    const docRef = options.generateId ? doc(collectionRef) : doc(collectionRef);
    
    await setDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }, { merge: options.merge });
    
    return docRef.id;
  } catch (error) {
    console.error(`Error saving document to ${collectionName}:`, error);
    throw new Error(`Failed to save document to ${collectionName}`);
  }
}

export async function getDocuments<T extends DocumentData>(
  collectionName: string,
  options?: DatabaseOptions
): Promise<Array<T & { id: string }>> {
  try {
    const constraints: QueryConstraint[] = [];
    
    // Add genre filter if specified
    if (options?.genre) {
      constraints.push(where('genre', 'array-contains', options.genre));
    }

    // Add ordering if specified
    if (options?.orderBy) {
      constraints.push(orderBy(options.orderBy.field, options.orderBy.direction));
    }

    // Add limit if specified
    if (options?.limit) {
      constraints.push(limit(options.limit));
    }

    // Create query with error handling for missing indexes
    const q = query(collection(db, collectionName), ...constraints);
    
    try {
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        ...(doc.data() as T),
        id: doc.id
      }));
    } catch (error: any) {
      if (error.code === 'failed-precondition' && error.message.includes('requires an index')) {
        console.error('Missing Firestore index:', error.message);
        // Fall back to unfiltered query if index is missing
        const fallbackQuery = query(collection(db, collectionName));
        const fallbackSnapshot = await getDocs(fallbackQuery);
        return fallbackSnapshot.docs.map(doc => ({
          ...(doc.data() as T),
          id: doc.id
        }));
      }
      throw error;
    }
  } catch (error) {
    console.error(`Error fetching documents from ${collectionName}:`, error);
    throw new Error(`Failed to fetch documents from ${collectionName}`);
  }
}