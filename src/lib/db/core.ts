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
  type DocumentData,
  runTransaction
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import type { DatabaseOptions, SaveOptions } from './types';

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

class DatabaseError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly operation?: string
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

/**
 * Implements exponential backoff retry logic
 */
async function withRetry<T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES,
  delay = INITIAL_RETRY_DELAY
): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    if (retries === 0 || error.code === 'permission-denied') {
      throw error;
    }
    
    console.warn(`Retrying operation after ${delay}ms. Retries left: ${retries}`);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return withRetry(operation, retries - 1, delay * 2);
  }
}

/**
 * Saves a document to Firestore with retry logic and validation
 */
export async function saveDocument<T extends DocumentData>(
  collectionName: string,
  data: T,
  options: SaveOptions = {}
): Promise<string> {
  if (!data || typeof data !== 'object') {
    throw new DatabaseError('Invalid document data', 'invalid-argument', 'save');
  }

  return withRetry(async () => {
    try {
      const collectionRef = collection(db, collectionName);
      const docRef = options.generateId ? doc(collectionRef) : doc(collectionRef);
      
      // Use transaction for atomic updates
      await runTransaction(db, async (transaction) => {
        const docSnapshot = await transaction.get(docRef);
        
        if (docSnapshot.exists() && !options.merge) {
          throw new DatabaseError(
            'Document already exists and merge is not enabled',
            'already-exists',
            'save'
          );
        }
        
        const timestamp = new Date().toISOString();
        const documentData = {
          ...data,
          updatedAt: timestamp,
          createdAt: docSnapshot.exists() ? docSnapshot.data().createdAt : timestamp
        };

        transaction.set(docRef, documentData, { merge: options.merge });
      });
      
      return docRef.id;
    } catch (error: any) {
      console.error(`Error saving document to ${collectionName}:`, {
        error,
        data: JSON.stringify(data),
        options
      });
      
      throw new DatabaseError(
        `Failed to save document to ${collectionName}: ${error.message}`,
        error.code,
        'save'
      );
    }
  });
}

/**
 * Retrieves documents from Firestore with retry logic and pagination
 */
export async function getDocuments<T extends DocumentData>(
  collectionName: string,
  options?: DatabaseOptions
): Promise<Array<T & { id: string }>> {
  return withRetry(async () => {
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
          console.warn('Missing Firestore index, falling back to unfiltered query:', error.message);
          const fallbackQuery = query(collection(db, collectionName));
          const fallbackSnapshot = await getDocs(fallbackQuery);
          return fallbackSnapshot.docs.map(doc => ({
            ...(doc.data() as T),
            id: doc.id
          }));
        }
        throw error;
      }
    } catch (error: any) {
      console.error(`Error fetching documents from ${collectionName}:`, {
        error,
        options
      });
      
      throw new DatabaseError(
        `Failed to fetch documents from ${collectionName}: ${error.message}`,
        error.code,
        'fetch'
      );
    }
  });
}