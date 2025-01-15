import { useState, useMemo, useCallback } from 'react';
import type { GeneratedLyrics } from '../types/lyrics';
import type { DatabaseOptions, SortOption } from '../lib/db/types';
import { getLyrics, saveLyrics, deleteLyrics, searchLyrics } from '../lib/db/lyrics';
import { toast } from 'react-hot-toast';

interface UseLyricsDatabaseReturn {
  lyrics: Array<GeneratedLyrics & { id: string }>;
  isLoading: boolean;
  error: Error | null;
  searchQuery: string;
  selectedGenre: string;
  sortOption: SortOption;
  selectedLyrics: (GeneratedLyrics & { id: string }) | null;
  setSearchQuery: (query: string) => void;
  setSelectedGenre: (genre: string) => void;
  setSortOption: (option: SortOption) => void;
  setSelectedLyrics: (lyrics: (GeneratedLyrics & { id: string }) | null) => void;
  refreshLyrics: () => Promise<void>;
  saveLyrics: (lyrics: GeneratedLyrics) => Promise<string>;
  deleteLyrics: (id: string) => Promise<void>;
  searchLyrics: (term: string) => Promise<void>;
}

export function useLyricsDatabase(): UseLyricsDatabaseReturn {
  const [lyrics, setLyrics] = useState<Array<GeneratedLyrics & { id: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [sortOption, setSortOption] = useState<SortOption>({
    field: 'createdAt',
    direction: 'desc'
  });
  const [selectedLyrics, setSelectedLyrics] = useState<(GeneratedLyrics & { id: string }) | null>(null);

  // Memoize query options
  const queryOptions = useMemo<DatabaseOptions>(() => ({
    genre: selectedGenre || undefined,
    orderBy: sortOption
  }), [selectedGenre, sortOption]);

  // Refresh lyrics with error handling
  const refreshLyrics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const results = await getLyrics(queryOptions);
      setLyrics(results);
    } catch (err: any) {
      const error = new Error(`Failed to fetch lyrics: ${err.message}`);
      setError(error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [queryOptions]);

  // Save lyrics with error handling
  const handleSaveLyrics = useCallback(async (lyricsData: GeneratedLyrics) => {
    setIsLoading(true);
    setError(null);
    try {
      const id = await saveLyrics(lyricsData);
      toast.success('Lyrics saved successfully!');
      await refreshLyrics(); // Refresh the list after saving
      return id;
    } catch (err: any) {
      const error = new Error(`Failed to save lyrics: ${err.message}`);
      setError(error);
      toast.error(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [refreshLyrics]);

  // Delete lyrics with error handling
  const handleDeleteLyrics = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await deleteLyrics(id);
      toast.success('Lyrics deleted successfully!');
      await refreshLyrics(); // Refresh the list after deleting
    } catch (err: any) {
      const error = new Error(`Failed to delete lyrics: ${err.message}`);
      setError(error);
      toast.error(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [refreshLyrics]);

  // Search lyrics with error handling
  const handleSearchLyrics = useCallback(async (term: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const results = await searchLyrics(term);
      setLyrics(results);
    } catch (err: any) {
      const error = new Error(`Failed to search lyrics: ${err.message}`);
      setError(error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    lyrics,
    isLoading,
    error,
    searchQuery,
    selectedGenre,
    sortOption,
    selectedLyrics,
    setSearchQuery,
    setSelectedGenre,
    setSortOption,
    setSelectedLyrics,
    refreshLyrics,
    saveLyrics: handleSaveLyrics,
    deleteLyrics: handleDeleteLyrics,
    searchLyrics: handleSearchLyrics
  };
}