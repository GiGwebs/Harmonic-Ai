import React, { useState } from 'react';
import { Keyboard } from 'lucide-react';
import { Button } from '../common/Button';

export function KeyboardShortcuts() {
  const [isVisible, setIsVisible] = useState(false);

  const shortcuts = [
    { key: 'Space', description: 'Play/Pause' },
    { key: '←/→', description: 'Seek 5s' },
    { key: 'Shift + ←/→', description: 'Seek 10s' },
    { key: 'Shift + ↑/↓', description: 'Adjust Speed' },
    { key: 'Tab', description: 'Switch Visualization' },
    { key: 'Esc', description: 'Reset/Close' },
    { key: 'R', description: 'Add Region' },
    { key: 'Shift + R', description: 'Remove Region' },
    { key: 'A', description: 'Add Annotation' },
    { key: 'Shift + A', description: 'Edit Last Annotation' }
  ];

  return (
    <div className="relative">
      <Button
        variant="secondary"
        onClick={() => setIsVisible(!isVisible)}
        className="flex items-center gap-2"
      >
        <Keyboard className="w-4 h-4" />
        Shortcuts
      </Button>

      {isVisible && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg p-4 z-50">
          <div className="space-y-2">
            {shortcuts.map(({ key, description }) => (
              <div key={key} className="flex justify-between text-sm">
                <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-700">
                  {key}
                </kbd>
                <span className="text-gray-600">{description}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}