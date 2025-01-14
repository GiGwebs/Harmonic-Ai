import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { StructureAnalysis } from '../../components/analysis/StructureAnalysis';
import { AnalyzedSection, Preferences } from '../../types';
import '@testing-library/jest-dom';

describe('StructureAnalysis Component', () => {
  const mockSections: AnalyzedSection[] = [
    {
      id: '1',
      type: 'verse',
      content: 'Test verse content',
      analysis: {
        complexity: 'simple',
        moods: ['joyful'],
        impact: 80,
        recommendations: ['Focus on narrative progression']
      }
    },
    {
      id: '2',
      type: 'chorus',
      content: 'Test chorus content',
      analysis: {
        complexity: 'intermediate',
        moods: ['energetic'],
        impact: 90,
        recommendations: ['Emphasize the main hook']
      }
    }
  ];

  const mockPreferences: Preferences = {
    advancedFilters: {
      sectionTypes: [],
      complexity: [],
      mood: [],
      themes: []
    },
    filterPresets: [],
    activePresetId: null,
    snapScrollingEnabled: true
  };

  const defaultProps = {
    sections: mockSections,
    preferences: mockPreferences,
    onSearch: jest.fn(),
    onFilter: jest.fn(),
    isLoading: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<StructureAnalysis {...defaultProps} />);
    expect(screen.getByText(/Test verse content/i)).toBeInTheDocument();
  });

  it('displays loading state correctly', () => {
    render(<StructureAnalysis {...defaultProps} isLoading={true} />);
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
  });

  it('handles empty sections array', () => {
    render(<StructureAnalysis {...defaultProps} sections={[]} />);
    expect(screen.getByText(/No sections found/i)).toBeInTheDocument();
  });

  it('renders search input correctly', () => {
    render(<StructureAnalysis {...defaultProps} />);
    const searchInput = screen.getByPlaceholderText(/Search sections/i);
    expect(searchInput).toBeInTheDocument();
  });

  it('handles search input change', () => {
    render(<StructureAnalysis {...defaultProps} />);
    const searchInput = screen.getByPlaceholderText(/Search sections/i);
    fireEvent.change(searchInput, { target: { value: 'test' } });
    expect(defaultProps.onSearch).toHaveBeenCalledWith('test');
  });

  it('displays section types correctly', () => {
    render(<StructureAnalysis {...defaultProps} />);
    expect(screen.getByText(/verse/i)).toBeInTheDocument();
    expect(screen.getByText(/chorus/i)).toBeInTheDocument();
  });

  it('displays section analysis information', () => {
    render(<StructureAnalysis {...defaultProps} />);
    expect(screen.getByText(/simple/i)).toBeInTheDocument();
    expect(screen.getByText(/joyful/i)).toBeInTheDocument();
  });

  it('handles filter changes', () => {
    render(<StructureAnalysis {...defaultProps} />);
    const filterButton = screen.getByText(/Filters/i);
    fireEvent.click(filterButton);
    expect(screen.getByText(/Section Types/i)).toBeInTheDocument();
  });

  it('displays impact scores correctly', () => {
    render(<StructureAnalysis {...defaultProps} />);
    expect(screen.getByText('80')).toBeInTheDocument();
    expect(screen.getByText('90')).toBeInTheDocument();
  });
});
