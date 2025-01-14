import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Loader } from 'lucide-react';
import type { ExportTask } from '../../utils/export/batch/queue';
import { Button } from '../common/Button';

interface BatchExportPanelProps {
  tasks: ExportTask[];
  onCancel?: (taskId: string) => void;
}

export function BatchExportPanel({ tasks, onCancel }: BatchExportPanelProps) {
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Export Progress</h3>
      
      <div className="space-y-2">
        {tasks.map(task => (
          <div
            key={task.id}
            className="p-3 rounded-lg border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {task.status === 'processing' && (
                  <Loader className="w-4 h-4 animate-spin text-purple-600" />
                )}
                {task.status === 'complete' && (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                )}
                {task.status === 'error' && (
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                )}
                <span className="font-medium">
                  {task.type.charAt(0).toUpperCase() + task.type.slice(1)} Export
                </span>
              </div>
              
              {task.status === 'processing' && onCancel && (
                <Button
                  variant="secondary"
                  onClick={() => onCancel(task.id)}
                  className="text-sm"
                >
                  Cancel
                </Button>
              )}
            </div>

            {task.status === 'processing' && (
              <div className="mt-2">
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-600 transition-all duration-300"
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
              </div>
            )}

            {task.error && (
              <div className="mt-2 text-sm text-red-600">
                {task.error}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}