interface Note {
  pitch: number;
  startTime: number;
  duration: number;
  velocity: number;
}

export function exportToMidi(notes: Note[]): void {
  // Basic MIDI file structure
  const header = createMidiHeader();
  const trackData = createTrackEvents(notes);
  const blob = new Blob([header, trackData], { type: 'audio/midi' });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'melody.mid';
  link.click();
  
  URL.revokeObjectURL(url);
}

function createMidiHeader(): Uint8Array {
  return new Uint8Array([
    0x4D, 0x54, 0x68, 0x64, // MThd
    0x00, 0x00, 0x00, 0x06, // Header size
    0x00, 0x01, // Format type
    0x00, 0x01, // Number of tracks
    0x00, 0x60  // Time division (96 ticks per quarter note)
  ]);
}

function createTrackEvents(notes: Note[]): Uint8Array {
  const events: number[] = [
    0x4D, 0x54, 0x72, 0x6B, // MTrk
    0x00, 0x00, 0x00, 0x00  // Placeholder for track length
  ];

  // Add note events
  notes.forEach(note => {
    // Note on
    events.push(
      0x00, 0x90,
      note.pitch,
      Math.round(note.velocity * 127)
    );

    // Note off
    events.push(
      Math.round(note.duration * 96),
      0x80,
      note.pitch,
      0x00
    );
  });

  // End of track
  events.push(0x00, 0xFF, 0x2F, 0x00);

  // Update track length
  const length = events.length - 8;
  events[4] = (length >> 24) & 0xFF;
  events[5] = (length >> 16) & 0xFF;
  events[6] = (length >> 8) & 0xFF;
  events[7] = length & 0xFF;

  return new Uint8Array(events);
}