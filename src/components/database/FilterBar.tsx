import React from 'react';
import type { Genre } from '../../types';

interface FilterBarProps {
  selectedGenre: Genre | '';
  onGenreChange: (genre: Genre | '') => void;
}

const genres: Genre[] = ['afrobeats', 'pop', '90s-hiphop-rnb', 'reggae-dancehall'];

export function FilterBar({ selectedGenre, onGenreChange }: FilterBarProps) {
  return (
    <div className="flex items-center space-x-4">
      <select
        value={selectedGenre}
        onChange={(e) => onGenreChange(e.target.value as Genre | '')}
        className="px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
      >
        <option value="">All Genres</option>
        {genres.map((genre) => (
          <option key={genre} value={genre}>
            {genre.split('-').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ')}
          </option>
        ))}
      </select>
    </div>
  );
}