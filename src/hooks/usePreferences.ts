import { useState, useEffect, useCallback, useRef } from 'react';

interface FilterPreset {
  id: string;
  name: string;
  filters: {
    sectionTypes: string[];
    complexity: ('simple' | 'intermediate' | 'complex')[];
    mood: ('joyful' | 'somber' | 'energetic' | 'melancholic' | 'neutral')[];
    themes: string[];
  };
}

interface Preferences {
  snapScrollingEnabled: boolean;
  tipsVisible: boolean;
  detailsVisible: boolean;
  advancedFilters: {
    sectionTypes: string[];
    complexity: ('simple' | 'intermediate' | 'complex')[];
    mood: ('joyful' | 'somber' | 'energetic' | 'melancholic' | 'neutral')[];
    themes: string[];
  };
  filterPresets: FilterPreset[];
  activePresetId: string | null;
}

const DEFAULT_PRESETS: FilterPreset[] = [
  {
    id: 'pop-songs',
    name: 'Pop Songs',
    filters: {
      sectionTypes: ['verse', 'chorus', 'bridge'],
      complexity: ['simple', 'intermediate'],
      mood: ['joyful', 'energetic'],
      themes: ['emotional', 'narrative'],
    },
  },
  {
    id: 'melancholic-ballads',
    name: 'Melancholic Ballads',
    filters: {
      sectionTypes: ['verse', 'chorus'],
      complexity: ['intermediate', 'complex'],
      mood: ['somber', 'melancholic'],
      themes: ['emotional', 'descriptive'],
    },
  },
  {
    id: 'dance-hits',
    name: 'Dance Hits',
    filters: {
      sectionTypes: ['verse', 'chorus', 'bridge', 'drop'],
      complexity: ['simple', 'intermediate'],
      mood: ['energetic', 'joyful'],
      themes: ['narrative', 'abstract'],
    },
  },
  {
    id: 'acoustic-favorites',
    name: 'Acoustic Favorites',
    filters: {
      sectionTypes: ['verse', 'chorus'],
      complexity: ['simple'],
      mood: ['neutral', 'melancholic', 'joyful'],
      themes: ['emotional', 'descriptive'],
    },
  },
  {
    id: 'experimental',
    name: 'Experimental',
    filters: {
      sectionTypes: ['bridge', 'interlude'],
      complexity: ['complex'],
      mood: ['neutral'],
      themes: ['abstract'],
    },
  },
];

const DEFAULT_PREFERENCES: Preferences = {
  snapScrollingEnabled: true,
  tipsVisible: false,
  detailsVisible: false,
  advancedFilters: {
    sectionTypes: [],
    complexity: [],
    mood: [],
    themes: [],
  },
  filterPresets: DEFAULT_PRESETS,
  activePresetId: null,
};

interface PreferenceHistoryEntry {
  preferences: Preferences;
  timestamp: number;
}

