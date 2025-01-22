import { jest } from '@jest/globals';

const mockFirebaseApp = {
  name: '[DEFAULT]',
  options: {},
  automaticDataCollectionEnabled: false
};

let mockApps: any[] = [];

jest.mock('firebase/app', () => ({
  getApps: jest.fn(() => mockApps),
  getApp: jest.fn(() => {
    if (!mockApps.length) {
      throw new Error('No Firebase App \'[DEFAULT]\' has been created');
    }
    return mockApps[0];
  }),
  initializeApp: jest.fn(() => {
    const app = { ...mockFirebaseApp };
    mockApps.push(app);
    return app;
  }),
  deleteApp: jest.fn(() => {
    mockApps = [];
    return Promise.resolve();
  })
}));

// Mock Firestore methods
const mockFirestore = {
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

// Reset mock state between tests
export const resetFirebaseMock = () => {
  mockApps = [];
};

export { mockFirestore };
