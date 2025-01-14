import React from 'react';
import { Music2, FileText } from 'lucide-react';

interface TabHeaderProps {
  activeTab: 'songs' | 'lyrics';
  onTabChange: (tab: 'songs' | 'lyrics') => void;
  songCount: number;
  lyricsCount: number;
}

export function TabHeader({ 
  activeTab, 
  onTabChange,
  songCount,
  lyricsCount
}: TabHeaderProps) {
  return (
    <div className="flex space-x-4 mb-6">
      <button
        onClick={() => onTabChange('songs')}
        className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
          activeTab === 'songs'
            ? 'bg-purple-600 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        <Music2 className="w-4 h-4 mr-2" />
        Analyzed Songs
        <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-opacity-20 bg-white">
          {songCount}
        </span>
      </button>
      <button
        onClick={() => onTabChange('lyrics')}
        className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
          activeTab === 'lyrics'
            ? 'bg-purple-600 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        <FileText className="w-4 h-4 mr-2" />
        Generated Lyrics
        <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-opacity-20 bg-white">
          {lyricsCount}
        </span>
      </button>
    </div>
  );
}