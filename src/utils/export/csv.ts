import type { SongAnalysis } from '../../types';

export function exportToCsv(analysis: SongAnalysis): void {
  const rows = [
    ['Property', 'Value'],
    ['Key', analysis.musicalElements.key || 'Unknown'],
    ['Tempo', analysis.musicalElements.tempo?.toString() || 'Unknown'],
    ['Time Signature', analysis.musicalElements.timeSignature || 'Unknown'],
    ['Dominant Instruments', analysis.musicalElements.dominantInstruments?.join(', ') || 'Unknown'],
    ['Commercial Score', analysis.commercialViability.score.toString()],
    ['Commercial Factors', analysis.commercialViability.factors.join(', ')],
    ['Production Techniques', analysis.productionTechniques.join(', ')],
    ['Lyrical Themes', analysis.lyricalThemes.join(', ')]
  ];

  const csvContent = rows
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'analysis.csv');
  link.click();
  
  URL.revokeObjectURL(url);
}