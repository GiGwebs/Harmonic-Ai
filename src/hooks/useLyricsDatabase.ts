import { useState, useMemo } from 'react';
import { getLyrics } from '../lib/db/lyrics';
import { useDatabaseQuery } from './useDatabaseQuery';
import type { GeneratedLyrics } from '../types/lyrics';
import type { SortOption } from '../components/database/SortSelect';
import type { DatabaseOptions } from '../lib/db/types';

export function useLyricsDatabase() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [sortOption, setSortOption] = useState<SortOption>({
    field: 'createdAt',  // Default to sorting by creation date
    direction: 'desc'    // Newest first
  });
  const [selectedLyrics, setSelectedLyrics] = useState<(GeneratedLyrics & { id: string }) | null>(null);

  // Memoize query options to prevent unnecessary re-renders
  const queryOptions = useMemo<DatabaseOptions>(() => ({
    genre: selectedGenre || undefined,
    orderBy: {
      field: sortOption.field,
      direction: sortOption.direction
    }
  }), [selectedGenre, sortOption.field, sortOption.direction]);

  const { 
    data: lyrics, 
    isLoading, 
    error,
    retry,
    retryCount 
  } = useDatabaseQuery<GeneratedLyrics & { id: string }>({
    queryFn: getLyrics,
    options: queryOptions,
    timeout: 10000  // 10 second timeout
  });

  // Memoize filtered lyrics to prevent unnecessary filtering
  const filteredLyrics = useMemo(() => {
    console.log('Filtering lyrics, count:', lyrics.length);
    if (!searchQuery) return lyrics;
    
    const query = searchQuery.toLowerCase();
    return lyrics.filter(item => 
      item.title.toLowerCase().includes(query) ||
      item.content.toLowerCase().includes(query)
    );
  }, [lyrics, searchQuery]);

  // Memoize the return object to prevent unnecessary re-renders
  return useMemo(() => ({
    lyrics: filteredLyrics,
    isLoading,
    error,
    retry,
    retryCount,
    searchQuery,
    setSearchQuery,
    selectedGenre,
    setSelectedGenre,
    sortOption,
    setSortOption,
    selectedLyrics,
    setSelectedLyrics
  }), [
    filteredLyrics,
    isLoading,
    error,
    retry,
    retryCount,
    searchQuery,
    selectedGenre,
    sortOption,
    selectedLyrics
  ]);
}