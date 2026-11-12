import { createEffect, createSignal, onCleanup } from 'solid-js';
import {
  createAudioRecorder,
  type AudioRecorderState,
  type Recorder,
  type RecorderInput,
  type SamplePlayer,
} from '@kidlib/web-audio';
import { recorderInputDeviceId, recorderInputSource } from './recorderSettings';

export type SampleRecorder = ReturnType<typeof createSampleRecorder>;

/** Preprocessing for recorded takes. Empty means the library defaults (full chain). */
const RECORDING_PREPROCESS: Parameters<SamplePlayer['loadAudio']>[1] = {};

const input = (player: SamplePlayer): RecorderInput => {
  if (recorderInputSource() === 'resample') return { type: 'audio-node', node: player.output };
  if (recorderInputSource() === 'share')
    return { type: 'display', options: { video: { displaySurface: 'monitor' } } }; // displaySurface: 'monitor'| 'window' | 'browser'
  return { type: 'microphone', deviceId: recorderInputDeviceId() || undefined };
};

/**
 * Records takes into the player's sample. Call inside a component.
 * Esc discards a pending, armed or running take.
 */
export const createSampleRecorder = (getPlayer: () => SamplePlayer | null) => {
  const [state, setState] = createSignal<AudioRecorderState>('IDLE');
  // Undefined until the first arm reports the Recorder's default for the input.
  const [threshold, setThreshold] = createSignal<number>();
  const [peak, setPeak] = createSignal(-Infinity);
  const [measuring, setMeasuring] = createSignal(false);
  let recorder: Recorder | null = null;
  const busy = () => state() === 'REQUESTING_INPUT' || state() === 'FINALIZING';

  // One recorder per player: a new player disposes the old recorder and any take.
  createEffect(() => {
    const player = getPlayer();
    if (!player) return;
    const rec = createAudioRecorder(player.context);
    recorder = rec;
    rec.onMessage('state-change', ({ state }) => {
      setState(state);
      if (state === 'IDLE') setPeak(-Infinity);
    });
    rec.onMessage('record:armed', ({ thresholdDb }) => setThreshold(thresholdDb));
    rec.onMessage('record:level', ({ peakDb }) => setPeak(peakDb));
    // Fires for clicked and silence-stopped takes alike.
    rec.onMessage('record:stop', ({ buffer }) => {
      if (!player.disposed) {
        void player
          .loadAudio(buffer, RECORDING_PREPROCESS)
          .catch((error) => console.error('Loading recorded sample failed:', error));
      }
    });
    rec.onMessage('record:error', ({ error }) => console.error('Recording failed:', error));
    onCleanup(() => {
      rec.dispose();
      if (recorder === rec) recorder = null;
      setState('IDLE');
      setPeak(-Infinity);
    });
  });

  /** Idle arms, armed starts now, recording stops. */
  const pressRecord = async () => {
    const player = getPlayer();
    if (!recorder || !player) return;
    try {
      switch (recorder.state) {
        case 'IDLE':
        case 'MONITORING':
          await recorder.arm({
            input: input(player),
            startThresholdDb: threshold(),
            stopOnSilence: true,
            metering: true,
          });
          break;
        case 'ARMED':
          await recorder.start();
          break;
        case 'RECORDING':
          await recorder.stop();
      }
    } catch (error) {
      console.error('Recording failed:', error);
    }
  };

  /** Applies to the next take, and to an armed one right away. */
  const setThresholdDb = (value: number) => {
    setThreshold(value);
    if (recorder?.state === 'ARMED') recorder.setStartThresholdDb(value);
  };

  /** Sets the threshold from the room's noise floor. Esc cancels. */
  const measure = async () => {
    const player = getPlayer();
    if (!recorder || !player || measuring()) return;
    setMeasuring(true);
    try {
      const result = await recorder.measureNoiseFloor({ input: input(player) });
      if (result) setThresholdDb(Math.round(result.startThresholdDb));
    } catch (error) {
      console.error('Measuring noise floor failed:', error);
    } finally {
      setMeasuring(false);
    }
  };

  const handleEscape = (event: KeyboardEvent) => {
    if (event.key === 'Escape') recorder?.cancel();
  };
  document.addEventListener('keydown', handleEscape);
  onCleanup(() => document.removeEventListener('keydown', handleEscape));

  return { state, busy, threshold, peak, measuring, pressRecord, setThresholdDb, measure };
};
