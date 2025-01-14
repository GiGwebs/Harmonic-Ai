import React from 'react';
import { Search } from 'lucide-react';
import { InputField } from '../common/InputField';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="w-full max-w-md">
      <InputField
        type="search"
        placeholder="Search by title or artist..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        icon={<Search className="w-5 h-5 text-gray-400" />}
      />
    </div>
  );
}