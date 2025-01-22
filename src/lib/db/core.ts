import { 
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
  runTransaction,
  setDoc,
  type QueryConstraint,
  type DocumentData,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';
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

export async function saveDocument<T extends DocumentData>(
  collectionName: string,
  data: T,
  options: SaveOptions = {}
): Promise<string> {
  if (!collectionName) {
    throw new DatabaseError('Collection name is required', 'invalid-args', 'save');
  }

  try {
    const collectionRef = collection(db, collectionName);
    const docRef = options.id ? doc(collectionRef, options.id) : doc(collectionRef);
    
    // Add timestamps and metadata
    const documentData = {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      metadata: {
        ...(data.metadata || {}),
        version: '1.0',
        lastModified: new Date().toISOString()
      }
    };

    await withRetry(() => setDoc(docRef, documentData));
    console.log(`Document saved successfully in ${collectionName}:`, docRef.id);
    
    return docRef.id;
  } catch (error: any) {
    console.error('Error saving document:', error);
    throw new DatabaseError(
      `Failed to save document: ${error.message}`,
      error.code,
      'save'
    );
  }
}

export async function getDocuments<T extends DocumentData>(
  collectionName: string,
  options?: DatabaseOptions
): Promise<Array<T & { id: string }>> {
  if (!collectionName) {
    throw new DatabaseError('Collection name is required', 'invalid-args', 'get');
  }

  try {
    const constraints: QueryConstraint[] = [];
    
    if (options?.orderBy) {
      constraints.push(orderBy(options.orderBy.field, options.orderBy.direction));
    }
    
    if (options?.limit) {
      constraints.push(limit(options.limit));
    }
    
    if (options?.where) {
      constraints.push(where(options.where.field, options.where.operator, options.where.value));
    }
    
    const q = constraints.length > 0
      ? query(collection(db, collectionName), ...constraints)
      : collection(db, collectionName);
    
    const querySnapshot = await withRetry(() => getDocs(q));
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as T & { id: string }));
  } catch (error: any) {
    console.error('Error getting documents:', error);
    throw new DatabaseError(
      `Failed to get documents: ${error.message}`,
      error.code,
      'get'
    );
  }
}