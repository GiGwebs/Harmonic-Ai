import React from 'react';
import { X, Tag, Calendar, Music } from 'lucide-react';
import type { GeneratedLyrics } from '../../types/lyrics';
import { Button } from '../common/Button';

interface LyricsDetailsProps {
  lyrics: GeneratedLyrics & { id: string };
  onClose: () => void;
}

export function LyricsDetails({ lyrics, onClose }: LyricsDetailsProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">{lyrics.title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex flex-wrap gap-2">
            <Tag className="w-4 h-4 text-gray-400" />
            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
              {lyrics.options.genre}
            </span>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
              {lyrics.options.mood}
            </span>
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
              {lyrics.options.theme}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>Created on {new Date(lyrics.createdAt).toLocaleDateString()}</span>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap">
            {lyrics.content}
          </div>

          <div className="flex items-center gap-2">
            <Music className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              Structure: {lyrics.options.structure}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}