import React from 'react';
import { Save } from 'lucide-react';
import { Button } from '../common/Button';

interface LyricsPreviewProps {
  lyrics: string;
  onSave: () => void;
}

export function LyricsPreview({ lyrics, onSave }: LyricsPreviewProps) {
  return (
    <div className="relative">
      <textarea
        value={lyrics}
        readOnly
        className="w-full h-[400px] p-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 font-mono text-sm resize-none"
        placeholder="Generated lyrics will appear here..."
      />
      {lyrics && (
        <div className="absolute bottom-4 right-4 space-x-2">
          <Button variant="secondary" onClick={onSave}>
            <Save className="w-4 h-4 mr-2" />
            Save to Database
          </Button>
        </div>
      )}
    </div>
  );
}