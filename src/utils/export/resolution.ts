import type { ExportDimensions } from './types';

export const RESOLUTION_PRESETS: Record<string, ExportDimensions> = {
  '720p': { width: 1280, height: 720 },
  '1080p': { width: 1920, height: 1080 },
  '4k': { width: 3840, height: 2160 }
};

export function getExportDimensions(resolution: string): ExportDimensions {
  return RESOLUTION_PRESETS[resolution] || RESOLUTION_PRESETS['1080p'];
}