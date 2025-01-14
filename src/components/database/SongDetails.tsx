import React from 'react';
import { X, Music, Clock, Key } from 'lucide-react';
import type { Song } from '../../types';
import { Button } from '../common/Button';

interface SongDetailsProps {
  song: Song;
  onClose: () => void;
}

export function SongDetails({ song, onClose }: SongDetailsProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Song Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">{song.title}</h3>
            <p className="text-gray-600">{song.artist}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <DetailCard
              icon={<Music className="w-5 h-5" />}
              title="Musical Elements"
              items={[
                `Key: ${song.analysis?.musicalElements.key || 'N/A'}`,
                `Time Signature: ${song.analysis?.musicalElements.timeSignature || 'N/A'}`,
                `Instruments: ${song.analysis?.musicalElements.dominantInstruments?.join(', ') || 'N/A'}`
              ]}
            />
            
            <DetailCard
              icon={<Clock className="w-5 h-5" />}
              title="Production"
              items={song.analysis?.productionTechniques || []}
            />
            
            <DetailCard
              icon={<Key className="w-5 h-5" />}
              title="Commercial Viability"
              items={[
                `Score: ${song.analysis?.commercialViability.score}/10`,
                ...(song.analysis?.commercialViability.factors || [])
              ]}
            />
          </div>

          {song.sourceUrl && (
            <div className="pt-4 border-t">
              <Button
                variant="secondary"
                onClick={() => window.open(song.sourceUrl, '_blank')}
              >
                View Original Source
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailCard({ icon, title, items }: { icon: React.ReactNode; title: string; items: string[] }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="text-purple-600">{icon}</div>
        <h4 className="font-semibold">{title}</h4>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-gray-600">{item}</li>
        ))}
      </ul>
    </div>
  );
}