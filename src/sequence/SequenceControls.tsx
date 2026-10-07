import { onCleanup, type Component } from 'solid-js';
import { featureFlag } from '@/lib/featureFlag';
import {
  playMidiFile,
  sequenceMode as mode,
  stopSequence,
  togglePlay,
  toggleRecord,
} from './sequenceTransport';

// ponytail: flagged while the Sequence is a PoC; drop the flag if it ships.
export const sequenceShown = featureFlag('sequence', 'Sequence recorder');

/**
 * Records live notes into a Sequence, or loads one from a MIDI file, and loops
 * it. Stopping a recording or loading a file starts the loop.
 */
const SequenceControls: Component<{ class?: string }> = (props) => {
  let midiInput!: HTMLInputElement;

  const loadMidiFile = (event: Event & { currentTarget: HTMLInputElement }) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    playMidiFile(file).catch((error) => console.warn(`Could not load ${file.name}:`, error));
  };

  onCleanup(stopSequence);

  return (
    <div
      class={props.class}
      style={{
        display: sequenceShown() ? 'flex' : 'none',
        'justify-content': 'center',
        gap: '0.5rem',
        padding: '0.5rem',
      }}
    >
      <button
        type="button"
        onClick={toggleRecord}
        aria-pressed={mode() === 'recording'}
        style={{ background: mode() === 'recording' ? 'red' : undefined, 'border-radius': '4px' }}
      >
        {mode() === 'recording' ? 'Stop rec' : 'Rec'}
      </button>
      <button
        type="button"
        onClick={togglePlay}
        disabled={mode() === 'recording'}
        style={{ background: mode() === 'playing' ? 'green' : undefined, 'border-radius': '4px' }}
      >
        {mode() === 'playing' ? 'Stop' : 'Play'}
      </button>
      <button
        type="button"
        onClick={() => midiInput.click()}
        disabled={mode() === 'recording'}
        style={{ background: undefined, 'border-radius': '4px' }}
      >
        MIDI file
      </button>
      <input
        ref={midiInput}
        type="file"
        accept=".mid,.midi,audio/midi"
        aria-label="Load MIDI file"
        hidden
        onChange={loadMidiFile}
      />
    </div>
  );
};

export default SequenceControls;
