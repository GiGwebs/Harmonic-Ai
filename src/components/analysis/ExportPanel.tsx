import React from 'react';
import { Download, FileSpreadsheet, Music, Share2 } from 'lucide-react';
import { Button } from '../common/Button';
import { exportTimelineImage, exportAnalysisData } from '../../utils/export';
import { exportToCsv } from '../../utils/export/csv';
import { exportToMidi } from '../../utils/export/midi';
import type { SongAnalysis } from '../../types';

interface ExportPanelProps {
  analysis: SongAnalysis;
  timelineRef: React.RefObject<HTMLDivElement>;
  notes?: Array<{ pitch: number; startTime: number; duration: number; velocity: number; }>;
}

export function ExportPanel({ analysis, timelineRef, notes }: ExportPanelProps) {
  const handleImageExport = async () => {
    if (!timelineRef.current) return;
    await exportTimelineImage(timelineRef.current);
  };

  const handleDataExport = () => {
    exportAnalysisData(analysis);
  };

  const handleCsvExport = () => {
    exportToCsv(analysis);
  };

  const handleMidiExport = () => {
    if (notes) {
      exportToMidi(notes);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="secondary"
        onClick={handleImageExport}
        className="flex items-center gap-2"
      >
        <Download className="w-4 h-4" />
        PNG
      </Button>

      <Button
        variant="secondary"
        onClick={handleDataExport}
        className="flex items-center gap-2"
      >
        <Share2 className="w-4 h-4" />
        JSON
      </Button>

      <Button
        variant="secondary"
        onClick={handleCsvExport}
        className="flex items-center gap-2"
      >
        <FileSpreadsheet className="w-4 h-4" />
        CSV
      </Button>

      {notes && (
        <Button
          variant="secondary"
          onClick={handleMidiExport}
          className="flex items-center gap-2"
        >
          <Music className="w-4 h-4" />
          MIDI
        </Button>
      )}
    </div>
  );
}