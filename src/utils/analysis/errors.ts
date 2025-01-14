export class AudioAnalysisError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message);
    this.name = 'AudioAnalysisError';
  }
}