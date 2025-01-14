export type AnnotationCategory = 'chord' | 'melody' | 'tempo' | 'general';

export interface Annotation {
  id: string;
  text: string;
  position: { x: number; y: number };
  timestamp: number;
  category: AnnotationCategory;
  color: string;
}