export interface ExportSettings {
  resolution: '720p' | '1080p' | '4k';
  frameRate: 24 | 30 | 60;
  includeAnnotations: boolean;
  includeMetadata: boolean;
  annotationStyle: 'overlay' | 'markers';
  selectedCategories: string[];
  selectedRegions: string[];
}

export interface ExportDimensions {
  width: number;
  height: number;
}

export interface ExportProgress {
  status: 'preparing' | 'processing' | 'complete' | 'error';
  progress: number;
  message?: string;
}