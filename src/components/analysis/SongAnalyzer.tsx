import React, { useState } from 'react';
import { Music, Upload, Link as LinkIcon } from 'lucide-react';
import { InputField } from '../common/InputField';
import { Button } from '../common/Button';

interface SongAnalyzerProps {
  onAnalyze: (input: string, type: 'url' | 'file') => Promise<void>;
  isAnalyzing: boolean;
  error?: string;
}

export function SongAnalyzer({ onAnalyze, isAnalyzing, error }: SongAnalyzerProps) {
  const [url, setUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'url' | 'file'>('url');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'url' && url) {
      onAnalyze(url, 'url');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('url')}
          className={`flex items-center px-4 py-2 rounded-lg ${
            activeTab === 'url'
              ? 'bg-purple-100 text-purple-700'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <LinkIcon className="w-4 h-4 mr-2" />
          URL
        </button>
        <button
          onClick={() => setActiveTab('file')}
          className={`flex items-center px-4 py-2 rounded-lg ${
            activeTab === 'file'
              ? 'bg-purple-100 text-purple-700'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload File
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {activeTab === 'url' ? (
          <div className="space-y-4">
            <InputField
              type="url"
              placeholder="Paste YouTube or Spotify URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              icon={<Music className="w-5 h-5 text-gray-400" />}
              disabled={isAnalyzing}
            />
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              type="file"
              accept="audio/mp3,audio/wav"
              className="hidden"
              id="file-upload"
              disabled={isAnalyzing}
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              <Upload className="w-12 h-12 text-gray-400 mb-4" />
              <span className="text-sm text-gray-600">
                Drop your audio file here or click to upload
              </span>
              <span className="text-xs text-gray-500 mt-2">
                Supports MP3 and WAV (max 10MB)
              </span>
            </label>
          </div>
        )}

        {error && (
          <div className="mt-4 text-red-600 text-sm">{error}</div>
        )}

        <Button
          type="submit"
          disabled={isAnalyzing || (!url && activeTab === 'url')}
          loading={isAnalyzing}
          className="mt-6 w-full"
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze Song'}
        </Button>
      </form>
    </div>
  );
}