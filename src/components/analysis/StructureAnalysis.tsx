import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Skeleton from 'react-loading-skeleton';
import * as Tooltip from '@radix-ui/react-tooltip';
import { Section, AnalyzedSection, Preferences, SectionInsight } from '../../types';
import { usePreferences, useKeyboardShortcuts } from '../../hooks/usePreferences';
import { sectionInsights } from '../../constants/sectionInsights';
import debounce from 'lodash/debounce';

interface StructureAnalysisProps {
  sections: AnalyzedSection[];
  preferences: Preferences;
  isLoading?: boolean;
  onSearch: (query: string) => void;
  onFilter: (filters: any) => void;
}

const sectionColors = {
  verse: 'bg-blue-500',
  chorus: 'bg-purple-500',
  bridge: 'bg-green-500',
  intro: 'bg-indigo-500',
  outro: 'bg-gray-500',
} as const;

const sectionIcons = {
  verse: '📝',
  chorus: '🎵',
  bridge: '🌉',
  intro: '🎼',
  outro: '🔚',
} as const;

export const StructureAnalysis: React.FC<StructureAnalysisProps> = ({
  sections,
  preferences,
  isLoading = false,
  onSearch,
  onFilter,
}) => {
  const [expandedSection, setExpandedSection] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      onSearch(query);
    }, 300),
    [onSearch]
  );

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  const handleFilterChange = (type: string, value: string[]) => {
    const newFilters = {
      ...preferences.advancedFilters,
      [type]: value,
    };
    onFilter(newFilters);
  };

  const filteredSections = useMemo(() => {
    if (!sections) return [];
    
    return sections.filter(section => {
      // Apply search filter
      if (searchQuery && !section.content.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Apply advanced filters
      const { sectionTypes, complexity, mood } = preferences.advancedFilters;

      const typeMatch = sectionTypes.length === 0 || sectionTypes.includes(section.type);
      const complexityMatch = complexity.length === 0 || complexity.includes(section.analysis.complexity);
      const moodMatch = mood.length === 0 || mood.some(m => section.analysis.moods.includes(m as any));

      return typeMatch && complexityMatch && moodMatch;
    });
  }, [sections, searchQuery, preferences.advancedFilters]);

  if (isLoading) {
    return (
      <div className="space-y-4" data-testid="loading-indicator">
        <Skeleton height={100} count={3} />
      </div>
    );
  }

  if (!sections || sections.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No sections found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <input
          type="text"
          placeholder="Search sections..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="flex-1 px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
        >
          Filters
        </button>
      </div>

      {showAdvancedFilters && (
        <div className="p-4 bg-gray-50 rounded-lg space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Section Types</h3>
            <div className="flex flex-wrap gap-2">
              {Object.keys(sectionColors).map(type => (
                <button
                  key={type}
                  onClick={() => {
                    const types = preferences.advancedFilters.sectionTypes.includes(type)
                      ? preferences.advancedFilters.sectionTypes.filter(t => t !== type)
                      : [...preferences.advancedFilters.sectionTypes, type];
                    handleFilterChange('sectionTypes', types);
                  }}
                  className={`px-3 py-1 rounded-full ${
                    preferences.advancedFilters.sectionTypes.includes(type)
                      ? sectionColors[type as keyof typeof sectionColors]
                      : 'bg-gray-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {filteredSections.map((section, index) => (
          <motion.div
            key={section.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-white text-sm ${sectionColors[section.type]}`}>
                    {sectionIcons[section.type]} {section.type}
                  </span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-600">{section.analysis.complexity}</span>
                  <span className="text-gray-500">•</span>
                  <div className="flex space-x-1">
                    {section.analysis.moods.map(mood => (
                      <span key={mood} className="px-2 py-1 bg-gray-100 rounded-full text-sm">
                        {mood}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="mt-2 text-gray-700">{section.content}</p>
              </div>
              <div className="text-right">
                <Tooltip.Provider>
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <div className="inline-flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded">
                        <span className="text-sm font-medium">{section.analysis.impact}</span>
                        <span className="text-xs text-gray-500">impact</span>
                      </div>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content
                        className="bg-gray-800 text-white px-4 py-2 rounded shadow-lg text-sm"
                        sideOffset={5}
                      >
                        Impact score based on section type and complexity
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                </Tooltip.Provider>
              </div>
            </div>

            {expandedSection === index && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 pt-4 border-t"
              >
                <div className="space-y-4">
                  {section.analysis.recommendations.map((recommendation, i) => (
                    <div key={i} className="flex items-start space-x-2">
                      <span className="text-blue-500">•</span>
                      <p className="text-gray-700">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            <button
              onClick={() => setExpandedSection(expandedSection === index ? null : index)}
              className="mt-4 text-sm text-blue-500 hover:text-blue-600"
            >
              {expandedSection === index ? 'Show less' : 'Show more'}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
