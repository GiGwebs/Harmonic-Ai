import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { getAllSongAnalyses, deleteSongAnalysis } from '../lib/db/songs';
import { getAllGeneratedLyrics, deleteGeneratedLyrics } from '../lib/db/lyrics';
import { toast } from 'react-hot-toast';
import type { SongAnalysis } from '../types';
import type { GeneratedLyrics } from '../types/lyrics';
import { Loader2 } from 'lucide-react';

function SongDatabasePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  // State
  const [activeTab, setActiveTab] = useState<string>(() => {
    const hash = location.hash.replace('#', '');
    return hash || searchParams.get('tab') || 'analyzed';
  });
  const [analyzedSongs, setAnalyzedSongs] = useState<Array<SongAnalysis & { id: string }>>([]);
  const [generatedLyrics, setGeneratedLyrics] = useState<Array<GeneratedLyrics & { id: string }>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [highlightedLyricsId, setHighlightedLyricsId] = useState<string | null>(
    location.state?.savedLyricsId || null
  );

  console.log('[SongDatabasePage] Initial state:', { activeTab });

  // Data loading
  const loadData = useCallback(async () => {
    console.log('[Database] Loading data for tab:', activeTab);
    
    setIsLoading(true);
    setError(null);

    try {
      if (activeTab === 'analyzed') {
        const songs = await getAllSongAnalyses();
        setAnalyzedSongs(songs);
        console.log('[Database] Loaded analyzed songs:', songs.length);
      } else if (activeTab === 'generated') {
        console.log('[Database] Generated Lyrics Tab Activated');
        console.log('[Database] Calling getAllGeneratedLyrics...');
        let lyrics: Array<GeneratedLyrics & { id: string }> = []; // Explicitly typed and initialized
        try {
          lyrics = await getAllGeneratedLyrics();
          console.log('[Database] getAllGeneratedLyrics returned:', {
            count: lyrics.length,
            items: lyrics.map(l => ({
              id: l.id,
              title: l.title,
              type: l.type,
              createdAt: l.createdAt
            }))
          });
        } catch (error) {
          console.error('[Database] Error in getAllGeneratedLyrics:', error);
          setError('Failed to load generated lyrics');
          lyrics = []; // Ensure lyrics is always assigned even in case of error
        }

        if (lyrics) { // Check if lyrics is not null or undefined
          console.log('[Database] Setting generatedLyrics state with:', {
            count: lyrics.length,
            firstItem: lyrics[0] ? { title: lyrics[0].title, id: lyrics[0].id } : null
          });
          setGeneratedLyrics(lyrics);
        } else {
          console.warn('[Database] lyrics is undefined after getAllGeneratedLyrics, not updating state.');
        }
      }
    } catch (error: any) {
      console.error('[Database] Error loading data:', error);
      setError(error.message || 'Failed to load data');
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  // Handle URL refresh flag
  useEffect(() => {
    const shouldRefresh = searchParams.get('refresh') === 'true';
    if (shouldRefresh) {
      console.log('[Database] Refresh flag detected, triggering reload...');
      setRefreshTrigger(prev => prev + 1);
      // Remove refresh flag from URL
      searchParams.delete('refresh');
      navigate(`${location.pathname}${location.hash}`, { replace: true });
    }
  }, [searchParams, navigate, location.pathname, location.hash]);

  // Handle hash changes
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash === 'analyzed' || hash === 'generated') {
      setActiveTab(hash);
      console.log('[Navigation] Setting active tab to:', hash);
    }
  }, [location.hash]);

  // Handle newly saved lyrics highlighting
  useEffect(() => {
    if (location.state?.savedLyricsId) {
      console.log('[Database] New lyrics saved, ID:', location.state.savedLyricsId);
      setHighlightedLyricsId(location.state.savedLyricsId);
      // Ensure we're on the generated tab
      setActiveTab('generated');
      
      // Clear the highlight after delay
      const timer = setTimeout(() => {
        setHighlightedLyricsId(null);
        // Clean up location state
        navigate(location.pathname + location.hash, {
          replace: true,
          state: {}
        });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [location.state?.savedLyricsId, navigate, location.pathname, location.hash]);

  // Load data when tab changes or refresh is triggered
  useEffect(() => {
    loadData();
    console.log('[Database] Loading data for tab:', activeTab);
  }, [activeTab, refreshTrigger, loadData]);

  // Tab change handler
  const handleTabChange = (tab: string) => {
    console.log('[Navigation] Tab change requested:', {
      from: activeTab,
      to: tab,
      currentHash: location.hash
    });
    navigate(`#${tab}`);
  };

  // Delete handler
  const handleDeleteItem = async (id: string, type: 'song' | 'lyrics') => {
    try {
      if (type === 'song') {
        await deleteSongAnalysis(id);
        setAnalyzedSongs(prev => prev.filter(song => song.id !== id));
      } else {
        await deleteGeneratedLyrics(id);
        setGeneratedLyrics(prev => prev.filter(lyrics => lyrics.id !== id));
      }
      toast.success('Item deleted successfully');
    } catch (error) {
      console.error('[Database] Error deleting item:', error);
      toast.error('Failed to delete item');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-gray-900">Song Database</h1>

        <div className="flex space-x-4 border-b border-gray-200">
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'analyzed'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => handleTabChange('analyzed')}
          >
            Analyzed Songs
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'generated'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => handleTabChange('generated')}
          >
            Generated Lyrics
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : (
          <div className="space-y-4 min-h-[300px]">
            {activeTab === 'analyzed' && (
              <>
                {analyzedSongs.map(song => (
                  <div key={song.id} className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-xl font-semibold">{song.metadata?.title || 'Unknown Title'}</h3>
                    <p className="text-gray-600">{song.metadata?.artist || 'Unknown Artist'}</p>
                    <button
                      onClick={() => handleDeleteItem(song.id, 'song')}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </>
            )}
            {activeTab === 'generated' && (
              <>
                {generatedLyrics.length > 0 ? (
                  generatedLyrics.map(lyrics => (
                    <div key={lyrics.id} className={`bg-white rounded-lg shadow-md p-6 ${highlightedLyricsId === lyrics.id ? 'bg-yellow-100' : ''}`}>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-semibold">{lyrics.title}</h3>
                          <div className="text-sm text-gray-500 mt-1">
                            {lyrics.options.genre} • {lyrics.options.mood} • {lyrics.options.theme}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteItem(lyrics.id, 'lyrics')}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                      <p className="text-gray-600 whitespace-pre-wrap font-mono text-sm">{lyrics.content}</p>
                      {lyrics.createdAt && (
                        <div className="mt-4 text-sm text-gray-400">
                          Created {new Date(lyrics.createdAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    No generated lyrics found. Try generating some lyrics first!
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default SongDatabasePage;
