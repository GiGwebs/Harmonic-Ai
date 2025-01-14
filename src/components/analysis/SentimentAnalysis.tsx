import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Skeleton from 'react-loading-skeleton';
import * as Tooltip from '@radix-ui/react-tooltip';
import { usePreferences, useKeyboardShortcuts } from '../../hooks/usePreferences';
import 'react-loading-skeleton/dist/skeleton.css';

interface SentimentAnalysisProps {
  mood: string;
  intensity: number;
  keywords: string[];
  isLoading?: boolean;
}

const moodColors = {
  happy: 'bg-yellow-500',
  romantic: 'bg-pink-500',
  sad: 'bg-blue-500',
  energetic: 'bg-orange-500',
  angry: 'bg-red-500',
} as const;

const moodEmojis = {
  happy: '😊',
  romantic: '💝',
  sad: '😢',
  energetic: '⚡',
  angry: '😠',
} as const;

const moodDescriptions = {
  happy: 'Expresses joy, contentment, or positive emotions',
  romantic: 'Conveys love, affection, or intimate feelings',
  sad: 'Reflects melancholy, grief, or emotional pain',
  energetic: 'Portrays high energy, excitement, or enthusiasm',
  angry: 'Shows frustration, anger, or intense emotions',
} as const;

const keywordDescriptions: Record<string, string> = {
  love: 'Themes of romance, affection, or deep connection',
  heartbreak: 'Experiences of loss, separation, or emotional pain',
  hope: 'Optimistic outlook or aspirations for the future',
  freedom: 'Expressions of independence or liberation',
  struggle: 'Challenges, conflicts, or personal battles',
  joy: 'Moments of happiness, celebration, or triumph',
  nostalgia: 'Reminiscence of past experiences or memories',
  rebellion: 'Standing against convention or authority',
  peace: 'Inner tranquility or harmony with others',
  growth: 'Personal development or transformation',
};

const moodAnalysisTips = {
  title: 'Understanding Mood Analysis',
  description: 'Our AI analyzes lyrics to determine the emotional tone and themes of your song.',
  tips: [
    'Mood intensity reflects the strength of emotional expression in the lyrics',
    'Themes are extracted from recurring words, phrases, and contextual patterns',
    'Higher intensity suggests more explicit emotional content',
    'Multiple themes indicate complex emotional layering in the lyrics'
  ]
};

