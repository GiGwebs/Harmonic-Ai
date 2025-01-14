import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SentimentAnalysis } from '../../components/analysis/SentimentAnalysis';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

jest.mock('@radix-ui/react-tooltip', () => ({
  Root: ({ children }: any) => <>{children}</>,
  Trigger: ({ children }: any) => <span>{children}</span>,
  Portal: ({ children }: any) => <>{children}</>,
  Content: ({ children }: any) => <div>{children}</div>,
  Provider: ({ children }: any) => <>{children}</>,
  Arrow: () => null,
}));

jest.mock('../../hooks/usePreferences', () => ({
  usePreferences: () => ({
    preferences: {
      tipsVisible: true,
      detailsVisible: true,
    },
    updatePreference: jest.fn(),
  }),
  useKeyboardShortcuts: () => ({
    registerShortcut: jest.fn(),
    unregisterShortcut: jest.fn(),
  }),
}));

describe('SentimentAnalysis Component', () => {
  const defaultProps = {
    sentiment: {
      mood: 'happy',
      intensity: 0.8,
      keywords: ['joy', 'energy'],
    },
    isLoading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with default props', () => {
    render(<SentimentAnalysis {...defaultProps} />);
    
    expect(screen.getByText('Sentiment Analysis')).toBeInTheDocument();
    expect(screen.getByText(/happy/i)).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument();
    expect(screen.getByText(/joy/i)).toBeInTheDocument();
    expect(screen.getByText(/energy/i)).toBeInTheDocument();
  });

  it('displays loading state', () => {
    render(<SentimentAnalysis {...defaultProps} isLoading={true} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('handles empty sentiment data', () => {
    render(
      <SentimentAnalysis
        sentiment={{ mood: '', intensity: 0, keywords: [] }}
        isLoading={false}
      />
    );
    expect(screen.getByText('No sentiment data')).toBeInTheDocument();
  });

  it('toggles details visibility', async () => {
    render(<SentimentAnalysis {...defaultProps} />);
    const toggleButton = screen.getByRole('button', { name: /toggle details/i });
    
    await userEvent.click(toggleButton);
    expect(screen.getByText(/keywords/i)).toBeInTheDocument();
  });
});
