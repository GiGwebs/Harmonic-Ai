import React from 'react';
import { Save, Loader2 } from 'lucide-react';
import { Button } from '../common/Button';

interface LyricsPreviewProps {
  title: string;
  lyrics: string;
  onSave: () => void;
  isGenerating?: boolean;
}

export function LyricsPreview({ title, lyrics, onSave, isGenerating = false }: LyricsPreviewProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <div className="relative">
        <textarea
          value={lyrics}
          readOnly
          className="w-full h-[400px] p-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 font-mono text-sm resize-none"
          placeholder={isGenerating ? "Generating lyrics..." : "Generated lyrics will appear here..."}
        />
        {lyrics && !isGenerating && (
          <div className="absolute bottom-4 right-4 space-x-2">
            <Button variant="secondary" onClick={onSave}>
              <Save className="w-4 h-4 mr-2" />
              Save to Database
            </Button>
          </div>
        )}
        {isGenerating && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        )}
      </div>
    </div>
  );
}