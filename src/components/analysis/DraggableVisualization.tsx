import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { GripVertical } from 'lucide-react';
import type { VisualizationType } from '../../types';

interface DraggableVisualizationProps {
  type: VisualizationType;
  index: number;
  moveVisualization: (from: number, to: number) => void;
  children: React.ReactNode;
}

export function DraggableVisualization({
  type,
  index,
  moveVisualization,
  children
}: DraggableVisualizationProps) {
  const [{ isDragging }, drag, dragPreview] = useDrag({
    type: 'visualization',
    item: { type, index },
    collect: monitor => ({
      isDragging: monitor.isDragging()
    })
  });

  const [{ isOver }, drop] = useDrop({
    accept: 'visualization',
    hover(item: { type: VisualizationType; index: number }) {
      if (item.index === index) return;
      moveVisualization(item.index, index);
      item.index = index;
    },
    collect: monitor => ({
      isOver: monitor.isOver()
    })
  });

  return (
    <div
      ref={node => drop(dragPreview(node))}
      className={`relative ${isDragging ? 'opacity-50' : ''} ${
        isOver ? 'border-t-2 border-purple-500' : ''
      }`}
    >
      <div
        ref={drag}
        className="absolute left-2 top-1/2 -translate-y-1/2 cursor-move p-2 hover:bg-gray-100 rounded-lg"
      >
        <GripVertical className="w-4 h-4 text-gray-400" />
      </div>
      <div className="pl-12">{children}</div>
    </div>
  );
}