export const SentimentAnalysis: React.FC<SentimentAnalysisProps> = ({
  mood,
  intensity,
  keywords,
  isLoading = false,
}) => {
  const { preferences, updatePreference } = usePreferences();
  const [focusedKeyword, setFocusedKeyword] = useState<string | null>(null);

  const memoizedValues = useMemo(() => {
    const validMood = (mood || '').toLowerCase();
    return {
      moodColor: moodColors[validMood as keyof typeof moodColors] || 'bg-gray-500',
      moodEmoji: moodEmojis[validMood as keyof typeof moodEmojis] || '🎵',
      moodDescription: moodDescriptions[validMood as keyof typeof moodDescriptions] || 'General musical mood',
      intensityWidth: `${Math.max(0, Math.min(100, Math.round((intensity || 0) * 100)))}%`,
      validKeywords: (keywords || []).filter(k => k && typeof k === 'string').slice(0, 10),
    };
  }, [mood, intensity, keywords]);

  const { moodColor, moodEmoji, moodDescription, intensityWidth, validKeywords } = memoizedValues;

  const handleKeyPress = useCallback((event: React.KeyboardEvent, action: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  }, []);

  useKeyboardShortcuts([
    {
      key: 't',
      ctrlKey: true,
      action: () => updatePreference('tipsVisible', !preferences.tipsVisible),
    },
    {
      key: 'd',
      ctrlKey: true,
      action: () => updatePreference('detailsVisible', !preferences.detailsVisible),
    },
  ]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6 animate-pulse">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton width={150} height={24} />
          <Skeleton circle width={24} height={24} />
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <Skeleton width={60} />
              <Skeleton width={80} />
            </div>
            <Skeleton height={8} />
            <div className="text-right mt-1">
              <Skeleton width={100} />
            </div>
          </div>

          <div>
            <Skeleton width={100} className="mb-2" />
            <div className="flex flex-wrap gap-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} width={60} height={24} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Tooltip.Provider delayDuration={200}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-lg shadow-lg p-6 mb-6 hover:shadow-xl transition-shadow duration-300"
        role="region"
        aria-label="Sentiment Analysis Results"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Sentiment Analysis
            </motion.span>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, delay: 0.3 }}
                  className="text-2xl cursor-help"
                  whileHover={{ scale: 1.1 }}
                  role="img"
                  aria-label={`Mood: ${mood}`}
                  tabIndex={0}
                  onKeyPress={(e) => handleKeyPress(e, () => {})}
                >
                  {moodEmoji}
                </motion.span>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm"
                  sideOffset={5}
                >
                  {moodDescription}
                  <Tooltip.Arrow className="fill-gray-800" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </h3>
          
          <div className="flex gap-2">
            <button
              onClick={() => updatePreference('tipsVisible', !preferences.tipsVisible)}
              className={`
                px-3 py-1 rounded-full text-sm font-medium transition-all duration-200
                ${preferences.tipsVisible ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-600 hover:bg-purple-200'}
              `}
              aria-expanded={preferences.tipsVisible}
              aria-label={preferences.tipsVisible ? 'Hide analysis tips (Ctrl+T)' : 'Show analysis tips (Ctrl+T)'}
            >
              {preferences.tipsVisible ? 'Hide Tips' : 'Show Tips'}
            </button>
            <button
              onClick={() => updatePreference('detailsVisible', !preferences.detailsVisible)}
              className={`
                px-3 py-1 rounded-full text-sm font-medium transition-all duration-200
                ${preferences.detailsVisible ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
              `}
              aria-expanded={preferences.detailsVisible}
              aria-label={preferences.detailsVisible ? 'Hide details (Ctrl+D)' : 'Show details (Ctrl+D)'}
            >
              {preferences.detailsVisible ? 'Hide Details' : 'Show Details'}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {preferences.tipsVisible && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-6 bg-purple-50 rounded-lg p-4 border border-purple-100"
            >
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-medium text-purple-800">
                  {moodAnalysisTips.title}
                </h4>
                <div className="text-xs text-purple-600">
                  <span className="px-2 py-1 bg-purple-100 rounded">Ctrl+T</span> to toggle tips
                </div>
              </div>
              <p className="text-sm text-purple-700 mb-3">
                {moodAnalysisTips.description}
              </p>
              <div className="space-y-2">
                {moodAnalysisTips.tips.map((tip, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 text-sm text-purple-600"
                  >
                    <span className="text-purple-400 mt-1" aria-hidden="true">•</span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Mood</span>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="font-medium capitalize"
              >
                {mood || 'Unknown'}
              </motion.span>
            </div>
            <div 
              className="h-2 bg-gray-200 rounded-full overflow-hidden group"
              role="progressbar"
              aria-valuenow={Math.round((intensity || 0) * 100)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Mood intensity"
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: intensityWidth }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
                className={`h-full ${moodColor} group-hover:brightness-110 transition-all duration-300`}
              />
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-right text-sm text-gray-500 mt-1"
            >
              Intensity: {Math.round((intensity || 0) * 100)}%
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h4 className="text-gray-600 mb-2">Key Themes</h4>
            <div className="flex flex-wrap gap-2" role="list" aria-label="Theme keywords">
              <AnimatePresence mode="sync">
                {validKeywords.map((keyword, index) => (
                  <Tooltip.Root key={keyword}>
                    <Tooltip.Trigger asChild>
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        whileHover={{ scale: 1.05 }}
                        transition={{ delay: index * 0.1 + 0.8 }}
                        className={`
                          px-3 py-1 rounded-full text-sm cursor-help
                          ${moodColor.replace('bg-', 'bg-opacity-20 text-').replace('-500', '-700')}
                          hover:bg-opacity-30 transition-all duration-300
                        `}
                        role="listitem"
                        tabIndex={0}
                        onKeyPress={(e) => handleKeyPress(e, () => setFocusedKeyword(keyword))}
                        onFocus={() => setFocusedKeyword(keyword)}
                        onBlur={() => setFocusedKeyword(null)}
                        aria-label={`Theme: ${keyword}`}
                      >
                        {keyword}
                      </motion.span>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content
                        className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm max-w-xs"
                        sideOffset={5}
                      >
                        {keywordDescriptions[keyword.toLowerCase()] || `Theme related to ${keyword}`}
                        <Tooltip.Arrow className="fill-gray-800" />
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                ))}
                {validKeywords.length === 0 && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-gray-500 text-sm"
                  >
                    No themes detected
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {preferences.detailsVisible && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 space-y-3 bg-gray-50 rounded-lg p-4"
                >
                  <div>
                    <h5 className="font-medium text-gray-700 mb-2">Mood Analysis</h5>
                    <p className="text-sm text-gray-600">{moodDescription}</p>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-gray-700 mb-2">Theme Insights</h5>
                    <div className="space-y-2">
                      {validKeywords.map((keyword) => (
                        <div key={keyword} className="text-sm">
                          <span className="font-medium text-gray-700">{keyword}:</span>{' '}
                          <span className="text-gray-600">
                            {keywordDescriptions[keyword.toLowerCase()] || `Theme related to ${keyword}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>
    </Tooltip.Provider>
  );
};
