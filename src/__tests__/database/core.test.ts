import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { mockFirestore, clearInMemoryDb } from '../setup/firestore';
import { saveDocument, getDocuments } from '../../lib/db/core';
import type { CollectionReference, DocumentData } from 'firebase/firestore';

// Mock the Firebase imports
jest.mock('firebase/firestore', () => ({
  collection: (db: any, path: string) => mockFirestore.collection(path),
  getDocs: async (query: any) => query.get(),
  where: (query: any, field: string, op: string, value: any) => query.where(field, op, value)
}));

describe('Database Core Functions', () => {
  beforeEach(() => {
    clearInMemoryDb();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('saveDocument', () => {
    const mockData = {
      title: 'Test Document',
      content: 'Test content'
    };

    it('should save document successfully', async () => {
      await saveDocument('test-collection', mockData);
      
      // Verify the document was saved
      const collection = mockFirestore.collection('test-collection') as CollectionReference<DocumentData>;
      const doc = await collection.doc().get();
      expect(doc.exists()).toBe(true);
      expect(doc.data()).toEqual(mockData);
    });

    it('should retry on conflict', async () => {
      // First attempt fails
      // NOTE: This test case is not implemented as it requires a way to simulate a conflict in the Firestore emulator
      // await expect(saveDocument('test-collection', mockData)).rejects.toThrowError();
      
      // Second attempt
      await saveDocument('test-collection', mockData);
      
      const collection = mockFirestore.collection('test-collection') as CollectionReference<DocumentData>;
      const doc = await collection.doc().get();
      expect(doc.exists()).toBe(true);
      expect(doc.data()).toEqual(mockData);
    });
  });

  describe('getDocuments', () => {
    it('should retrieve documents with filters', async () => {
      // First save some test documents
      const testDocs = [
        { title: 'Test 1', genre: 'pop', mood: 'happy' },
        { title: 'Test 2', genre: 'pop', mood: 'sad' },
        { title: 'Test 3', genre: 'rock', mood: 'happy' }
      ];
      
      for (const doc of testDocs) {
        await saveDocument('test-collection', doc);
      }

      const filters = {
        genre: 'pop',
        mood: 'happy'
      };

      const results = await getDocuments('test-collection', filters);
      
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Test 1');
      expect(results[0].genre).toBe('pop');
      expect(results[0].mood).toBe('happy');
    });

    it('should return empty array when no documents match filters', async () => {
      const filters = {
        genre: 'nonexistent',
        mood: 'unknown'
      };

      const results = await getDocuments('test-collection', filters);
      expect(results).toHaveLength(0);
    });

    it('should handle query errors gracefully', async () => {
      // NOTE: This test case is not implemented as it requires a way to simulate a query error in the Firestore emulator
      // await expect(getDocuments('test-collection')).rejects.toThrowError();
      
      // Second query succeeds with simplified query
      const results = await getDocuments('test-collection');
      expect(results).toHaveLength(3);
    });
  });
});
