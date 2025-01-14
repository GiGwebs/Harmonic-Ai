import React from 'react';
import { ExternalLink, ArrowUpRight } from 'lucide-react';
import type { Song } from '../../types';

interface SongCardProps {
  song: Song;
  onClick: () => void;
}

export const SongCard = React.memo(function SongCard({ song, onClick }: SongCardProps) {
  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return 'No date available';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };

  const formattedDate = formatDate(song.createdAt);

  console.log('SongCard rendering:', {
    title: song.title,
    createdAt: song.createdAt,
    formattedDate,
    genre: song.genre
  });

  return (
    <div 
      className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-lg group-hover:text-purple-600 transition-colors">
            {song.title}
            <ArrowUpRight className="w-4 h-4 inline ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
          </h3>
          <p className="text-gray-600">{song.artist}</p>
          <p className="text-sm text-gray-500">{formattedDate}</p>
        </div>
        {song.analysis?.musicalElements.key && (
          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm">
            {song.analysis.musicalElements.key}
          </span>
        )}
      </div>
      
      <div className="space-y-2 text-sm text-gray-600">
        {song.genre.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {song.genre.map((g) => (
              <span key={g} className="px-2 py-1 bg-gray-100 rounded">
                {g}
              </span>
            ))}
          </div>
        )}
        
        {song.analysis?.musicalElements.tempo && (
          <p>Tempo: {song.analysis.musicalElements.tempo} BPM</p>
        )}
      </div>

      {song.sourceUrl && (
        <a
          href={song.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center text-sm text-purple-600 hover:text-purple-700"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink className="w-4 h-4 mr-1" />
          View Source
        </a>
      )}
    </div>
  );
});