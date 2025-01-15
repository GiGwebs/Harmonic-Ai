import { GeneratedLyrics } from '../../types/lyrics';
import { Mock } from 'jest-mock';

declare global {
  namespace jest {
    interface MockInstance<T = any, Y extends any[] = any> {
      mockResolvedValue(value: T): this;
      mockRejectedValue(value: any): this;
      mockResolvedValueOnce(value: T): this;
      mockRejectedValueOnce(value: any): this;
      mockImplementation(fn: (...args: Y) => any): this;
      mockReturnValue(value: T): this;
    }
  }
}

export interface MockFirestore {
  collection: Mock;
  doc: Mock;
  setDoc: Mock;
  getDocs: Mock<Promise<{ docs: Array<{ id: string; data: () => any }> }>>;
  deleteDoc: Mock<Promise<void>>;
  runTransaction: Mock;
  query: Mock;
  where: Mock;
  orderBy: Mock;
  limit: Mock;
}

export interface MockLyricsDb {
  getLyrics: Mock<Promise<Array<GeneratedLyrics & { id: string }>>>;
  saveLyrics: Mock<Promise<string>>;
  deleteLyrics: Mock<Promise<void>>;
  searchLyrics: Mock<Promise<Array<GeneratedLyrics & { id: string }>>>;
}
