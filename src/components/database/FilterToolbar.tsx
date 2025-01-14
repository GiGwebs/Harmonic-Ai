import React from 'react';
import { SearchBar } from './SearchBar';
import { FilterBar } from './FilterBar';
import { SortSelect } from './SortSelect';
import type { SortOption } from './SortSelect';

interface FilterToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedGenre: string;
  onGenreChange: (genre: string) => void;
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
}

export function FilterToolbar({
  searchQuery,
  onSearchChange,
  selectedGenre,
  onGenreChange,
  sortOption,
  onSortChange
}: FilterToolbarProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white p-4 rounded-lg shadow-sm">
      <div className="flex flex-col sm:flex-row gap-4">
        <SearchBar value={searchQuery} onChange={onSearchChange} />
        <FilterBar 
          selectedGenre={selectedGenre}
          onGenreChange={onGenreChange}
        />
      </div>
      <SortSelect value={sortOption} onChange={onSortChange} />
    </div>
  );
}