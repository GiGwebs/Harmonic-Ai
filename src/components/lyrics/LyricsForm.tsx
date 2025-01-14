import React from 'react';
import { Wand2, Info } from 'lucide-react';
import { Button } from '../common/Button';
import { GenreSelect } from './GenreSelect';
import { Tooltip } from '../common/Tooltip';
import { MUSIC_GENRES, SONG_STRUCTURES } from '../../constants/genres';
import type { GenerateOptions } from '../../types/lyrics';

interface LyricsFormProps {
  options: GenerateOptions;
  onOptionsChange: (options: GenerateOptions) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export function LyricsForm({
  options,
  onOptionsChange,
  onGenerate,
  isGenerating
}: LyricsFormProps) {
  return (
    <div className="space-y-6">
      {/* Primary Artist Section */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Primary Artist</h3>
        <GenreSelect
          label="Genre"
          value={options.genre}
          onChange={(genre) => onOptionsChange({ ...options, genre })}
          onSubGenreChange={(subGenre) => onOptionsChange({ ...options, subGenre })}
          selectedSubGenre={options.subGenre}
        />
      </div>

      {/* Featured Artist Section */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-sm font-medium text-gray-700">Featured Artist (Optional)</h3>
          <Tooltip content="Add a featured artist to create a collaboration-style song">
            <Info className="w-4 h-4 text-gray-400" />
          </Tooltip>
        </div>
        <GenreSelect
          label="Genre"
          value={options.featuredGenre || ''}
          onChange={(genre) => onOptionsChange({ 
            ...options, 
            featuredGenre: genre,
            featuredSubGenre: genre ? MUSIC_GENRES[genre].subGenres[0] : undefined
          })}
          onSubGenreChange={(subGenre) => onOptionsChange({ ...options, featuredSubGenre: subGenre })}
          selectedSubGenre={options.featuredSubGenre}
          allowEmpty
        />
      </div>

      <FormSelect
        label="Song Structure"
        value={options.structure}
        onChange={(structure) => onOptionsChange({ ...options, structure })}
        options={Object.entries(SONG_STRUCTURES).map(([value, label]) => ({
          value,
          label,
          description: getSongStructureDescription(value)
        }))}
      />

      <FormSelect
        label="Mood"
        value={options.mood}
        onChange={(mood) => onOptionsChange({ ...options, mood })}
        options={[
          { value: 'upbeat', label: 'Upbeat' },
          { value: 'melancholic', label: 'Melancholic' },
          { value: 'energetic', label: 'Energetic' },
          { value: 'romantic', label: 'Romantic' },
          { value: 'party', label: 'Party' },
          { value: 'chill', label: 'Chill' }
        ]}
      />

      <FormSelect
        label="Theme"
        value={options.theme}
        onChange={(theme) => onOptionsChange({ ...options, theme })}
        options={[
          { value: 'love', label: 'Love' },
          { value: 'life', label: 'Life' },
          { value: 'party', label: 'Party' },
          { value: 'motivation', label: 'Motivation' },
          { value: 'relationships', label: 'Relationships' },
          { value: 'success', label: 'Success' }
        ]}
      />

      <Button
        onClick={onGenerate}
        loading={isGenerating}
        className="w-full"
      >
        <Wand2 className="w-4 h-4 mr-2" />
        Generate Lyrics
      </Button>
    </div>
  );
}

interface FormSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{
    value: string;
    label: string;
    description?: string;
  }>;
}

function FormSelect({ label, value, onChange, options }: FormSelectProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500"
      >
        {options.map(({ value, label, description }) => (
          <option key={value} value={value} title={description}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}

function getSongStructureDescription(structure: string): string {
  const descriptions: Record<string, string> = {
    'verse-chorus': 'Common in pop and rock, perfect for high-energy songs',
    'verse-chorus-bridge': 'Popular across multiple genres, adds variety with a bridge',
    'verse-pre-chorus': 'Modern pop structure with tension-building pre-chorus',
    'intro-verse-chorus': 'Full song structure with intro and outro sections',
    'triple-verse': 'Story-focused structure with three verses',
    'hook-verse': 'Hip-hop style with emphasis on hooks',
    'modern-pop': 'Contemporary pop structure with post-chorus sections'
  };
  return descriptions[structure] || '';
}