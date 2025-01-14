import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StructureAnalysis } from '../StructureAnalysis';
import '@testing-library/jest-dom';

const mockSections = [
  {
    type: 'verse',
    content: 'Test verse content',
    analysis: {
      complexity: 'medium',
      moods: ['neutral'],
      impact: 72,
    },
  },
  {
    type: 'chorus',
    content: 'Test chorus content',
    analysis: {
      complexity: 'high',
      moods: ['energetic'],
      impact: 85,
    },
  },
];

const mockPreferences = {
  // Add mock preferences data here
};

const mockSectionInsights = {
  // Add mock section insights data here
};

// Mock ResizeObserver for testing
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

describe('StructureAnalysis Component', () => {
  const defaultProps = {
    sections: mockSections,
    preferences: mockPreferences,
    onSearch: jest.fn(),
    onFilter: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Rendering Tests
  describe('Rendering', () => {
    it('renders all sections', () => {
      render(<StructureAnalysis {...defaultProps} />);
      expect(screen.getByText('verse')).toBeInTheDocument();
      expect(screen.getByText('chorus')).toBeInTheDocument();
    });

    it('renders empty state when no sections provided', () => {
      render(<StructureAnalysis {...defaultProps} sections={[]} />);
      expect(screen.getByText(/No sections available/i)).toBeInTheDocument();
    });

    it('renders section insights correctly', async () => {
      render(<StructureAnalysis {...defaultProps} />);
      
      // Click to expand first section
      const verseSection = screen.getByText(/verse/i);
      fireEvent.click(verseSection);
      
      // Check if insights are displayed
      await waitFor(() => {
        expect(screen.getByText(/Analysis/i)).toBeInTheDocument();
        expect(screen.getByText(/Recommendations/i)).toBeInTheDocument();
      });
    });
  });

  // Interaction Tests
  describe('User Interactions', () => {
    it('handles search input', async () => {
      render(<StructureAnalysis {...defaultProps} />);
      const searchInput = screen.getByPlaceholderText('Search sections...');
      fireEvent.change(searchInput, { target: { value: 'ver' } });

      await waitFor(() => {
        expect(defaultProps.onSearch).toHaveBeenCalledWith('ver');
      });
    });

    it('shows filter button', () => {
      render(<StructureAnalysis {...defaultProps} />);
      const filterButton = screen.getByRole('button', { name: /show filters/i });
      expect(filterButton).toBeInTheDocument();
    });

    it('displays section details correctly', () => {
      render(<StructureAnalysis {...defaultProps} />);
      expect(screen.getByText('72%')).toBeInTheDocument();
      expect(screen.getByText('neutral')).toBeInTheDocument();
    });

    it('expands section on click', () => {
      render(<StructureAnalysis {...defaultProps} />);
      const verseSection = screen.getByText('verse');
      fireEvent.click(verseSection);
      expect(screen.getByText('Test verse content')).toBeInTheDocument();
    });
  });

  // Accessibility Tests
  describe('Accessibility', () => {
    it('supports keyboard navigation', async () => {
      render(<StructureAnalysis {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText('Search sections...');
      await userEvent.tab();
      expect(document.activeElement).toBe(searchInput);
    });

    it('provides appropriate ARIA attributes', () => {
      render(<StructureAnalysis {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText('Search sections...');
      expect(searchInput).toHaveAttribute('aria-label', 'Search sections');
      
      const sectionsList = screen.getByRole('list');
      expect(sectionsList).toHaveAttribute('aria-label', 'Song sections');
    });

    it('maintains focus management', async () => {
      render(<StructureAnalysis {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText('Search sections...');
      await userEvent.tab();
      expect(document.activeElement).toBe(searchInput);
      
      await userEvent.tab();
      const filterButton = screen.getByRole('button', { name: /show filters/i });
      expect(document.activeElement).toBe(filterButton);
    });
  });

  // Performance Tests
  describe('Performance', () => {
    it('handles large datasets efficiently', async () => {
      const largeMockSections = Array(100).fill(null).map((_, i) => ({
        ...mockSections[0],
        id: `section-${i}`,
      }));

      const startTime = performance.now();
      render(<StructureAnalysis {...defaultProps} sections={largeMockSections} />);
      const renderTime = performance.now() - startTime;
      
      expect(renderTime).toBeLessThan(1000); // Should render in less than 1 second
    });

    it('debounces search input', async () => {
      const mockHandleSearch = jest.fn();
      
      render(
        <StructureAnalysis 
          {...defaultProps}
          onSearch={mockHandleSearch} 
        />
      );
      
      const searchInput = screen.getByPlaceholderText('Search sections...');
      
      // Type multiple characters quickly
      await userEvent.type(searchInput, 'test');
      
      // Should not call handler immediately
      expect(mockHandleSearch).not.toHaveBeenCalled();
      
      // Wait for debounce
      await waitFor(() => {
        expect(mockHandleSearch).toHaveBeenCalledWith('test');
      }, { timeout: 1000 });
      
      expect(mockHandleSearch).toHaveBeenCalledTimes(1);
    });
  });

  // Error Handling Tests
  describe('Error Handling', () => {
    it('handles malformed section data gracefully', () => {
      const malformedSections = [
        { ...mockSections[0], type: 'invalid' },
        { ...mockSections[1], content: undefined },
      ];
      
      render(<StructureAnalysis {...defaultProps} sections={malformedSections as any} />);
      
      expect(screen.queryByText(/Error/i)).not.toBeInTheDocument();
      expect(screen.getByText(/invalid/i)).toBeInTheDocument();
    });

    it('handles missing preferences gracefully', () => {
      render(<StructureAnalysis {...defaultProps} preferences={undefined as any} />);
      
      expect(screen.queryByText(/Error/i)).not.toBeInTheDocument();
      expect(screen.getByText(/verse/i)).toBeInTheDocument();
    });
  });
});
