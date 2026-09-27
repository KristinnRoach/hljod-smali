import { createSignal, onCleanup, type Component } from 'solid-js';
import { featureFlag } from '@/lib/featureFlag';
import { getSamplePlayer } from '@/sampler/samplePlayer';
import { playSequence, recordSequence, type Sequence } from './sequence';

// ponytail: flagged while the Sequence is a PoC; drop the flag if it ships.
export const sequenceShown = featureFlag('sequence', 'Sequence recorder');

/** Records live notes into a Sequence and loops it. Stopping a recording starts the loop. */
const SequenceControls: Component<{ class?: string }> = (props) => {
  const [mode, setMode] = createSignal<'idle' | 'recording' | 'playing'>('idle');
  let sequence: Sequence | null = null;
  let stopRecording: (() => Sequence | null) | undefined;
  let stopPlayback: (() => void) | undefined;

  const togglePlay = () => {
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
  };

  const toggleRecord = () => {
    if (stopRecording) {
      sequence = stopRecording() ?? sequence;
      stopRecording = undefined;
      setMode('idle');
      togglePlay();
      return;
    }
    if (stopPlayback) togglePlay();
    stopRecording = recordSequence();
    setMode('recording');
  };

  onCleanup(() => {
    stopRecording?.();
    stopPlayback?.();
  });

  return (
    <div class={props.class}>
      <button type="button" onClick={toggleRecord} aria-pressed={mode() === 'recording'}>
        {mode() === 'recording' ? 'Stop rec' : 'Rec'}
      </button>
      <button type="button" onClick={togglePlay} disabled={mode() === 'recording'}>
        {mode() === 'playing' ? 'Stop' : 'Play'}
      </button>
    </div>
  );
};

export default SequenceControls;
