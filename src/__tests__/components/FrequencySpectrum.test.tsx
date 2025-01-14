import React from 'react';
import { render, screen } from '@testing-library/react';
import { FrequencySpectrum } from '../../components/analysis/FrequencySpectrum';
import { mockWebAudio } from '../mocks/webAudio';

// Set up Web Audio API mock
mockWebAudio();

describe('FrequencySpectrum', () => {
  beforeEach(() => {
    // Create a canvas mock since JSDOM doesn't support canvas
    const canvas = document.createElement('canvas');
    canvas.getContext = jest.fn().mockReturnValue({
      clearRect: jest.fn(),
      fillRect: jest.fn(),
      fillStyle: '',
    });
    jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'canvas') return canvas;
      return document.createElement(tagName);
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', () => {
    const buffer = new AudioContext().createBuffer(2, 44100, 44100);
    render(<FrequencySpectrum audioBuffer={buffer} />);
    expect(screen.getByRole('img', { name: /frequency spectrum/i })).toBeInTheDocument();
  });

  it('updates when audio buffer changes', () => {
    const ctx = new AudioContext();
    const buffer1 = ctx.createBuffer(1, 44100, 44100);
    const buffer2 = ctx.createBuffer(1, 88200, 44100);
    
    const { rerender } = render(<FrequencySpectrum audioBuffer={buffer1} />);
    const canvas = screen.getByRole('img', { name: /frequency spectrum/i });
    expect(canvas).toBeInTheDocument();

    rerender(<FrequencySpectrum audioBuffer={buffer2} />);
    expect(canvas).toBeInTheDocument();
  });

  it('handles null buffer gracefully', () => {
    render(<FrequencySpectrum audioBuffer={null} />);
    expect(screen.getByRole('img', { name: /frequency spectrum/i })).toBeInTheDocument();
  });
});