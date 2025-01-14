import { ExportFormat } from '../../components/analysis/VisualizationExport';
import { exportTimelineImage } from '../export';
import { exportToMidi } from './midi';
import { exportToCsv } from './csv';

interface VisualizationRef {
  element: HTMLElement;
  type: string;
}

export async function exportVisualizations(
  format: ExportFormat,
  visualizations: VisualizationRef[],
  analysisData: any
): Promise<void> {
  try {
    switch (format) {
      case 'png':
      case 'svg':
        await exportImages(visualizations, format);
        break;
      case 'gif':
        await exportAnimatedGif(visualizations);
        break;
      case 'json':
        exportJson(analysisData);
        break;
      case 'csv':
        exportToCsv(analysisData);
        break;
      case 'midi':
        if (analysisData.notes) {
          exportToMidi(analysisData.notes);
        }
        break;
    }
  } catch (error) {
    console.error('Export failed:', error);
    throw new Error(`Failed to export in ${format} format`);
  }
}

async function exportImages(
  visualizations: VisualizationRef[],
  format: 'png' | 'svg'
): Promise<void> {
  // If multiple visualizations, create a zip file
  if (visualizations.length > 1) {
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    for (const viz of visualizations) {
      const canvas = await html2canvas(viz.element);
      const blob = await new Promise<Blob>(resolve => {
        canvas.toBlob(blob => resolve(blob!), `image/${format}`);
      });
      zip.file(`${viz.type}.${format}`, blob);
    }

    const content = await zip.generateAsync({ type: 'blob' });
    downloadBlob(content, `visualizations.zip`);
  } else if (visualizations.length === 1) {
    await exportTimelineImage(visualizations[0].element);
  }
}

async function exportAnimatedGif(visualizations: VisualizationRef[]): Promise<void> {
  // Implementation would require a GIF encoding library
  throw new Error('GIF export not yet implemented');
}

function exportJson(data: any): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json'
  });
  downloadBlob(blob, 'analysis.json');
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}