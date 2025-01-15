import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { jest } from '@jest/globals';
import type { 
  DocumentData, 
  DocumentSnapshot, 
  QueryDocumentSnapshot, 
  QuerySnapshot,
  DocumentReference,
  Query,
  CollectionReference
} from 'firebase/firestore';

// Initialize Firebase for testing
const app = initializeApp({
  projectId: 'demo-harmonic-ai'
});

// Initialize Firestore
const db = getFirestore(app);

// Connect to the emulator
connectFirestoreEmulator(db, 'localhost', 8080);

// Simple in-memory storage for testing
const inMemoryDb = new Map<string, DocumentData>();

// Helper function to create document snapshots
const createDocumentSnapshot = (exists: boolean, data?: DocumentData): DocumentSnapshot<DocumentData> => ({
  exists: () => exists,
  data: () => data || null,
  id: 'test-id',
  ref: {} as DocumentReference<DocumentData>,
  metadata: {
    hasPendingWrites: false,
    fromCache: false,
    isEqual: () => true
  },
  get: () => null
});

// Helper function to create query snapshots
const createQuerySnapshot = (docs: DocumentData[]): QuerySnapshot<DocumentData> => ({
  docs: docs.map(doc => ({
    ...createDocumentSnapshot(true, doc),
    data: () => doc
  } as QueryDocumentSnapshot<DocumentData>)),
  size: docs.length,
  empty: docs.length === 0,
  forEach: (callback) => {
    docs.forEach(doc => callback({
      ...createDocumentSnapshot(true, doc),
      data: () => doc
    } as QueryDocumentSnapshot<DocumentData>));
  },
  docChanges: () => [],
  metadata: {
    hasPendingWrites: false,
    fromCache: false,
    isEqual: () => true
  }
});

// Create a query that supports where clauses
const createQuery = (collection: string, filters: Record<string, any> = {}): Query<DocumentData> => {
  const docs = Array.from(inMemoryDb.entries())
    .filter(([key, data]) => {
      if (!key.startsWith(collection)) return false;
      return Object.entries(filters).every(([field, value]) => {
        const fieldPath = field.split('.');
        let current = data;
        for (const part of fieldPath) {
          if (current === undefined) return false;
          current = current[part];
        }
        return current === value;
      });
    })
    .map(([_, data]) => data);

  return {
    where: () => createQuery(collection, filters),
    get: async () => createQuerySnapshot(docs)
  } as unknown as Query<DocumentData>;
};

// Create a collection reference
const createCollection = (path: string): CollectionReference<DocumentData> => ({
  id: path,
  path,
  parent: null,
  doc: (id: string = 'test-id') => ({
    id,
    set: async (data: DocumentData) => {
      inMemoryDb.set(`${path}/${id}`, data);
    },
    get: async () => createDocumentSnapshot(inMemoryDb.has(`${path}/${id}`), inMemoryDb.get(`${path}/${id}`)),
    delete: async () => {
      inMemoryDb.delete(`${path}/${id}`);
    }
  }),
  where: () => createQuery(path)
} as unknown as CollectionReference<DocumentData>);

// Export the mock Firestore
export const mockFirestore = {
  collection: jest.fn().mockImplementation((path: string) => createCollection(path))
};

// Helper function to clear the in-memory database between tests
export const clearInMemoryDb = () => {
  inMemoryDb.clear();
  jest.clearAllMocks();
};

export { db };
