import type { ExportSettings, ExportProgress } from './types';
import { getExportDimensions } from './resolution';
import { createExportMetadata } from './metadata';

export async function processBatchExport(
  items: { id: string; element: HTMLElement }[],
  settings: ExportSettings,
  onProgress?: (progress: ExportProgress) => void
): Promise<Blob[]> {
  const results: Blob[] = [];
  const total = items.length;

  for (let i = 0; i < items.length; i++) {
    try {
      onProgress?.({
        status: 'processing',
        progress: (i / total) * 100,
        message: `Processing item ${i + 1} of ${total}`
      });

      const { element } = items[i];
      const dimensions = getExportDimensions(settings.resolution);
      const blob = await processExportItem(element, dimensions);
      results.push(blob);
    } catch (error) {
      onProgress?.({
        status: 'error',
        progress: (i / total) * 100,
        message: `Error processing item ${i + 1}`
      });
      throw error;
    }
  }

  onProgress?.({
    status: 'complete',
    progress: 100,
    message: 'Export complete'
  });

  return results;
}

async function processExportItem(
  element: HTMLElement,
  dimensions: { width: number; height: number }
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = dimensions.width;
  canvas.height = dimensions.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');

  // Draw element to canvas
  // In production, use a proper HTML-to-canvas library
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob!);
    });
  });
}