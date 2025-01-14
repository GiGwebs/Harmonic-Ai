import type { AnnotationCategory } from '../types/annotation';

export const ANNOTATION_CATEGORIES: Record<AnnotationCategory, {
  label: string;
  color: string;
}> = {
  chord: {
    label: 'Chord Changes',
    color: '#8b5cf6' // purple-600
  },
  melody: {
    label: 'Melody',
    color: '#2563eb' // blue-600
  },
  tempo: {
    label: 'Tempo',
    color: '#16a34a' // green-600
  },
  general: {
    label: 'General',
    color: '#f59e0b' // amber-600
  }
};