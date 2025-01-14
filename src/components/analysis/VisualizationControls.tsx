import React from 'react';
import { Eye, EyeOff, Download, Settings } from 'lucide-react';
import { Button } from '../common/Button';
import { Tooltip } from '../common/Tooltip';
import type { VisualizationType } from '../../types';

interface VisualizationControlsProps {
  visible: Set<VisualizationType>;
  onToggle: (type: VisualizationType) => void;
  onExport: () => void;
  onSettings: () => void;
}

export function VisualizationControls({
  visible,
  onToggle,
  onExport,
  onSettings
}: VisualizationControlsProps) {
  const visualizations: Array<{ type: VisualizationType; label: string }> = [
    { type: 'timeline', label: 'Chord Timeline' },
    { type: 'pianoRoll', label: 'Piano Roll' },
    { type: 'spectrum', label: 'Frequency Spectrum' },
    { type: 'melody', label: 'Melody Graph' },
    { type: 'tempo', label: 'Tempo Changes' },
    { type: 'dynamic', label: 'Dynamic Range' }
  ];

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
      <div className="flex-1 flex flex-wrap gap-2">
        {visualizations.map(({ type, label }) => (
          <Tooltip key={type} content={visible.has(type) ? 'Hide' : 'Show'}>
            <button
              onClick={() => onToggle(type)}
              className={`p-2 rounded-lg transition-colors ${
                visible.has(type)
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-400 hover:bg-gray-100'
              }`}
            >
              {visible.has(type) ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
              <span className="ml-2 text-sm">{label}</span>
            </button>
          </Tooltip>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Button variant="secondary" onClick={onExport}>
          <Download className="w-4 h-4" />
          Export
        </Button>
        <Button variant="secondary" onClick={onSettings}>
          <Settings className="w-4 h-4" />
          Settings
        </Button>
      </div>
    </div>
  );
}