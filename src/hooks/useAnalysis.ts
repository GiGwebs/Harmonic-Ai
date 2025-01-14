import { useState } from 'react';
import type { SongAnalysis } from '../types';
import { analyzeSong } from '../utils/songAnalysis';
import { saveSongAnalysis, deleteSongAnalysis } from '../lib/db/songs';

export function useAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string>();
  const [analysisResults, setAnalysisResults] = useState<SongAnalysis>();
  const [savedId, setSavedId] = useState<string>();
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer>();

  const analyze = async (input: string, type: 'url' | 'file') => {
    try {
      setIsAnalyzing(true);
      setError(undefined);
      setSavedId(undefined);

      // Perform analysis
      const results = await analyzeSong(input, type);
      setAnalysisResults(results);

      // Save to database
      const id = await saveSongAnalysis(results);
      setSavedId(id);

      // Set audio buffer if available
      if (results.audioBuffer) {
        setAudioBuffer(results.audioBuffer);
      }

      return results;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to analyze song';
      setError(message);
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearAnalysis = () => {
    setAnalysisResults(undefined);
    setAudioBuffer(undefined);
    setSavedId(undefined);
    setError(undefined);
  };

  const deleteAnalysis = async () => {
    if (savedId) {
      await deleteSongAnalysis(savedId);
      clearAnalysis();
    }
  };

  return {
    analyze,
    clearAnalysis,
    deleteAnalysis,
    isAnalyzing,
    error,
    analysisResults,
    savedId,
    audioBuffer
  };
}