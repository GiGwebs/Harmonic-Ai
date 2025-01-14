import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Mock canvas
const mockCanvas2DContext = {
  canvas: document.createElement('canvas'),
  getContextAttributes: jest.fn(),
  fillRect: jest.fn(),
  clearRect: jest.fn(),
  getImageData: jest.fn(() => ({
    data: new Uint8ClampedArray(4),
  })),
  putImageData: jest.fn(),
  createImageData: jest.fn(),
  setTransform: jest.fn(),
  drawImage: jest.fn(),
  save: jest.fn(),
  fillText: jest.fn(),
  restore: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  closePath: jest.fn(),
  stroke: jest.fn(),
  strokeRect: jest.fn(),
  measureText: jest.fn(() => ({ width: 0 })),
  scale: jest.fn(),
  rotate: jest.fn(),
  arc: jest.fn(),
  fill: jest.fn(),
  rect: jest.fn(),
  clip: jest.fn(),
  // Add all other required CanvasRenderingContext2D properties
  globalAlpha: 1,
  globalCompositeOperation: 'source-over',
  imageSmoothingEnabled: true,
  imageSmoothingQuality: 'low',
  fillStyle: '#000000',
  strokeStyle: '#000000',
  shadowBlur: 0,
  shadowColor: '#000000',
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  lineCap: 'butt',
  lineDashOffset: 0,
  lineJoin: 'miter',
  lineWidth: 1,
  miterLimit: 10,
  font: '10px sans-serif',
  textAlign: 'start',
  textBaseline: 'alphabetic',
  direction: 'ltr',
} as unknown as CanvasRenderingContext2D;

// Mock getContext with correct type signature
HTMLCanvasElement.prototype.getContext = jest.fn(function(this: HTMLCanvasElement, contextId: string, options?: any) {
  if (contextId === '2d') {
    return mockCanvas2DContext;
  }
  return null;
}) as unknown as {
  (contextId: '2d', options?: CanvasRenderingContext2DSettings): CanvasRenderingContext2D | null;
  (contextId: 'bitmaprenderer', options?: ImageBitmapRenderingContextSettings): ImageBitmapRenderingContext | null;
  (contextId: 'webgl', options?: WebGLContextAttributes): WebGLRenderingContext | null;
  (contextId: 'webgl2', options?: WebGLContextAttributes): WebGL2RenderingContext | null;
};

// Mock ResizeObserver
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock IntersectionObserver
class IntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock window properties
Object.defineProperty(window, 'ResizeObserver', { value: ResizeObserver });
Object.defineProperty(window, 'IntersectionObserver', { value: IntersectionObserver });

// Mock Web Audio API
window.AudioContext = jest.fn().mockImplementation(() => ({
  createAnalyser: jest.fn().mockReturnValue({
    connect: jest.fn(),
    disconnect: jest.fn(),
    getByteFrequencyData: jest.fn(),
    getByteTimeDomainData: jest.fn(),
    fftSize: 2048,
    frequencyBinCount: 1024,
  }),
  createBuffer: jest.fn().mockReturnValue({
    duration: 2,
    length: 88200,
    numberOfChannels: 2,
    sampleRate: 44100,
    getChannelData: jest.fn().mockReturnValue(new Float32Array(88200)),
  }),
  createBufferSource: jest.fn().mockReturnValue({
    connect: jest.fn(),
    disconnect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
  }),
  createGain: jest.fn().mockReturnValue({
    connect: jest.fn(),
    disconnect: jest.fn(),
    gain: { value: 1 },
  }),
  createOscillator: jest.fn().mockReturnValue({
    connect: jest.fn(),
    disconnect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    frequency: { value: 440 },
  }),
  destination: {},
  sampleRate: 44100,
  state: 'running',
  close: jest.fn(),
}));

// Mock TextEncoder/TextDecoder
global.TextEncoder = TextEncoder;
// Create a custom TextDecoder that matches the expected interface
const CustomTextDecoder = TextDecoder as unknown as {
  new(label?: string, options?: TextDecoderOptions): {
    decode(input?: AllowSharedBufferSource, options?: TextDecodeOptions): string;
    readonly encoding: string;
    readonly fatal: boolean;
    readonly ignoreBOM: boolean;
  };
};
global.TextDecoder = CustomTextDecoder;

// Clean up mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});
