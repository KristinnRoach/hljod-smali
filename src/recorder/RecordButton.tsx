import type { Component, JSX } from 'solid-js';
import type { AudioRecorderState, SamplePlayer } from '@kidlib/web-audio';
import { createSampleRecorder } from './createSampleRecorder';
import iconButton from '@/ui/iconButton.module.css';

type RecordState = 'idle' | 'armed' | 'recording';

/** Requesting input looks idle and finalizing looks like recording, as before. */
const RECORD_STATE: Record<AudioRecorderState, RecordState> = {
  IDLE: 'idle',
  REQUESTING_INPUT: 'idle',
  MONITORING: 'idle',
  ARMED: 'armed',
  RECORDING: 'recording',
  FINALIZING: 'recording',
};

const ICONS: Record<RecordState, { color: string; render: () => JSX.Element }> = {
  idle: {
    color: '#FFFFFF',
    render: () => (
      <svg viewBox="0 0 24 24" fill="red" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="8" />
      </svg>
    ),
  },
  armed: {
    color: '#f59e0b',
    render: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="4" fill="currentColor" />
      </svg>
    ),
  },
  recording: {
    color: '#ef4444',
    render: () => (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="12" />
      </svg>
    ),
  },
};

/** Records a new sample into the sampler. Esc discards a pending, armed or running take. */
export const RecordButton: Component<{ player: SamplePlayer | null; class?: string }> = (props) => {
  const recorder = createSampleRecorder(() => props.player);
  const icon = () => ICONS[RECORD_STATE[recorder.state()]];

  return (
    <button
      type="button"
      title="Record Sample"
      aria-label="Record Sample"
      disabled={!props.player || recorder.busy()}
      style={{ color: icon().color }}
      class={`${iconButton.button} ${props.player ? '' : iconButton.disabled} ${props.class || ''}`}
      onClick={() => void recorder.pressRecord()}
    >
      {icon().render()}
    </button>
  );
};
