import { jest } from '@jest/globals';
import type { MockFirestore } from './jest';

// Mock Firestore methods
const mockFirestore: MockFirestore = {
  collection: jest.fn(),
  doc: jest.fn(),
  setDoc: jest.fn(),
  getDocs: jest.fn(),
  deleteDoc: jest.fn(),
  runTransaction: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn()
};

// Mock Firebase app
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({
    firestore: () => mockFirestore
  }))
}));

// Mock Firestore
jest.mock('firebase/firestore', () => ({
  collection: (...args: any[]) => mockFirestore.collection(...args),
  doc: (...args: any[]) => mockFirestore.doc(...args),
  setDoc: (...args: any[]) => mockFirestore.setDoc(...args),
  getDocs: (...args: any[]) => mockFirestore.getDocs(...args),
  deleteDoc: (...args: any[]) => mockFirestore.deleteDoc(...args),
  runTransaction: (...args: any[]) => mockFirestore.runTransaction(...args),
  query: (...args: any[]) => mockFirestore.query(...args),
  where: (...args: any[]) => mockFirestore.where(...args),
  orderBy: (...args: any[]) => mockFirestore.orderBy(...args),
  limit: (...args: any[]) => mockFirestore.limit(...args),
  getFirestore: jest.fn(() => mockFirestore)
}));

export { mockFirestore };
