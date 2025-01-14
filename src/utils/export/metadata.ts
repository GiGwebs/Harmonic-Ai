import type { PlaybackRegion } from '../../types/playback';
import type { Annotation } from '../../types/annotation';

interface ExportMetadata {
  annotations: Annotation[];
  regions: PlaybackRegion[];
  analysis: Record<string, unknown>;
}

export function createExportMetadata(
  annotations: Annotation[],
  regions: PlaybackRegion[],
  analysis: Record<string, unknown>
): ExportMetadata {
  return {
    annotations,
    regions,
    analysis
  };
}

export function embedMetadata(blob: Blob, metadata: ExportMetadata): Promise<Blob> {
  // Implementation for embedding metadata into audio/video files
  // This would use Web Audio API or appropriate libraries
  return Promise.resolve(blob);
}