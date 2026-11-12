import { createEffect, createSignal, onCleanup, type Component, type JSX } from 'solid-js';
import {
  createAudioRecorder,
  type AudioRecorderState,
  type Recorder,
  type RecorderInput,
  type SamplePlayer,
} from '@kidlib/web-audio';
import { getRecorderSettings } from './recorderSettings';
import iconButton from '@/ui/iconButton.module.css';

type RecordState = 'idle' | 'armed' | 'recording';

/** Requesting input looks idle and finalizing looks like recording, as before. */
const RECORD_STATE: Record<AudioRecorderState, RecordState> = {
  IDLE: 'idle',
  REQUESTING_INPUT: 'idle',
  ARMED: 'armed',
  RECORDING: 'recording',
  FINALIZING: 'recording',
};

/** Preprocessing for recorded takes. Empty means the library defaults (full chain). */
const RECORDING_PREPROCESS: Parameters<SamplePlayer['loadAudio']>[1] = {};

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
  const [state, setState] = createSignal<RecordState>('idle');
  let recorder: Recorder | null = null;

  // One recorder per player: a new player disposes the old recorder and any take.
  createEffect(() => {
    const player = props.player;
    if (!player) return;
    const rec = createAudioRecorder(player.context);
    recorder = rec;
    rec.onMessage('state-change', ({ state }) => setState(RECORD_STATE[state]));
    // Fires for clicked and silence-stopped takes alike.
    rec.onMessage('record:stop', ({ buffer }) => {
      if (!player.disposed) void player.loadAudio(buffer, RECORDING_PREPROCESS);
    });
    rec.onMessage('record:error', ({ error }) => console.error('Recording failed:', error));
    onCleanup(() => {
      rec.dispose();
      if (recorder === rec) recorder = null;
      setState('idle');
    });
  });

  const input = (player: SamplePlayer): RecorderInput => {
    const { inputSource, inputDeviceId } = getRecorderSettings();
    if (inputSource === 'resample') return { type: 'audio-node', node: player.output };
    if (inputSource === 'share') return { type: 'display' };
    return { type: 'microphone', deviceId: inputDeviceId || undefined };
  };

  const handleClick = async () => {
    const player = props.player;
    if (!recorder || !player) return;
    try {
      switch (recorder.state) {
        case 'IDLE':
        case 'REQUESTING_INPUT': // arm() shares the pending startup
          await recorder.arm({
            input: input(player),
            startThresholdDb: -30,
            stopOnSilence: { thresholdDb: -40, durationMs: 1000 },
          });
          break;
        case 'ARMED':
          await recorder.start();
          break;
        default:
          await recorder.stop();
      }
    } catch (error) {
      console.error('Recording failed:', error);
    }
  };

  const handleEscape = (event: KeyboardEvent) => {
    if (event.key === 'Escape') recorder?.cancel();
  };
  document.addEventListener('keydown', handleEscape);
  onCleanup(() => document.removeEventListener('keydown', handleEscape));

  return (
    <button
      type="button"
      title="Record Sample"
      aria-label="Record Sample"
      disabled={!props.player}
      style={{ color: ICONS[state()].color }}
      class={`${iconButton.button} ${props.player ? '' : iconButton.disabled} ${props.class || ''}`}
      onClick={() => void handleClick()}
    >
      {ICONS[state()].render()}
    </button>
  );
};
