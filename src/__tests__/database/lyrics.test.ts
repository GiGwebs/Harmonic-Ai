import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { mockFirestore, clearInMemoryDb } from '../setup/firestore';
import { saveLyrics, getLyrics } from '../../lib/db/lyrics';
import type { GeneratedLyrics } from '../../types/lyrics';
import type { CollectionReference, DocumentData } from 'firebase/firestore';

// Mock the Firebase imports
jest.mock('firebase/firestore', () => ({
  collection: (db: any, path: string) => mockFirestore.collection(path),
  getDocs: async (query: any) => query.get(),
  where: (query: any, field: string, op: string, value: any) => query.where(field, op, value)
}));

describe('Lyrics Database Functions', () => {
  beforeEach(() => {
    clearInMemoryDb();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('saveLyrics', () => {
    const mockLyrics: GeneratedLyrics = {
      title: 'Test Song',
      content: '[Verse 1]\nTest lyrics\n[Chorus]\nTest chorus',
      options: {
        genre: 'pop',
        mood: 'happy',
        theme: 'love',
        structure: 'verse-chorus'
      },
      createdAt: new Date().toISOString()
    };

    it('should save lyrics successfully', async () => {
      await saveLyrics(mockLyrics);
      
      // Verify the lyrics were saved
      const collection = mockFirestore.collection('lyrics') as CollectionReference<DocumentData>;
      const doc = await collection.doc().get();
      expect(doc.exists()).toBe(true);
      expect(doc.data()).toMatchObject({
        title: mockLyrics.title,
        content: mockLyrics.content,
        options: mockLyrics.options
      });
    });

    it('should validate required fields', async () => {
      const invalidLyrics = { ...mockLyrics, title: '' };
      await expect(saveLyrics(invalidLyrics as GeneratedLyrics))
        .rejects.toThrow('Missing required fields');
    });

    it('should validate content length', async () => {
      const longLyrics = {
        ...mockLyrics,
        content: 'a'.repeat(51000) // Exceeds 50KB limit
      };
      await expect(saveLyrics(longLyrics as GeneratedLyrics))
        .rejects.toThrow('Content exceeds maximum length');
    });
  });

  describe('getLyrics', () => {
    it('should retrieve lyrics with filters', async () => {
      // First save some test lyrics
      const testLyrics = [
        {
          title: 'Happy Pop Song',
          content: '[Verse 1]\nTest lyrics 1',
          options: {
            genre: 'pop',
            mood: 'happy',
            theme: 'love',
            structure: 'verse-chorus'
          },
          createdAt: new Date().toISOString()
        },
        {
          title: 'Sad Pop Song',
          content: '[Verse 1]\nTest lyrics 2',
          options: {
            genre: 'pop',
            mood: 'sad',
            theme: 'heartbreak',
            structure: 'verse-chorus'
          },
          createdAt: new Date().toISOString()
        },
        {
          title: 'Happy Rock Song',
          content: '[Verse 1]\nTest lyrics 3',
          options: {
            genre: 'rock',
            mood: 'happy',
            theme: 'freedom',
            structure: 'verse-chorus-bridge'
          },
          createdAt: new Date().toISOString()
        }
      ] as GeneratedLyrics[];
      
      for (const lyrics of testLyrics) {
        await saveLyrics(lyrics);
      }

      const filters = {
        genre: 'pop',
        mood: 'happy'
      };

      const results = await getLyrics(filters);
      
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Happy Pop Song');
      expect(results[0].options.genre).toBe('pop');
      expect(results[0].options.mood).toBe('happy');
    });

    it('should return empty array when no lyrics match filters', async () => {
      const filters = {
        genre: 'nonexistent',
        mood: 'unknown'
      };

      const results = await getLyrics(filters);
      expect(results).toHaveLength(0);
    });
  });
});
