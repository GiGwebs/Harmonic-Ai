// Import required utilities
const util = require('util');
import '@testing-library/jest-dom';

// Setup TextEncoder/TextDecoder
(global as any).TextEncoder = util.TextEncoder;
(global as any).TextDecoder = util.TextDecoder;

// Import and setup browser API mocks
import {
  mockCanvas,
  mockCanvasContext,
  mockAudioContext,
  mockResizeObserver,
  mockReadableStream,
  mockAudioBuffer,
} from './__tests__/mocks/browserAPIs';

// Mock framer-motion
const mockMotion = {
  div: 'div',
  span: 'span',
  button: 'button',
  nav: 'nav',
  ul: 'ul',
  li: 'li',
  p: 'p',
  section: 'section',
  article: 'article',
  aside: 'aside',
  header: 'header',
  footer: 'footer',
  main: 'main',
};

jest.mock('framer-motion', () => ({
  motion: new Proxy(mockMotion, {
    get: (target, prop) => {
      if (prop in target) {
        return target[prop as keyof typeof mockMotion];
      }
      return 'div';
    },
  }),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  useAnimation: () => ({
    start: jest.fn(),
    stop: jest.fn(),
    set: jest.fn(),
  }),
  useMotionValue: (initial: number) => ({
    get: () => initial,
    set: jest.fn(),
    onChange: jest.fn(),
  }),
  useTransform: () => ({
    get: jest.fn(),
    set: jest.fn(),
  }),
  useViewportScroll: () => ({
    scrollY: {
      get: () => 0,
      onChange: jest.fn(),
    },
  }),
}));

// Initialize all mocks
beforeAll(() => {
  // Mock canvas and context
  mockCanvas();
  mockCanvasContext();
  
  // Mock audio APIs
  mockAudioBuffer();
  mockAudioContext();
  
  // Mock other browser APIs
  mockResizeObserver();
  mockReadableStream();
});

// Clean up mocks before each test
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
});
