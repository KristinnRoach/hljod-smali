import { createSignal, onCleanup, onMount, type Component, type JSX } from 'solid-js';
import { createAudioRecorder, type Recorder, type RecorderInput } from '@kidlib/web-audio';
import type { SamplePlayer } from '@kidlib/web-audio';
import { getRecorderSettings } from '@/utils/recorderSettings';
import iconButton from '@/components/ui/iconButton.module.css';

type RecordState = 'idle' | 'armed' | 'recording';

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

/** Records a new sample into the sampler. Esc discards an armed or running take. */
export const RecordButton: Component<{ player: SamplePlayer | null; class?: string }> = (props) => {
  const [state, setState] = createSignal<RecordState>('idle');
  let recorder: Recorder | null = null;
  let starting = false;

  const dispose = () => {
    recorder?.dispose();
    recorder = null;
    setState('idle');
  };

  const start = async () => {
    const player = props.player;
    // `recorder` is null across the awaits below, so state alone does not stop
    // a second click from building a second recorder onto the same player.
    if (!player || recorder || starting) return;
    starting = true;

    const { inputSource, inputDeviceId } = getRecorderSettings();
    const input: RecorderInput =
      inputSource === 'resample'
        ? { type: 'audio-node', node: player.output }
        : inputSource === 'browser'
          ? { type: 'display' }
          : { type: 'microphone', deviceId: inputDeviceId || undefined };

    try {
      recorder = await createAudioRecorder(player.context);
      if (!recorder) return;

      recorder.connect(player);
      // `Message` is not exported by the package; the index signature makes
      // `msg.state` an `any`, so this stays inferred rather than re-declared.
      recorder.onMessage('state-change', (msg) => {
        if (msg.state === 'ARMED') setState('armed');
        else if (msg.state === 'RECORDING') setState('recording');
        // autoStop ends a take without a click, so nothing else would dispose.
        // Guarded on the live states: the recorder can report IDLE before it
        // arms, and that must not tear down the recorder we just built.
        else if (state() !== 'idle') dispose();
      });

      await recorder.start({
        input,
        useThreshold: true,
        startThreshold: -30,
        autoStop: true,
        stopThreshold: -40,
        silenceTimeoutMs: 1000,
      });
    } catch (error) {
      console.error('Failed to start recording:', error);
      dispose();
    } finally {
      starting = false;
    }
  };

  const stop = async () => {
    try {
      await recorder?.stop();
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
    dispose();
  };

  const handleClick = async () => {
    if (state() === 'idle') await start();
    else if (state() === 'armed') recorder?.forceStart();
    else await stop();
  };

  const handleEscape = (event: KeyboardEvent) => {
    if (event.key !== 'Escape' || state() === 'idle') return;
    recorder?.cancel();
    dispose();
  };

  onMount(() => document.addEventListener('keydown', handleEscape));
  onCleanup(() => {
    document.removeEventListener('keydown', handleEscape);
    dispose();
  });

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
