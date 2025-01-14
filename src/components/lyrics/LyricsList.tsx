import React, { memo } from 'react';
import { FileText, Calendar, RefreshCw } from 'lucide-react';
import { EmptyState } from './EmptyState';
import { Button } from '../ui/Button';
import type { GeneratedLyrics } from '../../types/lyrics';

interface LyricsListProps {
  lyrics: Array<GeneratedLyrics & { id: string }>;
  isLoading: boolean;
  error?: string;
  onSelect: (lyrics: GeneratedLyrics & { id: string }) => void;
  onRetry?: () => void;
  retryCount?: number;
}

const LyricsCard = memo(function LyricsCard({ 
  item, 
  onClick 
}: { 
  item: GeneratedLyrics & { id: string }; 
  onClick: () => void;
}) {
  return (
    <div
      className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer group"
      onClick={onClick}
    >
      <h3 className="font-semibold text-lg mb-2 group-hover:text-purple-600 transition-colors">
        {item.title}
      </h3>
      
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
            {item.options.genre}
          </span>
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
            {item.options.mood}
          </span>
        </div>
        
        <div className="flex items-center gap-1 text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>{new Date(item.createdAt).toLocaleDateString()}</span>
        </div>
        
        <p className="line-clamp-3 text-gray-600">
          {item.content.split('\n')[0]}...
        </p>
      </div>
    </div>
  );
});

export const LyricsList = memo(function LyricsList({ 
  lyrics, 
  isLoading, 
  error,
  onSelect,
  onRetry,
  retryCount = 0
}: LyricsListProps) {
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-600">
          {retryCount > 0 ? `Loading lyrics... (Attempt ${retryCount}/3)` : 'Loading lyrics...'}
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

  if (lyrics.length === 0) {
    return <EmptyState type="lyrics" />;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {lyrics.map((item) => (
        <LyricsCard
          key={item.id}
          item={item}
          onClick={() => onSelect(item)}
        />
      ))}
    </div>
  );
});