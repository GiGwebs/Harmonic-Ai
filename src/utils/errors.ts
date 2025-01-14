/**
 * Custom error class for audio analysis errors
 */
export class AudioAnalysisError extends Error {
  constructor(message: string, cause?: Error) {
    super(message);
    this.name = 'AudioAnalysisError';
    if (cause) {
      this.cause = cause;
    }
  }
}
