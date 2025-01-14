import React from 'react';
import { Button } from '../common/Button';
import type { ExportSettings } from '../../utils/export/types';

interface ExportPreset {
  id: string;
  name: string;
  settings: Partial<ExportSettings>;
  description: string;
}

const PRESETS: ExportPreset[] = [
  {
    id: 'high-quality',
    name: 'High Quality',
    settings: {
      resolution: '4k',
      frameRate: 60,
      includeAnnotations: true,
      includeMetadata: true,
      annotationStyle: 'overlay'
    },
    description: 'Maximum quality export with all features enabled'
  },
  {
    id: 'analysis-only',
    name: 'Analysis Only',
    settings: {
      resolution: '1080p',
      frameRate: 30,
      includeAnnotations: false,
      includeMetadata: true,
      annotationStyle: 'markers'
    },
    description: 'Export analysis data without annotations'
  }
];

interface ExportPresetsProps {
  onSelectPreset: (settings: Partial<ExportSettings>) => void;
}

export function ExportPresets({ onSelectPreset }: ExportPresetsProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-sm text-gray-700">Export Presets</h3>
      <div className="grid gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onSelectPreset(preset.settings)}
            className="text-left p-3 rounded-lg border border-gray-200 hover:border-purple-500 transition-colors"
          >
            <div className="font-medium">{preset.name}</div>
            <div className="text-sm text-gray-600">{preset.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}