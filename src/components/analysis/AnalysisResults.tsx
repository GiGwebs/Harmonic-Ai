import React from 'react';
import { Music, Clock, Key, Check } from 'lucide-react';
import type { SongAnalysis } from '../../types';

interface AnalysisResultsProps {
  analysis: SongAnalysis;
  savedId?: string;
}

export function AnalysisResults({ analysis, savedId }: AnalysisResultsProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Analysis Results</h2>
        {savedId && (
          <div className="flex items-center text-green-600 text-sm">
            <Check className="w-4 h-4 mr-1" />
            Saved to database
          </div>
        )}
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        <ResultCard
          icon={<Music className="w-6 h-6" />}
          title="Musical Elements"
          items={[
            `Key: ${analysis.musicalElements.key || 'N/A'}`,
            `Time Signature: ${analysis.musicalElements.timeSignature || 'N/A'}`,
            `Dominant Instruments: ${analysis.musicalElements.dominantInstruments?.join(', ') || 'N/A'}`
          ]}
        />
        
        <ResultCard
          icon={<Clock className="w-6 h-6" />}
          title="Production Techniques"
          items={analysis.productionTechniques}
        />
        
        <ResultCard
          icon={<Key className="w-6 h-6" />}
          title="Commercial Viability"
          items={[
            `Score: ${analysis.commercialViability.score}/10`,
            ...analysis.commercialViability.factors
          ]}
        />
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3">Lyrical Themes</h3>
        <div className="flex flex-wrap gap-2">
          {analysis.lyricalThemes.map((theme, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
            >
              {theme}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

interface ResultCardProps {
  icon: React.ReactNode;
  title: string;
  items: string[];
}

function ResultCard({ icon, title, items }: ResultCardProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center mb-4">
        <div className="text-purple-600 mr-2">{icon}</div>
        <h3 className="font-semibold">{title}</h3>
      </div>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="text-sm text-gray-600">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}