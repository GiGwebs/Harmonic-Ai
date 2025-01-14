import { useState, useCallback, useMemo } from 'react';
import { getSongs } from '../lib/db/songs';
import { useDatabaseQuery } from './useDatabaseQuery';
import type { Song } from '../types/song';
import type { SortOption } from '../components/database/SortSelect';
import type { DatabaseOptions } from '../lib/db/types';

export function useSongDatabase() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [sortOption, setSortOption] = useState<SortOption>({
    field: 'title',
    direction: 'asc'
  });
  const [selectedSong, setSelectedSong] = useState<(Song & { id: string }) | null>(null);

  const queryOptions = useMemo(() => ({
    genre: selectedGenre || undefined,
    orderBy: {
      field: sortOption.field,
      direction: sortOption.direction
    }
  }), [selectedGenre, sortOption.field, sortOption.direction]);

  const { data: rawSongs, isLoading, error, retry, retryCount } = useDatabaseQuery<Song & { id: string }>({
    queryFn: getSongs,
    options: queryOptions
  });

  // Transform and memoize songs data
  const songs = useMemo(() => {
    console.log('Processing songs data, count:', rawSongs.length);
    return rawSongs.map(song => {
      let formattedDate: string | null = null;
      if (song.createdAt) {
        try {
          // Handle Firestore Timestamp
          if (typeof song.createdAt === 'object' && 'seconds' in song.createdAt) {
            formattedDate = new Date(song.createdAt.seconds * 1000).toISOString();
          } 
          // Handle ISO string
          else if (typeof song.createdAt === 'string') {
            const date = new Date(song.createdAt);
            if (!isNaN(date.getTime())) {
              formattedDate = song.createdAt;
            }
          }
        } catch (err) {
          console.error('Error formatting date for song:', song.title, err);
        }
      }

      return {
        ...song,
        genre: (song.genre || []).filter(g => typeof g === 'string'),
        createdAt: formattedDate
      };
    });
  }, [rawSongs]);

  // Memoize filtered songs
  const filteredSongs = useMemo(() => {
    if (!searchQuery) return songs;
    const query = searchQuery.toLowerCase();
    return songs.filter(song => 
      song.title.toLowerCase().includes(query) ||
      song.artist.toLowerCase().includes(query)
    );
  }, [songs, searchQuery]);

  return {
    songs: filteredSongs,
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
    selectedSong,
    setSelectedSong
  };
}