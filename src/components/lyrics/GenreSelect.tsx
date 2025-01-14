import React from 'react';
import { MUSIC_GENRES, type Genre } from '../../constants/genres';

interface GenreSelectProps {
  label: string;
  value: Genre | '';
  onChange: (genre: Genre) => void;
  onSubGenreChange?: (subGenre: string) => void;
  selectedSubGenre?: string;
  allowEmpty?: boolean;
}

export function GenreSelect({
  label,
  value,
  onChange,
  onSubGenreChange,
  selectedSubGenre,
  allowEmpty
}: GenreSelectProps) {
  return (
    <div className="space-y-2">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Genre)}
        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500"
      >
        {allowEmpty && <option value="">No Featured Artist</option>}
        {Object.entries(MUSIC_GENRES).map(([key, { label }]) => (
          <option key={key} value={key}>{label}</option>
        ))}
      </select>

      {value && onSubGenreChange && (
        <select
          value={selectedSubGenre}
          onChange={(e) => onSubGengeChange(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500"
        >
          {MUSIC_GENRES[value].subGenres.map(subGenre => (
            <option key={subGenre} value={subGenre}>{subGenre}</option>
          ))}
        </select>
      )}
    </div>
  );
}