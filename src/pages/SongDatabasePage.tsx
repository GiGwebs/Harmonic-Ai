import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAllSongAnalyses, deleteSongAnalysis } from '../lib/db/songs';
import { getAllGeneratedLyrics, deleteGeneratedLyrics } from '../lib/db/lyrics';
import { toast } from 'react-hot-toast';
import type { SongAnalysis, GeneratedLyrics } from '../types';

function SongDatabasePage() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'analyzed');
  const [analyzedSongs, setAnalyzedSongs] = useState<Array<SongAnalysis & { id: string }>>([]);
  const [generatedLyrics, setGeneratedLyrics] = useState<Array<GeneratedLyrics & { id: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'generated' || tab === 'analyzed') {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [songs, lyrics] = await Promise.all([
        getAllSongAnalyses(),
        getAllGeneratedLyrics()
      ]);
      setAnalyzedSongs(songs);
      setGeneratedLyrics(lyrics);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load songs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAnalysis = async (id: string) => {
    try {
      await deleteSongAnalysis(id);
      setAnalyzedSongs(prev => prev.filter(song => song.id !== id));
      toast.success('Song deleted successfully');
    } catch (error) {
      console.error('Error deleting song:', error);
      toast.error('Failed to delete song');
    }
  };

  const handleDeleteLyrics = async (id: string) => {
    try {
      await deleteGeneratedLyrics(id);
      setGeneratedLyrics(prev => prev.filter(lyrics => lyrics.id !== id));
      toast.success('Lyrics deleted successfully');
    } catch (error) {
      console.error('Error deleting lyrics:', error);
      toast.error('Failed to delete lyrics');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Song Database</h1>

      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('analyzed')}
              className={`${
                activeTab === 'analyzed'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium`}
            >
              Analyzed Songs
            </button>
            <button
              onClick={() => setActiveTab('generated')}
              className={`${
                activeTab === 'generated'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium`}
            >
              Generated Lyrics
            </button>
          </nav>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : activeTab === 'analyzed' ? (
        <div className="space-y-4">
          {analyzedSongs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No analyzed songs yet</div>
          ) : (
            analyzedSongs.map((song) => (
              <div key={song.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold mb-1">{song.metadata?.title || 'Unknown Title'}</h3>
                    <p className="text-gray-600">{song.metadata?.artist || 'Unknown Artist'}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleDeleteAnalysis(song.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600">Key</p>
                    <p>{song.musicalElements?.key || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Time Signature</p>
                    <p>{song.musicalElements?.timeSignature || '4/4'}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-gray-600">Commercial Score</p>
                  <p className="text-2xl font-bold">{song.commercialViability?.score || 0}/10</p>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {generatedLyrics.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No generated lyrics yet</div>
          ) : (
            generatedLyrics.map((lyrics) => (
              <div key={lyrics.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{lyrics.title}</h3>
                    <p className="text-gray-600">Generated on {new Date(lyrics.createdAt).toLocaleDateString()}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteLyrics(lyrics.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>

                <div className="mt-4">
                  <h4 className="font-medium mb-2">Lyrics</h4>
                  <pre className="whitespace-pre-wrap font-sans">{lyrics.content}</pre>
                </div>

                <div className="mt-4">
                  <h4 className="font-medium mb-2">Style</h4>
                  <p>{lyrics.style}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export { SongDatabasePage as DatabasePage };
