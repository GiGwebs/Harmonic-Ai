import React, { useState } from 'react';
import { Download, Settings, Image, FileSpreadsheet, Music } from 'lucide-react';
import { Button } from '../common/Button';
import type { ExportFormat } from '../../types';

interface ExportSettings {
  resolution: '720p' | '1080p' | '4k';
  frameRate: 24 | 30 | 60;
  includeAnnotations: boolean;
  includeMetadata: boolean;
}

interface AdvancedExportPanelProps {
  onExport: (format: ExportFormat, settings: ExportSettings) => Promise<void>;
  isExporting: boolean;
  supportedFormats: ExportFormat[];
}

export function AdvancedExportPanel({
  onExport,
  isExporting,
  supportedFormats
}: AdvancedExportPanelProps) {
  const [settings, setSettings] = useState<ExportSettings>({
    resolution: '1080p',
    frameRate: 30,
    includeAnnotations: true,
    includeMetadata: true
  });

  const resolutionMap = {
    '720p': { width: 1280, height: 720 },
    '1080p': { width: 1920, height: 1080 },
    '4k': { width: 3840, height: 2160 }
  };

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Export Settings</h3>
        <Settings className="w-4 h-4 text-gray-400" />
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Resolution
          </label>
          <select
            value={settings.resolution}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              resolution: e.target.value as ExportSettings['resolution']
            }))}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500"
          >
            <option value="720p">720p (1280×720)</option>
            <option value="1080p">1080p (1920×1080)</option>
            <option value="4k">4K (3840×2160)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Frame Rate
          </label>
          <select
            value={settings.frameRate}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              frameRate: Number(e.target.value) as ExportSettings['frameRate']
            }))}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500"
          >
            <option value="24">24 FPS</option>
            <option value="30">30 FPS</option>
            <option value="60">60 FPS</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.includeAnnotations}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                includeAnnotations: e.target.checked
              }))}
              className="rounded text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm">Include Annotations</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.includeMetadata}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                includeMetadata: e.target.checked
              }))}
              className="rounded text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm">Include Metadata</span>
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          {supportedFormats.includes('png') && (
            <Button
              variant="secondary"
              onClick={() => onExport('png', settings)}
              disabled={isExporting}
              className="flex items-center gap-2"
            >
              <Image className="w-4 h-4" />
              PNG
            </Button>
          )}

          {supportedFormats.includes('csv') && (
            <Button
              variant="secondary"
              onClick={() => onExport('csv', settings)}
              disabled={isExporting}
              className="flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              CSV
            </Button>
          )}

          {supportedFormats.includes('midi') && (
            <Button
              variant="secondary"
              onClick={() => onExport('midi', settings)}
              disabled={isExporting}
              className="flex items-center gap-2"
            >
              <Music className="w-4 h-4" />
              MIDI
            </Button>
          )}
        </div>

        {isExporting && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="animate-spin w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full" />
            Preparing export...
          </div>
        )}
      </div>
    </div>
  );
}