import React from 'react';
import { Music2, RefreshCw } from 'lucide-react';
import { Button } from '../common/Button';
import { SongCard } from './SongCard';
import type { Song } from '../../types';

interface SongListProps {
  songs: Song[];
  isLoading: boolean;
  error?: string;
  onSongClick: (song: Song) => void;
  onRetry?: () => void;
  retryCount?: number;
}

export const SongList = React.memo(function SongList({ 
  songs, 
  isLoading, 
  error,
  onSongClick,
  onRetry,
  retryCount = 0
}: SongListProps) {
  console.log('SongList rendering, songs count:', songs.length);

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-600">
          {retryCount > 0 ? `Loading... (Attempt ${retryCount}/3)` : 'Loading songs...'}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="bg-red-50 p-4 rounded-lg mb-4">
          <p className="text-red-600 mb-4">{error}</p>
          {onRetry && (
            <Button onClick={onRetry} variant="secondary">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (songs.length === 0) {
    return (
      <div className="text-center py-12">
        <Music2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No songs found</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {songs.map((song) => (
        <SongCard 
          key={song.id} 
          song={song}
          onClick={() => onSongClick(song)}
        />
      ))}
    </div>
  );
});