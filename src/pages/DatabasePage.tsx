import React, { useEffect, useState } from 'react';
import { getAllSongAnalyses, deleteSongAnalysis } from '../lib/db/songs';
import type { SongAnalysis } from '../types';
import { formatDate } from '../utils/date';
import { Button } from '../components/common/Button';
import { Trash2, Info } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function DatabasePage() {
  const [activeTab, setActiveTab] = useState('analyzed');
  const [analyzedSongs, setAnalyzedSongs] = useState<Array<SongAnalysis & { id: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSong, setSelectedSong] = useState<(SongAnalysis & { id: string }) | null>(null);

  useEffect(() => {
    loadSongs();
  }, []);

  async function loadSongs() {
    try {
      setLoading(true);
      const songs = await getAllSongAnalyses();
      setAnalyzedSongs(songs);
    } catch (error) {
      toast.error('Failed to load songs');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteSongAnalysis(id);
      toast.success('Song deleted successfully');
      loadSongs();
    } catch (error) {
      toast.error('Failed to delete song');
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Song Database</h1>

      <div className="flex space-x-2 border-b border-gray-200 mb-8">
        <button
          onClick={() => setActiveTab('analyzed')}
          className={`px-4 py-2 text-sm font-medium transition-colors relative
            ${activeTab === 'analyzed'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          Analyzed Songs
        </button>
        <button
          onClick={() => setActiveTab('generated')}
          className={`px-4 py-2 text-sm font-medium transition-colors relative
            ${activeTab === 'generated'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          Generated Lyrics
        </button>
      </div>

      {activeTab === 'analyzed' && (
        <>
          {loading ? (
            <div className="text-center py-8">Loading songs...</div>
          ) : analyzedSongs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No analyzed songs yet. Try analyzing a song first!
            </div>
          ) : (
            <div className="grid gap-4">
              {analyzedSongs.map(song => (
                <div
                  key={song.id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">
                        {song.metadata.title}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {song.metadata.artist}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Key</p>
                          <p className="font-medium">{song.musicalElements.key}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Time Signature</p>
                          <p className="font-medium">{song.musicalElements.timeSignature}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Commercial Score</p>
                          <p className="font-medium">{song.commercialViability.score}/10</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Analyzed On</p>
                          <p className="font-medium">{formatDate(song.createdAt)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedSong(song)}
                      >
                        <Info className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(song.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'generated' && (
        <div className="text-center py-8 text-gray-500">
          Generated lyrics will appear here
        </div>
      )}

      {selectedSong && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">{selectedSong.metadata.title}</h2>
                <p className="text-gray-600">{selectedSong.metadata.artist}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedSong(null)}
              >
                ×
              </Button>
            </div>

            <div className="space-y-6">
              <Section title="Musical Elements">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Key</p>
                    <p className="font-medium">{selectedSong.musicalElements.key}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Time Signature</p>
                    <p className="font-medium">{selectedSong.musicalElements.timeSignature}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tempo</p>
                    <p className="font-medium">{selectedSong.musicalElements.tempo}</p>
                  </div>
                </div>
                {selectedSong.musicalElements.dominantInstruments.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 mb-2">Dominant Instruments</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedSong.musicalElements.dominantInstruments.map((instrument, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                        >
                          {instrument}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </Section>

              <Section title="Production Techniques">
                <div className="flex flex-wrap gap-2">
                  {selectedSong.productionTechniques.map((technique, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                    >
                      {technique}
                    </span>
                  ))}
                </div>
              </Section>

              <Section title="Commercial Viability">
                <div className="mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="text-2xl font-bold">{selectedSong.commercialViability.score}</div>
                    <div className="text-gray-500">/10</div>
                  </div>
                </div>
                <ul className="list-disc list-inside space-y-2">
                  {selectedSong.commercialViability.factors.map((factor, i) => (
                    <li key={i} className="text-gray-700">{factor}</li>
                  ))}
                </ul>
              </Section>

              <Section title="Lyrical Themes">
                <div className="flex flex-wrap gap-2">
                  {selectedSong.lyricalThemes.map((theme, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              </Section>

              {selectedSong.uniqueCharacteristics.length > 0 && (
                <Section title="Unique Characteristics">
                  <ul className="list-disc list-inside space-y-2">
                    {selectedSong.uniqueCharacteristics.map((char, i) => (
                      <li key={i} className="text-gray-700">{char}</li>
                    ))}
                  </ul>
                </Section>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      {children}
    </div>
  );
}