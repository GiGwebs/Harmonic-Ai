import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AnalyzePage } from '../../pages/AnalyzePage';
import '@testing-library/jest-dom';

const mockResponse = {
  metadata: {
    title: 'Test Song',
    artist: 'Test Artist',
  },
  musicalElements: {
    key: 'C major',
    tempo: '120 BPM',
    timeSignature: '4/4',
    dominantInstruments: ['Piano', 'Guitar'],
  },
  commercialViability: {
    score: 85,
    factors: ['Strong melody', 'Good production'],
  },
  lyricalThemes: ['Love', 'Hope'],
  productionTechniques: ['Layered vocals', 'Dynamic compression'],
  sections: [
    {
      type: 'verse',
      content: 'Test verse content',
      analysis: {
        complexity: 'medium',
        moods: ['energetic'],
        impact: 75,
      },
    },
  ],
  uniqueCharacteristics: ['Catchy hook', 'Memorable melody'],
  sentimentAnalysis: {
    sentimentScore: 0.8,
    sentimentLabel: 'positive',
    emotionalTone: 'uplifting',
    summary: 'The song has a positive emotional tone',
  },
};

describe('AnalyzePage Integration', () => {
  beforeEach(() => {
    // Mock fetch
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })
    ) as jest.Mock;
  });

  it('handles successful analysis', async () => {
    render(<AnalyzePage />);
    
    // Fill in URL
    const urlInput = screen.getByPlaceholderText(/Enter song URL/i);
    fireEvent.change(urlInput, { target: { value: 'https://example.com/song.mp3' } });
    
    // Click analyze button
    const analyzeButton = screen.getByRole('button', { name: /analyze song/i });
    fireEvent.click(analyzeButton);
    
    // Wait for analysis results
    await waitFor(() => {
      expect(screen.getByText(/positive/i)).toBeInTheDocument();
      expect(screen.getByText(/120 BPM/i)).toBeInTheDocument();
      expect(screen.getByText(/C major/i)).toBeInTheDocument();
    });
  });

  it('handles analysis error', async () => {
    // Mock fetch to return an error
    global.fetch = jest.fn(() =>
      Promise.reject(new Error('Failed to analyze song'))
    ) as jest.Mock;

    render(<AnalyzePage />);
    
    // Fill in URL
    const urlInput = screen.getByPlaceholderText(/Enter song URL/i);
    fireEvent.change(urlInput, { target: { value: 'https://example.com/song.mp3' } });
    
    // Click analyze button
    const analyzeButton = screen.getByRole('button', { name: /analyze song/i });
    fireEvent.click(analyzeButton);
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/Failed to analyze song/i)).toBeInTheDocument();
    });
  });
});
