import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { saveLyrics } from '../lib/db/lyrics';
import { generateLyrics } from '../services/api';
import type { GenerateOptions, GeneratedLyrics } from '../types/lyrics';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { Loader2, Check, AlertTriangle, RefreshCw } from 'lucide-react';
import { analyzeLyricsSentiment } from '../services/sentimentAnalysis';
import { MUSIC_GENRES, SONG_STRUCTURES, type Genre, type Structure } from '../constants/genres';
import { TrendingGenresBox } from '../components/trends/TrendingGenresBox';
import { YouTubeInsightsBox } from '../components/trends/YouTubeInsightsBox';

type Step = 'input' | 'generate' | 'analyze';

interface StepOneData {
  title: string;
  genre: Genre;
  mood: string;
  theme: string;
  structure: Structure;
}

interface AnalysisResult {
  sentiment: {
    score: number;
    label: string;
  };
  commercialViability: {
    score: number;
    reasons: string[];
  };
  suggestions: string[];
}

export default function GenerateLyricsPageWrapper() {
  return (
    <ErrorBoundary>
      <GenerateLyricsPage />
    </ErrorBoundary>
  );
}

function GenerateLyricsPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>('input');
  const [isLoading, setIsLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [stepOneData, setStepOneData] = useState<StepOneData>({
    title: '',
    genre: 'afrobeats',
    mood: 'upbeat',
    theme: 'love',
    structure: 'verse-chorus'
  });
  const [generatedLyrics, setGeneratedLyrics] = useState<string>('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const handleStepOneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const options: GenerateOptions = {
        genre: stepOneData.genre,
        mood: stepOneData.mood,
        theme: stepOneData.theme,
        structure: stepOneData.structure
      };

      const result = await generateLyrics(stepOneData.title, options);
      setGeneratedLyrics(result.lyrics);
      setCurrentStep('generate');
    } catch (error: any) {
      console.error('Error generating lyrics:', error);
      
      // Check if it's a rate limit error
      if (error.message?.includes('Rate limit exceeded')) {
        toast.error(error.message, {
          duration: 5000,
          icon: '⏳',
        });
      } else {
        toast.error('Failed to generate lyrics. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeLyrics = async (lyrics: string) => {
    try {
      setIsLoading(true);
      const result = await analyzeLyricsSentiment(lyrics);
      
      // Simple analysis based on structure and content
      const lines = lyrics.split('\n').filter(line => line.trim());
      const verses = lyrics.match(/\[Verse/g)?.length || 0;
      const choruses = lyrics.match(/\[Chorus/g)?.length || 0;
      
      const suggestions: string[] = [];
      const reasons: string[] = [];
      
      // Structure analysis
      if (verses < 2) {
        suggestions.push('Consider adding another verse to develop the story further');
      }
      if (choruses < 2) {
        suggestions.push('Adding more chorus repetitions can make the song more memorable');
      }
      
      // Content analysis
      const averageLineLength = lines.reduce((acc, line) => acc + line.length, 0) / lines.length;
      if (averageLineLength > 40) {
        suggestions.push('Some lines might be too long - consider making them more concise');
      }
      
      // Commercial viability analysis
      let viabilityScore = 7.0; // Base score
      
      if (result.sentimentScore > 0.5) {
        viabilityScore += 1;
        reasons.push('Positive sentiment often resonates well with listeners');
      }
      
      if (choruses >= 3) {
        viabilityScore += 1;
        reasons.push('Strong chorus presence increases memorability');
      }
      
      if (stepOneData.genre.toLowerCase().includes('pop')) {
        viabilityScore += 1;
        reasons.push('Pop genre typically has broader commercial appeal');
      }

      return {
        sentiment: {
          score: result.sentimentScore,
          label: result.sentimentScore > 0.5 ? 'Positive' : result.sentimentScore < -0.5 ? 'Negative' : 'Neutral'
        },
        commercialViability: {
          score: Math.min(10, viabilityScore),
          reasons
        },
        suggestions
      };
    } catch (error) {
      console.error('Error analyzing lyrics:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyze = async () => {
    setIsLoading(true);
    try {
      const analysisResult = await analyzeLyrics(generatedLyrics);
      setAnalysis(analysisResult);
    } catch (error) {
      console.error('Error during analysis:', error);
      toast.error('Failed to analyze lyrics');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveLyrics = async () => {
    if (!stepOneData.title || !generatedLyrics) {
      toast.error('Please generate lyrics before saving');
      return;
    }

    setIsLoading(true);
    setSaveError(null);
    
    try {
      const lyricsData: GeneratedLyrics = {
        title: stepOneData.title,
        content: generatedLyrics,
        options: {
          genre: stepOneData.genre,
          mood: stepOneData.mood,
          theme: stepOneData.theme,
          structure: stepOneData.structure
        },
        analysis: analysis || undefined,
        createdAt: new Date().toISOString(),
        type: 'generated' // Explicitly mark as generated lyrics
      };

      console.log('Attempting to save lyrics:', { 
        title: lyricsData.title,
        contentLength: lyricsData.content.length,
        hasAnalysis: !!lyricsData.analysis
      });

      const docId = await saveLyrics(lyricsData);
      
      if (!docId) {
        throw new Error('Failed to save lyrics - no document ID returned');
      }

      console.log('Lyrics saved successfully:', { docId });
      toast.success('Lyrics saved successfully!');
      
      // Show success toast with action button
      toast.success(
        (t) => (
          <div className="flex flex-col">
            <span>Lyrics saved successfully!</span>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                navigate('/database#generated');
              }}
              className="mt-2 text-sm text-indigo-600 hover:text-indigo-500"
            >
              View in Database →
            </button>
          </div>
        ),
        {
          duration: 5000,
          icon: '✨'
        }
      );
      
    } catch (error: any) {
      console.error('Error saving lyrics:', error);
      const errorMessage = error.message || 'Failed to save lyrics';
      setSaveError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepOne = () => (
    <form onSubmit={handleStepOneSubmit} className="space-y-6">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Title Input */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Song Title
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="title"
                  id="title"
                  required
                  className="form-input"
                  value={stepOneData.title}
                  onChange={(e) => setStepOneData({ ...stepOneData, title: e.target.value })}
                  placeholder="Enter a title for your song"
                />
              </div>
            </div>

            {/* Genre Select */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Genre
              </label>
              <select
                value={stepOneData.genre}
                onChange={(e) => setStepOneData({ ...stepOneData, genre: e.target.value as Genre })}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                {MUSIC_GENRES.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre.charAt(0).toUpperCase() + genre.slice(1)}
                  </option>
                ))}
              </select>
              <div className="mt-4 space-y-4">
                <TrendingGenresBox />
                <YouTubeInsightsBox />
              </div>
            </div>

            {/* Mood Select */}
            <div>
              <label htmlFor="mood" className="block text-sm font-medium text-gray-700">
                Mood
              </label>
              <select
                id="mood"
                name="mood"
                required
                className="form-select"
                value={stepOneData.mood}
                onChange={(e) => setStepOneData({ ...stepOneData, mood: e.target.value })}
              >
                <option value="">Select a mood</option>
                <option value="happy">Happy</option>
                <option value="sad">Sad</option>
                <option value="energetic">Energetic</option>
                <option value="romantic">Romantic</option>
                <option value="angry">Angry</option>
                <option value="peaceful">Peaceful</option>
                <option value="nostalgic">Nostalgic</option>
              </select>
            </div>

            {/* Theme Input */}
            <div>
              <label htmlFor="theme" className="block text-sm font-medium text-gray-700">
                Theme
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="theme"
                  id="theme"
                  required
                  className="form-input"
                  value={stepOneData.theme}
                  onChange={(e) => setStepOneData({ ...stepOneData, theme: e.target.value })}
                  placeholder="Enter the main theme or topic"
                />
              </div>
            </div>

            {/* Structure Select */}
            <div>
              <label htmlFor="structure" className="block text-sm font-medium text-gray-700">
                Song Structure
              </label>
              <select
                id="structure"
                name="structure"
                required
                className="form-select"
                value={stepOneData.structure}
                onChange={(e) => setStepOneData({ ...stepOneData, structure: e.target.value as Structure })}
              >
                {Object.entries(SONG_STRUCTURES).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              isLoading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
          >
            {isLoading ? 'Generating...' : 'Generate Lyrics'}
          </button>
        </div>
      </div>
    </form>
  );

  const renderStepTwo = () => (
    <div className="space-y-6">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Generated Lyrics</h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <pre className="whitespace-pre-wrap font-sans">{generatedLyrics}</pre>
          </div>
          <div className="mt-5">
            <button
              type="button"
              onClick={() => setCurrentStep('analyze')}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
            >
              Analyze & Save
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep('input')}
              className="ml-3 inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
            >
              Generate Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStepThree = () => (
    <div className="space-y-6">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Analysis Results</h3>
          
          {saveError && (
            <div className="mt-4 p-4 bg-red-50 rounded-md">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error Saving Lyrics</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{saveError}</p>
                  </div>
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setSaveError(null);
                        handleSaveLyrics();
                      }}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {analysis ? (
            <div className="mt-4 space-y-6">
              {/* Sentiment Analysis */}
              <div>
                <h4 className="text-sm font-medium text-gray-900">Sentiment Analysis</h4>
                <div className="mt-2 flex items-center">
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                    analysis.sentiment.label === 'Positive' ? 'bg-green-100 text-green-800' :
                    analysis.sentiment.label === 'Negative' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {analysis.sentiment.label}
                  </div>
                  <span className="ml-2 text-sm text-gray-500">
                    Score: {analysis.sentiment.score.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Commercial Viability */}
              <div>
                <h4 className="text-sm font-medium text-gray-900">Commercial Viability</h4>
                <div className="mt-2">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-2 bg-indigo-600 rounded-full"
                          style={{ width: `${analysis.commercialViability.score * 10}%` }}
                        />
                      </div>
                    </div>
                    <span className="ml-3 text-sm font-medium text-gray-900">
                      {analysis.commercialViability.score.toFixed(1)}/10
                    </span>
                  </div>
                  <ul className="mt-2 text-sm text-gray-600 list-disc list-inside">
                    {analysis.commercialViability.reasons.map((reason, index) => (
                      <li key={index}>{reason}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Suggestions */}
              <div>
                <h4 className="text-sm font-medium text-gray-900">Suggestions for Improvement</h4>
                <ul className="mt-2 space-y-2">
                  {analysis.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={isLoading}
              className={`mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                isLoading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Check className="-ml-1 mr-2 h-5 w-5" />
                  Analyze Lyrics
                </>
              )}
            </button>
          )}

          <div className="mt-5 flex space-x-3">
            <button
              type="button"
              onClick={handleSaveLyrics}
              disabled={isLoading || !!saveError}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                isLoading || saveError ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="-ml-1 mr-2 h-5 w-5" />
                  Save Lyrics
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep('generate')}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Back to Lyrics
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLoadingState = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="flex items-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <span className="ml-3 text-gray-600">
          {currentStep === 'input' ? 'Generating lyrics...' : 'Saving lyrics...'}
        </span>
      </div>
      {currentStep === 'input' && (
        <p className="mt-4 text-sm text-gray-500">
          This might take a few moments. Please be patient...
        </p>
      )}
    </div>
  );

  const renderErrorState = (message: string, onRetry?: () => void) => (
    <div className="flex flex-col items-center justify-center py-12">
      <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
      <p className="text-gray-800 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Generate Lyrics</h1>
          <p className="mt-2 text-sm text-gray-600">
            Create unique lyrics by specifying your preferences and style.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <nav className="flex items-center justify-center" aria-label="Progress">
            <ol className="flex items-center space-x-5">
              {['input', 'generate', 'analyze'].map((step, index) => (
                <li key={step}>
                  <div className={`flex items-center ${index !== 0 ? 'ml-5' : ''}`}>
                    {index !== 0 && (
                      <div className="flex-shrink-0 w-10 h-0.5 bg-gray-200"></div>
                    )}
                    <div
                      className={`relative flex items-center justify-center w-8 h-8 rounded-full ${
                        currentStep === step
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {index + 1}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </nav>
        </div>

        {/* Step Content */}
        {isLoading ? (
          renderLoadingState()
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              {currentStep === 'input' && renderStepOne()}
              {currentStep === 'generate' && renderStepTwo()}
              {currentStep === 'analyze' && renderStepThree()}
            </div>
            
            <div className="space-y-4">
              {/* Other sidebar content */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
