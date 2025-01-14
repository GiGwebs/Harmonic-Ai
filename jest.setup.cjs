require('@testing-library/jest-dom');
require('node-globals');

// Mock TextEncoder/TextDecoder
global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;

// Mock AudioBuffer
class AudioBufferMock {
  constructor({ length = 0, numberOfChannels = 1, sampleRate = 44100 }) {
    this.length = length;
    this.duration = length / sampleRate;
    this.sampleRate = sampleRate;
    this.numberOfChannels = numberOfChannels;
    this._channelData = Array(numberOfChannels).fill().map(() => 
      new Float32Array(length).fill(0)
    );
  }

  getChannelData(channel) {
    return this._channelData[channel];
  }

  copyFromChannel(destination, channelNumber, startInChannel = 0) {
    const source = this._channelData[channelNumber];
    for (let i = 0; i < destination.length; i++) {
      destination[i] = source[startInChannel + i];
    }
  }

  copyToChannel(source, channelNumber, startInChannel = 0) {
    const destination = this._channelData[channelNumber];
    for (let i = 0; i < source.length; i++) {
      destination[startInChannel + i] = source[i];
    }
  }
}

global.AudioBuffer = AudioBufferMock;

// Mock canvas
const mockCanvas2DContext = {
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
  scale: jest.fn(),
  restore: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  stroke: jest.fn(),
  fill: jest.fn(),
  arc: jest.fn(),
  closePath: jest.fn(),
  fillText: jest.fn(),
  strokeStyle: '#000000',
  fillStyle: '#000000',
  lineWidth: 1,
  font: '10px sans-serif',
  textAlign: 'start',
  textBaseline: 'alphabetic',
  direction: 'ltr',
  globalAlpha: 1.0,
  globalCompositeOperation: 'source-over',
  imageSmoothingEnabled: true,
  lineCap: 'butt',
  lineJoin: 'miter',
  miterLimit: 10,
  shadowBlur: 0,
  shadowColor: 'rgba(0, 0, 0, 0)',
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  canvas: {
    width: 600,
    height: 300,
  },
};

class CanvasMock {
  constructor() {
    this.width = 600;
    this.height = 300;
  }

  getContext(type) {
    if (type === '2d') {
      return mockCanvas2DContext;
    }
    return null;
  }

  toDataURL() {
    return '';
  }
}

global.HTMLCanvasElement = CanvasMock;

// Mock Web Audio API
class AnalyserNodeMock {
  constructor() {
    this.frequencyBinCount = 1024;
    this.fftSize = 2048;
    this.minDecibels = -100;
    this.maxDecibels = -30;
    this.smoothingTimeConstant = 0.8;
  }

  connect() {}
  disconnect() {}

  getFloatFrequencyData(array) {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.random() * (this.maxDecibels - this.minDecibels) + this.minDecibels;
    }
  }

  getByteFrequencyData(array) {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }

  getFloatTimeDomainData(array) {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.random() * 2 - 1;
    }
  }
}

class AudioContextMock {
  constructor() {
    this.state = 'running';
    this.sampleRate = 44100;
    this.destination = {
      channelCount: 2,
      channelCountMode: 'explicit',
      channelInterpretation: 'speakers',
      maxChannelCount: 2,
      numberOfInputs: 1,
      numberOfOutputs: 0,
      connect: jest.fn(),
      disconnect: jest.fn(),
    };
  }

  createAnalyser() {
    return new AnalyserNodeMock();
  }

  createGain() {
    return {
      connect: jest.fn(),
      disconnect: jest.fn(),
      gain: {
        value: 1,
        setValueAtTime: jest.fn(),
      },
    };
  }

  createOscillator() {
    return {
      connect: jest.fn(),
      disconnect: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
      frequency: {
        setValueAtTime: jest.fn(),
      },
    };
  }

  createBuffer(numChannels, length, sampleRate) {
    return new AudioBufferMock({
      numberOfChannels: numChannels,
      length: length,
      sampleRate: sampleRate
    });
  }

  createBufferSource() {
    return {
      connect: jest.fn(),
      disconnect: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
      buffer: null,
    };
  }

  close() {}
  resume() {}
  suspend() {}
}

global.AudioContext = AudioContextMock;
global.webkitAudioContext = AudioContextMock;

// Mock window.URL
global.URL.createObjectURL = jest.fn();
global.URL.revokeObjectURL = jest.fn();
