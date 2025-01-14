import type { PlaybackRegion } from '../../types/playback';
import { embedMetadata } from './metadata';

interface AudioExportOptions {
  audioBuffer: AudioBuffer;
  region: PlaybackRegion;
  format: 'wav' | 'mp3';
  metadata?: Record<string, unknown>;
}

export async function exportAudioRegion({
  audioBuffer,
  region,
  format,
  metadata
}: AudioExportOptions): Promise<Blob> {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const startSample = Math.floor(region.start * audioBuffer.sampleRate);
  const endSample = Math.floor(region.end * audioBuffer.sampleRate);
  const length = endSample - startSample;

  // Create a new buffer for the region
  const regionBuffer = ctx.createBuffer(
    audioBuffer.numberOfChannels,
    length,
    audioBuffer.sampleRate
  );

  // Copy the audio data for the region
  for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
    const channelData = audioBuffer.getChannelData(channel);
    const newChannelData = regionBuffer.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      newChannelData[i] = channelData[startSample + i];
    }
  }

  // Convert to blob
  const blob = await audioBufferToBlob(regionBuffer, format);
  
  // Embed metadata if provided
  return metadata ? embedMetadata(blob, metadata) : blob;
}

async function audioBufferToBlob(
  buffer: AudioBuffer,
  format: 'wav' | 'mp3'
): Promise<Blob> {
  // Note: In production, use a proper audio encoding library
  // This is a simplified WAV encoder
  const length = buffer.length * buffer.numberOfChannels * 2;
  const view = new DataView(new ArrayBuffer(44 + length));

  // WAV header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + length, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, buffer.numberOfChannels, true);
  view.setUint32(24, buffer.sampleRate, true);
  view.setUint32(28, buffer.sampleRate * buffer.numberOfChannels * 2, true);
  view.setUint16(32, buffer.numberOfChannels * 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, length, true);

  // Write audio data
  const data = new Float32Array(buffer.length * buffer.numberOfChannels);
  let offset = 44;
  for (let i = 0; i < buffer.numberOfChannels; i++) {
    data.set(buffer.getChannelData(i), i * buffer.length);
  }

  for (let i = 0; i < data.length; i++) {
    const sample = Math.max(-1, Math.min(1, data[i]));
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
    offset += 2;
  }

  return new Blob([view], { type: format === 'wav' ? 'audio/wav' : 'audio/mp3' });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}