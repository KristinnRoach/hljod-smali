import { createSignal } from 'solid-js';
import { getSamplePlayer } from '@/sampler/samplePlayer';
import { parseMidiFile } from './parseMidiFile';
import { playSequence, recordSequence, type Sequence } from './sequence';

// Module scope, not component state, so the console and WebMCP can drive it too.
const [mode, setMode] = createSignal<'idle' | 'recording' | 'playing'>('idle');
export const sequenceMode = mode;

let sequence: Sequence | null = null;
let stopRecording: (() => Sequence | null) | undefined;
let stopPlayback: (() => void) | undefined;
let loadGeneration = 0;

export const EXAMPLE_MIDI_URL = `${import.meta.env.BASE_URL}midi/NeverGonnaGiveYouUp.mid`;

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
  loadGeneration++;
  stopRecording?.();
  stopRecording = undefined;
  stopPlayback?.();
  stopPlayback = undefined;
  setMode('idle');
}

/** Loads a MIDI file as the Sequence and starts looping it. */
export async function playMidiFile(file: Blob | string | null = EXAMPLE_MIDI_URL): Promise<string> {
  if (file === null) {
    stopSequence();
    return 'Stopped.';
  }
  if (!getSamplePlayer()) throw new Error('Sampler is not ready.');
  const generation = ++loadGeneration;
  let data: ArrayBuffer;
  try {
    if (typeof file === 'string') {
      const response = await fetch(file);
      if (!response.ok) throw new Error(`Could not fetch ${file}: ${response.status}`);
      data = await response.arrayBuffer();
    } else {
      data = await file.arrayBuffer();
    }
  } catch (error) {
    if (generation !== loadGeneration) return 'MIDI load cancelled.';
    throw error;
  }
  if (generation !== loadGeneration) return 'MIDI load cancelled.';
  const loaded = parseMidiFile(data);
  if (!loaded) throw new Error('The MIDI file has no notes.');
  const notes = loaded.events.filter(({ velocity }) => velocity > 0).length;
  if (notes === 0 || loaded.length <= 0) throw new Error('The MIDI file has no notes.');
  stopSequence();
  sequence = loaded;
  togglePlay();
  return `Looping ${notes} notes, ${loaded.length.toFixed(1)}s long.`;
}

// Console: playMidiFile() plays the example, playMidiFile(url) another file, null stops.
Object.assign(window, { playMidiFile });
