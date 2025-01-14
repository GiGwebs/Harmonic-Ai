interface ExportTask {
  id: string;
  type: 'audio' | 'pdf' | 'image';
  status: 'pending' | 'processing' | 'complete' | 'error';
  error?: string;
  progress: number;
}

export class ExportQueue {
  private tasks: Map<string, ExportTask> = new Map();
  private listeners: Set<(tasks: ExportTask[]) => void> = new Set();

  addTask(id: string, type: ExportTask['type']): void {
    this.tasks.set(id, {
      id,
      type,
      status: 'pending',
      progress: 0
    });
    this.notifyListeners();
  }

  updateTask(id: string, updates: Partial<ExportTask>): void {
    const task = this.tasks.get(id);
    if (task) {
      this.tasks.set(id, { ...task, ...updates });
      this.notifyListeners();
    }
  }

  subscribe(listener: (tasks: ExportTask[]) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    const tasks = Array.from(this.tasks.values());
    this.listeners.forEach(listener => listener(tasks));
  }
}