// Type extensions for mocked APIs
declare global {
  interface CanvasRenderingContext2D {
    _mockClearRect: jest.Mock;
    _mockFillRect: jest.Mock;
    _mockStrokeRect: jest.Mock;
    _mockFillText: jest.Mock;
    _mockMeasureText: jest.Mock;
    _mockBeginPath: jest.Mock;
    _mockMoveTo: jest.Mock;
    _mockLineTo: jest.Mock;
    _mockStroke: jest.Mock;
    _mockFill: jest.Mock;
  }

  interface HTMLCanvasElement {
    _mockGetContext: jest.Mock;
  }

  interface AudioContext {
    _mockCreateAnalyser: jest.Mock;
    _mockCreateGain: jest.Mock;
    _mockCreateOscillator: jest.Mock;
    _mockCreateBuffer: jest.Mock;
    _mockCreateBufferSource: jest.Mock;
    _mockClose: jest.Mock;
  }
}

// Create mock class implementations
class MockCanvasRenderingContext2D {
  fillStyle: string = '#000000';
  strokeStyle: string = '#000000';
  lineWidth: number = 1;
  font: string = '10px sans-serif';

  clearRect = jest.fn();
  fillRect = jest.fn();
  strokeRect = jest.fn();
  fillText = jest.fn();
  measureText = jest.fn(() => ({ width: 0 }));
  beginPath = jest.fn();
  moveTo = jest.fn();
  lineTo = jest.fn();
  stroke = jest.fn();
  fill = jest.fn();
}

class MockHTMLCanvasElement {
  getContext = jest.fn((contextId: string) => {
    if (contextId === '2d') return new MockCanvasRenderingContext2D();
    return null;
  });
}

class MockAudioBuffer {
  constructor(options: { length: number; numberOfChannels: number; sampleRate: number }) {
    this.length = options.length;
    this.numberOfChannels = options.numberOfChannels;
    this.sampleRate = options.sampleRate;
    this.duration = options.length / options.sampleRate;
  }

  length: number;
  numberOfChannels: number;
  sampleRate: number;
  duration: number;

  getChannelData = jest.fn((channel: number) => new Float32Array(this.length));
  copyFromChannel = jest.fn();
  copyToChannel = jest.fn();
}

// Mock implementations
export const mockCanvasContext = () => {
  (global as any).CanvasRenderingContext2D = MockCanvasRenderingContext2D;
  return new MockCanvasRenderingContext2D();
};

export const mockCanvas = () => {
  (global as any).HTMLCanvasElement = MockHTMLCanvasElement;
  return new MockHTMLCanvasElement();
};

export const mockAudioBuffer = () => {
  (global as any).AudioBuffer = MockAudioBuffer;
};

export const mockAudioContext = () => {
  const analyser = {
    connect: jest.fn(),
    disconnect: jest.fn(),
    fftSize: 2048,
    frequencyBinCount: 1024,
    getByteFrequencyData: jest.fn(),
    getFloatFrequencyData: jest.fn(),
  };

  const gain = {
    connect: jest.fn(),
    disconnect: jest.fn(),
    gain: { value: 1 },
  };

  const oscillator = {
    connect: jest.fn(),
    disconnect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    frequency: { value: 440 },
  };

  const bufferSource = {
    connect: jest.fn(),
    disconnect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    buffer: null,
  };

  class MockAudioContext {
    createAnalyser = jest.fn(() => analyser);
    createGain = jest.fn(() => gain);
    createOscillator = jest.fn(() => oscillator);
    createBuffer = jest.fn((channels: number, length: number, sampleRate: number) => {
      return new MockAudioBuffer({ length, numberOfChannels: channels, sampleRate });
    });
    createBufferSource = jest.fn(() => bufferSource);
    close = jest.fn(() => Promise.resolve());
    sampleRate = 44100;
    state = 'running';
  }

  (global as any).AudioContext = MockAudioContext;
  (global as any).webkitAudioContext = MockAudioContext;
  return new MockAudioContext();
};

export const mockResizeObserver = () => {
  const mockObserver = {
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  };

  class MockResizeObserver {
    constructor(callback: any) {
      return mockObserver;
    }
  }

  (global as any).ResizeObserver = MockResizeObserver;
  return mockObserver;
};

export const mockReadableStream = () => {
  const mockStream = {
    getReader: jest.fn(),
    cancel: jest.fn(),
  };

  class MockReadableStream {
    constructor(source?: any) {
      return mockStream;
    }
  }

  (global as any).ReadableStream = MockReadableStream;
  return mockStream;
};
