import React, { useState } from 'react';
import { StickyNote, X } from 'lucide-react';
import { Button } from '../common/Button';

interface Annotation {
  id: string;
  text: string;
  position: { x: number; y: number };
  timestamp: number;
}

interface AnnotationLayerProps {
  annotations: Annotation[];
  onAddAnnotation: (annotation: Omit<Annotation, 'id'>) => void;
  onRemoveAnnotation: (id: string) => void;
  currentTime: number;
  width: number;
  height: number;
}

export function AnnotationLayer({
  annotations,
  onAddAnnotation,
  onRemoveAnnotation,
  currentTime,
  width,
  height
}: AnnotationLayerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newAnnotation, setNewAnnotation] = useState('');
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleClick = (e: React.MouseEvent) => {
    if (!isAdding) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setPosition({ x, y });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnotation.trim()) return;

    onAddAnnotation({
      text: newAnnotation,
      position,
      timestamp: currentTime
    });

    setNewAnnotation('');
    setIsAdding(false);
  };

  return (
    <div 
      className="relative"
      style={{ width, height }}
      onClick={handleClick}
    >
      <Button
        variant="secondary"
        onClick={() => setIsAdding(!isAdding)}
        className="absolute top-2 right-2 z-10"
      >
        <StickyNote className="w-4 h-4" />
        {isAdding ? 'Cancel' : 'Add Note'}
      </Button>

      {annotations.map(annotation => (
        <div
          key={annotation.id}
          className="absolute bg-yellow-100 p-2 rounded shadow-md"
          style={{
            left: annotation.position.x,
            top: annotation.position.y,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <button
            onClick={() => onRemoveAnnotation(annotation.id)}
            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
          >
            <X className="w-3 h-3" />
          </button>
          <p className="text-sm">{annotation.text}</p>
          <span className="text-xs text-gray-500">
            {formatTime(annotation.timestamp)}
          </span>
        </div>
      ))}

      {isAdding && position.x !== 0 && (
        <form
          onSubmit={handleSubmit}
          className="absolute bg-white p-2 rounded shadow-lg"
          style={{
            left: position.x,
            top: position.y,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <textarea
            value={newAnnotation}
            onChange={(e) => setNewAnnotation(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500"
            placeholder="Add your note..."
            autoFocus
          />
          <div className="flex justify-end gap-2 mt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsAdding(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      )}
    </div>
  );
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}