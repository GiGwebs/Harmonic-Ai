// Mock Web Audio API
class MockAnalyserNode {
  fftSize = 2048;
  frequencyBinCount = 1024;
  minDecibels = -100;
  maxDecibels = 0;
  smoothingTimeConstant = 0.8;

  getFloatFrequencyData(array: Float32Array) {
    // Fill with mock frequency data
    for (let i = 0; i < array.length; i++) {
      array[i] = -50 + Math.random() * 50;
    }
  }

  getByteFrequencyData(array: Uint8Array) {
    // Fill with mock frequency data
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
}

class MockAudioContext {
  createAnalyser() {
    return new MockAnalyserNode();
  }

  createBuffer(numChannels: number, length: number, sampleRate: number): AudioBuffer {
    return {
      numberOfChannels: numChannels,
      length,
      sampleRate,
      duration: length / sampleRate,
      getChannelData: (channel: number) => new Float32Array(length),
    } as AudioBuffer;
  }

  close() {
    return Promise.resolve();
  }
}

// Export the mock
export const mockWebAudio = () => {
  // @ts-ignore
  global.AudioContext = MockAudioContext;
  // @ts-ignore
  global.webkitAudioContext = MockAudioContext;
};