export const usePreferences = () => {
  const [preferences, setPreferences] = useState<Preferences>(() => {
    const stored = localStorage.getItem('userPreferences');
    return stored ? JSON.parse(stored) : DEFAULT_PREFERENCES;
  });

  const historyRef = useRef<PreferenceHistoryEntry[]>([]);
  const currentIndexRef = useRef<number>(-1);
  const maxHistoryLength = 50;

  useEffect(() => {
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
  }, [preferences]);

  const addToHistory = useCallback((newPreferences: Preferences) => {
    const newEntry: PreferenceHistoryEntry = {
      preferences: newPreferences,
      timestamp: Date.now(),
    };

    // Remove any future history if we're not at the end
    historyRef.current = historyRef.current.slice(0, currentIndexRef.current + 1);
    
    // Add new entry
    historyRef.current.push(newEntry);
    currentIndexRef.current++;

    // Limit history length
    if (historyRef.current.length > maxHistoryLength) {
      historyRef.current = historyRef.current.slice(-maxHistoryLength);
      currentIndexRef.current = historyRef.current.length - 1;
    }
  }, []);

  const updatePreference = useCallback(<K extends keyof Preferences>(
    key: K,
    value: Preferences[K]
  ) => {
    setPreferences(prev => {
      const newPreferences = { ...prev, [key]: value };
      addToHistory(newPreferences);
      return newPreferences;
    });
  }, [addToHistory]);

  const updateAdvancedFilter = useCallback(<K extends keyof Preferences['advancedFilters']>(
    key: K,
    value: Preferences['advancedFilters'][K]
  ) => {
    setPreferences(prev => {
      const newPreferences = {
        ...prev,
        advancedFilters: {
          ...prev.advancedFilters,
          [key]: value,
        },
      };
      addToHistory(newPreferences);
      return newPreferences;
    });
  }, [addToHistory]);

  const applyPreset = useCallback((presetId: string | null) => {
    setPreferences(prev => {
      if (!presetId) {
        const newPreferences = {
          ...prev,
          advancedFilters: DEFAULT_PREFERENCES.advancedFilters,
          activePresetId: null,
        };
        addToHistory(newPreferences);
        return newPreferences;
      }

      const preset = prev.filterPresets.find(p => p.id === presetId);
      if (!preset) return prev;

      const newPreferences = {
        ...prev,
        advancedFilters: { ...preset.filters },
        activePresetId: presetId,
      };
      addToHistory(newPreferences);
      return newPreferences;
    });
  }, [addToHistory]);

  const savePreset = useCallback((name: string, filters: Preferences['advancedFilters']) => {
    setPreferences(prev => {
      const newPreset: FilterPreset = {
        id: `custom-${Date.now()}`,
        name,
        filters: { ...filters },
      };

      const newPreferences = {
        ...prev,
        filterPresets: [...prev.filterPresets, newPreset],
        activePresetId: newPreset.id,
      };
      addToHistory(newPreferences);
      return newPreferences;
    });
  }, [addToHistory]);

  const deletePreset = useCallback((presetId: string) => {
    setPreferences(prev => {
      const newPreferences = {
        ...prev,
        filterPresets: prev.filterPresets.filter(p => p.id !== presetId),
        activePresetId: prev.activePresetId === presetId ? null : prev.activePresetId,
      };
      addToHistory(newPreferences);
      return newPreferences;
    });
  }, [addToHistory]);

  const undo = useCallback(() => {
    if (currentIndexRef.current > 0) {
      currentIndexRef.current--;
      const previousEntry = historyRef.current[currentIndexRef.current];
      setPreferences(previousEntry.preferences);
    }
  }, []);

  const redo = useCallback(() => {
    if (currentIndexRef.current < historyRef.current.length - 1) {
      currentIndexRef.current++;
      const nextEntry = historyRef.current[currentIndexRef.current];
      setPreferences(nextEntry.preferences);
    }
  }, []);

  const resetPreferences = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES);
    addToHistory(DEFAULT_PREFERENCES);
  }, [addToHistory]);

  const canUndo = currentIndexRef.current > 0;
  const canRedo = currentIndexRef.current < historyRef.current.length - 1;

  return {
    preferences,
    updatePreference,
    updateAdvancedFilter,
    resetPreferences,
    undo,
    redo,
    canUndo,
    canRedo,
    applyPreset,
    savePreset,
    deletePreset,
  };
};

// Keyboard shortcuts hook
export const useKeyboardShortcuts = (
  shortcuts: { key: string; ctrlKey?: boolean; shiftKey?: boolean; action: () => void }[]
) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      shortcuts.forEach(({ key, ctrlKey, shiftKey, action }) => {
        if (
          event.key.toLowerCase() === key.toLowerCase() &&
          (!ctrlKey || (ctrlKey && event.ctrlKey)) &&
          (!shiftKey || (shiftKey && event.shiftKey))
        ) {
          event.preventDefault();
          action();
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};
