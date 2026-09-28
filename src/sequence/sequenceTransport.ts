import { createSignal } from 'solid-js';
import { setFeatureFlag } from '@/lib/featureFlag';
import { getSamplePlayer } from '@/sampler/samplePlayer';
import { parseMidiFile } from './parseMidiFile';
import { playSequence, recordSequence, type Sequence } from './sequence';

// Module scope, not component state, so the console and WebMCP can drive it too.
const [mode, setMode] = createSignal<'idle' | 'recording' | 'playing'>('idle');
export const sequenceMode = mode;

let sequence: Sequence | null = null;
let stopRecording: (() => Sequence | null) | undefined;
let stopPlayback: (() => void) | undefined;

export const EXAMPLE_MIDI_URL = `${import.meta.env.BASE_URL}midi/Super Mario - Super Mario Bros. [MIDIfind.com].mid`;

export function togglePlay(): void {
  if (stopPlayback) {
    stopPlayback();
    stopPlayback = undefined;
    setMode('idle');
    return;
  }
  const player = getSamplePlayer();
  if (!sequence || !player) return;
  stopPlayback = playSequence(player, sequence);
  setMode('playing');
}

/** Stopping a recording starts looping the take. */
export function toggleRecord(): void {
  if (stopRecording) {
    const take = stopRecording();
    stopRecording = undefined;
    setMode('idle');
    // An empty take keeps the previous Sequence for Play, but doesn't start it.
    if (take) {
      sequence = take;
      togglePlay();
    }
    return;
  }
  if (stopPlayback) togglePlay();
  stopRecording = recordSequence();
  setMode('recording');
}

/** Stops any recording (discarding it) and playback. */
export function stopSequence(): void {
  stopRecording?.();
  stopRecording = undefined;
  stopPlayback?.();
  stopPlayback = undefined;
  setMode('idle');
}

/** Loads a MIDI file as the Sequence and starts looping it. */
export async function playMidiFile(file: Blob | string): Promise<string> {
  if (!getSamplePlayer()) throw new Error('Sampler is not ready.');
  let data: ArrayBuffer;
  if (typeof file === 'string') {
    const response = await fetch(file);
    if (!response.ok) throw new Error(`Could not fetch ${file}: ${response.status}`);
    data = await response.arrayBuffer();
  } else {
    data = await file.arrayBuffer();
  }
  const loaded = parseMidiFile(data);
  if (!loaded) throw new Error('The MIDI file has no notes.');
  stopSequence();
  sequence = loaded;
  togglePlay();
  // Show the controls so there's a Stop button.
  setFeatureFlag('sequence', true);
  const notes = loaded.events.filter(({ velocity }) => velocity > 0).length;
  return `Looping ${notes} notes, ${loaded.length.toFixed(1)}s long.`;
}

// Console: `playMidi()` plays the bundled example, `playMidi(url)` another file, `playMidi(null)` stops.
Object.assign(window, {
  playMidi: (url: string | null = EXAMPLE_MIDI_URL) =>
    url === null ? stopSequence() : playMidiFile(url),
});
