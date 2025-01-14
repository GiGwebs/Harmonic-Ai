import React, { useState, useRef } from 'react';
import { saveSongAnalysisFirebase } from '../lib/db/songs';
import { toast } from 'react-hot-toast';
import type { SongAnalysis, Section, Preferences } from '../types';
import { SentimentAnalysis } from '../components/analysis/SentimentAnalysis';
import { StructureAnalysis } from '../components/analysis/StructureAnalysis';
import { motion, AnimatePresence } from 'framer-motion';

// Default preferences for StructureAnalysis
const defaultPreferences: Preferences = {
  advancedFilters: {
    sectionTypes: [],
    complexity: [],
    mood: [],
    themes: [],
  },
  filterPresets: [],
  activePresetId: null,
  snapScrollingEnabled: true,
};

// Supported file types
const SUPPORTED_AUDIO_TYPES = ['audio/mpeg', 'audio/wav', 'audio/ogg'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

function AnalyzePage() {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResults, setAnalysisResults] = useState<SongAnalysis | null>(null);
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);
  const [currentStep, setCurrentStep] = useState<'input' | 'analyzing' | 'results'>('input');
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // URL validation
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // File validation
  const validateFile = (file: File): string | null => {
    if (!SUPPORTED_AUDIO_TYPES.includes(file.type)) {
      return 'Please upload a supported audio file (MP3, WAV, OGG)';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 50MB';
    }
    return null;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setUrl(`file:${file.name}`);
    setError(null);
  };

  const handleAnalyze = async () => {
    // Input validation
    if (!url) {
      setError('Please enter a URL or upload a file');
      return;
    }

    if (!url.startsWith('file:') && !isValidUrl(url)) {
      setError('Please enter a valid URL');
      return;
    }

    try {
      setIsAnalyzing(true);
      setError(null);
      setCurrentStep('analyzing');
      
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      clearInterval(progressInterval);
      setProgress(100);

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.details || responseData.error || 'Failed to analyze song');
      }

      setAnalysisResults(responseData.data);
      setCurrentStep('results');
      toast.success('Analysis completed successfully!');
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setCurrentStep('input');
      toast.error('Failed to analyze song');
    } finally {
      setIsAnalyzing(false);
      setProgress(0);
    }
  };

  const resetAnalysis = () => {
    setUrl('');
    setError(null);
    setAnalysisResults(null);
    setCurrentStep('input');
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex justify-between items-center relative">
          {['Input', 'Analysis', 'Results'].map((step, index) => {
            const stepValue = ['input', 'analyzing', 'results'][index];
            const isActive = currentStep === stepValue;
            const isPast = ['input', 'analyzing', 'results'].indexOf(currentStep) > index;
            
            return (
              <div key={step} className="flex flex-col items-center relative z-10">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isActive || isPast ? 'bg-purple-600 text-white' : 'bg-gray-200'
                  }`}
                >
                  {isPast ? '✓' : index + 1}
                </div>
                <span className={`mt-2 text-sm ${isActive ? 'text-purple-600 font-medium' : 'text-gray-500'}`}>
                  {step}
                </span>
              </div>
            );
          })}
          <div className="absolute top-4 left-0 w-full h-0.5 bg-gray-200 -z-10">
            <div
              className="h-full bg-purple-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {currentStep === 'input' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <h1 className="text-2xl font-bold">Analyze Music</h1>
            <p className="text-gray-600">
              Enter a song URL or upload a file to analyze its musical elements, production techniques, and commercial viability.
            </p>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex gap-4 mb-4">
                <button
                  className={`px-4 py-2 rounded transition-colors ${
                    !url.startsWith('file:') ? 'bg-purple-600 text-white' : 'bg-gray-200'
                  }`}
                  onClick={() => setUrl('')}
                >
                  URL
                </button>
                <label
                  className={`px-4 py-2 rounded cursor-pointer transition-colors ${
                    url.startsWith('file:') ? 'bg-purple-600 text-white' : 'bg-gray-200'
                  }`}
                >
                  Upload File
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept={SUPPORTED_AUDIO_TYPES.join(',')}
                    onChange={handleFileUpload}
                  />
                </label>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setError(null);
                  }}
                  placeholder="Enter song URL"
                  className={`w-full p-2 pl-10 border rounded transition-colors ${
                    error ? 'border-red-300 focus:border-red-500' : 'focus:border-purple-500'
                  }`}
                />
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  {url.startsWith('file:') ? '📁' : '🔗'}
                </span>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 text-red-600 text-sm"
                >
                  {error}
                </motion.div>
              )}

              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !url}
                className="w-full mt-4 bg-purple-600 text-white py-3 rounded-lg disabled:opacity-50 transition-opacity hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze Song'}
              </button>
            </div>
          </motion.div>
        )}

        {currentStep === 'analyzing' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg shadow p-8 text-center"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Analyzing Your Song</h2>
            <p className="text-gray-600 mb-4">Please wait while we process your music...</p>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-600 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </motion.div>
        )}

        {currentStep === 'results' && analysisResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Analysis Results</h2>
              <button
                onClick={resetAnalysis}
                className="px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              >
                Analyze Another Song
              </button>
            </div>
            
            {/* Sentiment Analysis */}
            <SentimentAnalysis
              mood={analysisResults.sentimentAnalysis?.emotionalTone || 'neutral'}
              intensity={analysisResults.sentimentAnalysis?.sentimentScore || 0}
              keywords={analysisResults.lyricalThemes || []}
              isLoading={isAnalyzing}
            />

            {/* Structure Analysis */}
            <StructureAnalysis
              sections={analysisResults.sections || []}
              preferences={preferences}
              isLoading={isAnalyzing}
              onSearch={(query) => {
                console.log('Search query:', query);
              }}
            />

            {/* Musical Elements */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Musical Elements</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-600">Key:</span>
                  <span className="ml-2 font-medium">{analysisResults.musicalElements.key}</span>
                </div>
                <div>
                  <span className="text-gray-600">Time Signature:</span>
                  <span className="ml-2 font-medium">{analysisResults.musicalElements.timeSignature}</span>
                </div>
                <div>
                  <span className="text-gray-600">Tempo:</span>
                  <span className="ml-2 font-medium">{analysisResults.musicalElements.tempo}</span>
                </div>
                <div>
                  <span className="text-gray-600">Instruments:</span>
                  <span className="ml-2 font-medium">
                    {analysisResults.musicalElements.dominantInstruments.join(', ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Commercial Viability */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Commercial Potential</h3>
              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Viability Score</span>
                  <span className="font-medium">{analysisResults.commercialViability.score}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${analysisResults.commercialViability.score}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full bg-green-500"
                  />
                </div>
              </div>
              <div>
                <h4 className="text-gray-600 mb-2">Key Factors</h4>
                <ul className="list-disc list-inside space-y-1">
                  {analysisResults.commercialViability.factors.map((factor, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="text-gray-700"
                    >
                      {factor}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Production Techniques */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Production Techniques</h3>
              <div className="flex flex-wrap gap-2">
                {analysisResults.productionTechniques.map((technique, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                  >
                    {technique}
                  </motion.span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AnalyzePage;
export { AnalyzePage };