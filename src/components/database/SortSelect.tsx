import React from 'react';

export type SortOption = {
  field: 'title' | 'artist' | 'tempo';
  direction: 'asc' | 'desc';
};

interface SortSelectProps {
  value: SortOption;
  onChange: (option: SortOption) => void;
}

export function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <select
      value={`${value.field}-${value.direction}`}
      onChange={(e) => {
        const [field, direction] = e.target.value.split('-') as [SortOption['field'], SortOption['direction']];
        onChange({ field, direction });
      }}
      className="px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
    >
      <option value="title-asc">Title (A-Z)</option>
      <option value="title-desc">Title (Z-A)</option>
      <option value="artist-asc">Artist (A-Z)</option>
      <option value="artist-desc">Artist (Z-A)</option>
      <option value="tempo-asc">Tempo (Low to High)</option>
      <option value="tempo-desc">Tempo (High to Low)</option>
    </select>
  );
}