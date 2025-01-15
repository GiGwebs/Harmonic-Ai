import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { renderHook, act } from '@testing-library/react-hooks';
import { useLyricsDatabase } from '../../hooks/useLyricsDatabase';
import * as lyricsDb from '../../lib/db/lyrics';
import { mockLyricsData } from '../utils/firebaseMocks';
import type { GeneratedLyrics } from '../../types/lyrics';

// Mock the lyrics database module
jest.mock('../../lib/db/lyrics');

// Type the mocked functions
type MockedLyricsDb = {
  getLyrics: jest.MockedFunction<typeof lyricsDb.getLyrics>;
  saveLyrics: jest.MockedFunction<typeof lyricsDb.saveLyrics>;
  deleteLyrics: jest.MockedFunction<typeof lyricsDb.deleteLyrics>;
};

const mockedLyricsDb = lyricsDb as unknown as MockedLyricsDb;

describe('useLyricsDatabase Hook', () => {
  const mockLyrics = mockLyricsData.withMetadata;
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should load lyrics on mount', async () => {
    const mockData = [{
      ...mockLyrics.data,
      id: mockLyrics.id
    }];
    mockedLyricsDb.getLyrics.mockResolvedValue(mockData);

    const { result, waitForNextUpdate } = renderHook(() => useLyricsDatabase());
    
    expect(result.current.isLoading).toBe(true);
    await waitForNextUpdate();
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.lyrics).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  it('should handle saving lyrics', async () => {
    const newId = 'new-id';
    mockedLyricsDb.saveLyrics.mockResolvedValue(newId);
    mockedLyricsDb.getLyrics.mockResolvedValue([{
      ...mockLyrics.data,
      id: mockLyrics.id
    }]);

    const { result } = renderHook(() => useLyricsDatabase());
    
    await act(async () => {
      await result.current.saveLyrics(mockLyrics.data);
    });

    expect(mockedLyricsDb.saveLyrics).toHaveBeenCalledWith(mockLyrics.data);
    expect(mockedLyricsDb.getLyrics).toHaveBeenCalled();
  });

  it('should handle save errors', async () => {
    const error = new Error('Failed to save');
    mockedLyricsDb.saveLyrics.mockRejectedValue(error);

    const { result } = renderHook(() => useLyricsDatabase());
    
    await act(async () => {
      await expect(result.current.saveLyrics(mockLyrics.data)).rejects.toThrow('Failed to save');
    });

    expect(result.current.error).toBe(error);
  });

  it('should handle deleting lyrics', async () => {
    mockedLyricsDb.deleteLyrics.mockResolvedValue(undefined);
    mockedLyricsDb.getLyrics.mockResolvedValue([]);

    const { result } = renderHook(() => useLyricsDatabase());
    
    await act(async () => {
      await result.current.deleteLyrics('test-id');
    });

    expect(mockedLyricsDb.deleteLyrics).toHaveBeenCalledWith('test-id');
    expect(mockedLyricsDb.getLyrics).toHaveBeenCalled();
  });

  it('should handle filtering lyrics', async () => {
    const searchResults = [{
      ...mockLyrics.data,
      id: mockLyrics.id
    }];
    mockedLyricsDb.getLyrics.mockResolvedValue(searchResults);

    const { result } = renderHook(() => useLyricsDatabase());
    
    await act(async () => {
      await result.current.refreshLyrics();
      result.current.setSelectedGenre('rock');
    });

    expect(result.current.lyrics).toEqual(searchResults);
    expect(result.current.selectedGenre).toBe('rock');
  });

  it('should handle sorting lyrics', async () => {
    const lyrics = [{
      ...mockLyrics.data,
      id: mockLyrics.id
    }];
    mockedLyricsDb.getLyrics.mockResolvedValue(lyrics);

    const { result } = renderHook(() => useLyricsDatabase());
    
    await act(async () => {
      await result.current.refreshLyrics();
      result.current.setSortOption({ field: 'title', direction: 'asc' });
    });

    expect(result.current.lyrics).toEqual(lyrics);
    expect(result.current.sortOption).toEqual({ field: 'title', direction: 'asc' });
  });
});
