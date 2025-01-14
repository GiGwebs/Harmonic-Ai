import React from 'react';
import { render, screen } from '@testing-library/react';
import { PianoRoll } from '../../components/analysis/PianoRoll';

// Mock canvas context
const mockContext = {
  clearRect: jest.fn(),
  fillRect: jest.fn(),
  fillStyle: '',
  strokeStyle: '',
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  stroke: jest.fn(),
};

// Mock canvas element
HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue(mockContext);

describe('PianoRoll', () => {
  const defaultProps = {
    notes: [
      { pitch: 60, startTime: 0, endTime: 1, velocity: 100 },
      { pitch: 64, startTime: 0.5, endTime: 1.5, velocity: 80 },
    ],
    currentTime: 0,
    width: 600,
    height: 300,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with valid props', () => {
    render(<PianoRoll {...defaultProps} />);
    const canvas = screen.getByTestId('piano-roll-canvas');
    expect(canvas).toBeInTheDocument();
    expect(canvas).toHaveAttribute('width', '600');
    expect(canvas).toHaveAttribute('height', '300');
  });

  it('handles empty notes array', () => {
    render(<PianoRoll {...defaultProps} notes={[]} />);
    const canvas = screen.getByTestId('piano-roll-canvas');
    expect(canvas).toBeInTheDocument();
    expect(mockContext.clearRect).toHaveBeenCalled();
  });

  it('updates when currentTime changes', () => {
    const { rerender } = render(<PianoRoll {...defaultProps} />);
    rerender(<PianoRoll {...defaultProps} currentTime={1} />);
    expect(mockContext.clearRect).toHaveBeenCalled();
  });

  it('handles resize', () => {
    const { rerender } = render(<PianoRoll {...defaultProps} />);
    rerender(<PianoRoll {...defaultProps} width={800} height={400} />);
    const canvas = screen.getByTestId('piano-roll-canvas');
    expect(canvas).toHaveAttribute('width', '800');
    expect(canvas).toHaveAttribute('height', '400');
  });

  it('handles notes outside time range', () => {
    const outOfRangeNotes = [
      { pitch: 60, startTime: -1, endTime: -0.5, velocity: 100 },
      { pitch: 64, startTime: 10, endTime: 11, velocity: 80 },
    ];
    render(<PianoRoll {...defaultProps} notes={outOfRangeNotes} />);
    expect(mockContext.clearRect).toHaveBeenCalled();
  });
});