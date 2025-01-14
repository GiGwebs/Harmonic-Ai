import { useState, useCallback } from 'react';

interface Annotation {
  id: string;
  text: string;
  position: { x: number; y: number };
  timestamp: number;
}

export function useAnnotations() {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);

  const addAnnotation = useCallback((annotation: Omit<Annotation, 'id'>) => {
    setAnnotations(prev => [
      ...prev,
      { ...annotation, id: Math.random().toString(36).slice(2) }
    ]);
  }, []);

  const removeAnnotation = useCallback((id: string) => {
    setAnnotations(prev => prev.filter(a => a.id !== id));
  }, []);

  const clearAnnotations = useCallback(() => {
    setAnnotations([]);
  }, []);

  return {
    annotations,
    addAnnotation,
    removeAnnotation,
    clearAnnotations
  };
}