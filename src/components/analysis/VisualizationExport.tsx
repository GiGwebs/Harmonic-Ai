import React, { useState } from 'react';
import { Download, FileSpreadsheet, Music, Share2, Image } from 'lucide-react';
import { Button } from '../common/Button';
import { Tooltip } from '../common/Tooltip';

interface VisualizationExportProps {
  onExport: (format: ExportFormat, visualizations: string[]) => Promise<void>;
  availableVisualizations: string[];
  isExporting?: boolean;
}

export type ExportFormat = 'png' | 'svg' | 'gif' | 'json' | 'csv' | 'midi';

export function VisualizationExport({ 
  onExport, 
  availableVisualizations,
  isExporting 
}: VisualizationExportProps) {
  const [selectedVisualizations, setSelectedVisualizations] = useState<Set<string>>(
    new Set(availableVisualizations)
  );

  const handleVisualizationToggle = (visualization: string) => {
    setSelectedVisualizations(prev => {
      const next = new Set(prev);
      if (next.has(visualization)) {
        next.delete(visualization);
      } else {
        next.add(visualization);
      }
      return next;
    });
  };

  const handleExport = async (format: ExportFormat) => {
    await onExport(format, Array.from(selectedVisualizations));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Export Options</h3>
        <Tooltip content="Select visualizations to export">
          <Image className="w-4 h-4 text-gray-400" />
        </Tooltip>
      </div>

      <div className="space-y-2">
        {availableVisualizations.map(viz => (
          <label key={viz} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedVisualizations.has(viz)}
              onChange={() => handleVisualizationToggle(viz)}
              className="rounded text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm">{viz}</span>
          </label>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="secondary"
          onClick={() => handleExport('png')}
          disabled={isExporting || selectedVisualizations.size === 0}
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          PNG
        </Button>

        <Button
          variant="secondary"
          onClick={() => handleExport('json')}
          disabled={isExporting}
          className="flex items-center gap-2"
        >
          <Share2 className="w-4 h-4" />
          JSON
        </Button>

        <Button
          variant="secondary"
          onClick={() => handleExport('csv')}
          disabled={isExporting}
          className="flex items-center gap-2"
        >
          <FileSpreadsheet className="w-4 h-4" />
          CSV
        </Button>

        <Button
          variant="secondary"
          onClick={() => handleExport('midi')}
          disabled={isExporting}
          className="flex items-center gap-2"
        >
          <Music className="w-4 h-4" />
          MIDI
        </Button>
      </div>

      {isExporting && (
        <div className="text-sm text-gray-600">
          Preparing export, please wait...
        </div>
      )}
    </div>
  );
}