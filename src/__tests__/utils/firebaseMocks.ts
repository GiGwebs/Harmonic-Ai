import { jest } from '@jest/globals';
import type {
  QuerySnapshot,
  DocumentData,
  DocumentReference,
  Query,
  Transaction,
  DocumentSnapshot,
  QueryDocumentSnapshot,
  SnapshotMetadata,
  WithFieldValue,
  PartialWithFieldValue,
  SetOptions,
  UpdateData,
  FieldPath
} from 'firebase/firestore';

export type MockTransaction = {
  get: jest.MockedFunction<Transaction['get']>;
  set: jest.MockedFunction<Transaction['set']>;
  update: jest.MockedFunction<Transaction['update']>;
  delete: jest.MockedFunction<Transaction['delete']>;
};

const createMockMetadata = (): SnapshotMetadata => ({
  hasPendingWrites: false,
  fromCache: false,
  isEqual: (other: SnapshotMetadata) => {
    return other.hasPendingWrites === false && other.fromCache === false;
  }
});

export const createMockQueryDocumentSnapshot = <T extends DocumentData = DocumentData>(
  exists: boolean,
  data: T
): QueryDocumentSnapshot<T> => ({
  exists: function(this: QueryDocumentSnapshot<T>): this is QueryDocumentSnapshot<T> {
    return exists;
  },
  data: () => data,
  id: 'mock-doc-id',
  ref: {} as DocumentReference<T>,
  metadata: createMockMetadata(),
  get: (fieldPath: string | FieldPath) => data[fieldPath as string]
});

export const createMockDocumentSnapshot = <T extends DocumentData = DocumentData>(
  exists: boolean,
  data?: T
): DocumentSnapshot<T> => ({
  exists: function(this: DocumentSnapshot<T>): this is QueryDocumentSnapshot<T> {
    return exists;
  },
  data: () => exists ? data || {} as T : undefined,
  id: 'mock-doc-id',
  ref: {} as DocumentReference<T>,
  metadata: createMockMetadata(),
  get: (fieldPath: string | FieldPath) => data ? data[fieldPath as string] : undefined
});

const mockTransactionInstance = {
  get: jest.fn(),
  set: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
} as Transaction;

export const createMockTransaction = (): MockTransaction => {
  const mockGet = jest.fn() as jest.MockedFunction<Transaction['get']>;
  const mockSet = jest.fn() as jest.MockedFunction<Transaction['set']>;
  const mockUpdate = jest.fn() as jest.MockedFunction<Transaction['update']>;
  const mockDelete = jest.fn() as jest.MockedFunction<Transaction['delete']>;

  mockGet.mockImplementation((ref: DocumentReference<any>) => 
    Promise.resolve(createMockDocumentSnapshot(true)));
  
  mockSet.mockImplementation((ref: DocumentReference<any>, data: any) => {
    mockTransactionInstance.set(ref, data);
    return mockTransactionInstance;
  });

  mockUpdate.mockImplementation((ref: DocumentReference<any>, data: any) => {
    mockTransactionInstance.update(ref, data);
    return mockTransactionInstance;
  });

  mockDelete.mockImplementation((ref: DocumentReference<any>) => {
    mockTransactionInstance.delete(ref);
    return mockTransactionInstance;
  });

  return {
    get: mockGet,
    set: mockSet,
    update: mockUpdate,
    delete: mockDelete
  };
};

export const createMockQuerySnapshot = <T extends DocumentData = DocumentData>(
  docs: Array<{ id: string; data: T }>
): QuerySnapshot<T> => ({
  docs: docs.map(doc => createMockQueryDocumentSnapshot(true, doc.data)),
  size: docs.length,
  empty: docs.length === 0,
  forEach: (callback) => {
    docs.forEach((doc) => callback(createMockQueryDocumentSnapshot(true, doc.data)));
  },
  docChanges: () => [],
  metadata: createMockMetadata(),
  query: {} as Query<T>
});

export type FirestoreMockFunctions = {
  getDocs: jest.MockedFunction<(query: Query<DocumentData>) => Promise<QuerySnapshot<DocumentData>>>;
  setDoc: jest.MockedFunction<(ref: DocumentReference<DocumentData>, data: DocumentData) => Promise<void>>;
  updateDoc: jest.MockedFunction<(ref: DocumentReference<DocumentData>, data: Partial<DocumentData>) => Promise<void>>;
  deleteDoc: jest.MockedFunction<(ref: DocumentReference<DocumentData>) => Promise<void>>;
  runTransaction: jest.MockedFunction<(callback: (transaction: Transaction) => Promise<any>) => Promise<any>>;
  collection: jest.MockedFunction<(path: string) => any>;
  doc: jest.MockedFunction<(path: string) => any>;
  query: jest.MockedFunction<(collection: any, ...queryConstraints: any[]) => any>;
  where: jest.MockedFunction<(fieldPath: string, opStr: string, value: any) => any>;
  orderBy: jest.MockedFunction<(fieldPath: string, directionStr?: string) => any>;
  limit: jest.MockedFunction<(limit: number) => any>;
};

export const createMockFirestore = (): FirestoreMockFunctions => {
  const mockRunTransaction = jest.fn() as jest.MockedFunction<(callback: (transaction: Transaction) => Promise<any>) => Promise<any>>;
  mockRunTransaction.mockImplementation((callback) => Promise.resolve(callback(mockTransactionInstance)));

  const mockFirestore = {
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    getDocs: jest.fn().mockImplementation((query) => 
      Promise.resolve(createMockQuerySnapshot([]))),
    setDoc: jest.fn().mockImplementation((ref, data) => 
      Promise.resolve()),
    updateDoc: jest.fn().mockImplementation((ref, data) => 
      Promise.resolve()),
    deleteDoc: jest.fn().mockImplementation((ref) => 
      Promise.resolve()),
    runTransaction: mockRunTransaction,
    query: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis()
  };

  // Setup default implementations
  mockFirestore.collection.mockReturnValue({
    doc: mockFirestore.doc
  });

  mockFirestore.doc.mockReturnValue({
    id: 'mock-doc-id',
    collection: mockFirestore.collection
  });

  mockFirestore.query.mockReturnValue({
    where: mockFirestore.where,
    orderBy: mockFirestore.orderBy,
    limit: mockFirestore.limit
  });

  return mockFirestore as FirestoreMockFunctions;
};

// Common test data
export const mockLyricsData = {
  basic: {
    id: 'test-id-1',
    data: {
      title: 'Test Song',
      content: '[Verse 1]\nTest lyrics content\n[Chorus]\nTest chorus',
      options: {
        genre: 'pop',
        mood: 'happy',
        theme: 'love',
        structure: 'verse-chorus'
      },
      createdAt: '2025-01-14T22:00:00.000Z'
    }
  },
  withMetadata: {
    id: 'test-id-2',
    data: {
      title: 'Test Song with Metadata',
      content: '[Verse 1]\nTest content\n[Chorus]\nTest chorus',
      options: {
        genre: 'rock',
        mood: 'energetic',
        theme: 'freedom',
        structure: 'verse-chorus-bridge'
      },
      createdAt: '2025-01-14T22:30:00.000Z',
      metadata: {
        wordCount: 20,
        verseCount: 2,
        hasChorus: true
      }
    }
  }
};
