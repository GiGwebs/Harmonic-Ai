import { useState, useCallback } from 'react';
import type { VisualizationType } from '../types';

interface LayoutState {
  order: VisualizationType[];
  visible: Set<VisualizationType>;
}

export function useVisualizationLayout() {
  const [layout, setLayout] = useState<LayoutState>({
    order: ['timeline', 'pianoRoll', 'spectrum', 'melody', 'tempo', 'dynamic'],
    visible: new Set(['timeline', 'pianoRoll'])
  });

  const moveVisualization = useCallback((from: number, to: number) => {
    setLayout(prev => {
      const newOrder = [...prev.order];
      const [moved] = newOrder.splice(from, 1);
      newOrder.splice(to, 0, moved);
      return { ...prev, order: newOrder };
    });
  }, []);

  const toggleVisualization = useCallback((type: VisualizationType) => {
    setLayout(prev => {
      const newVisible = new Set(prev.visible);
      if (newVisible.has(type)) {
        newVisible.delete(type);
      } else {
        newVisible.add(type);
      }
      return { ...prev, visible: newVisible };
    });
  }, []);

  return {
    layout,
    moveVisualization,
    toggleVisualization
  };
}