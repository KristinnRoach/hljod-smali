import { PitchDetector } from 'pitchy';
import { createSignal, onCleanup } from 'solid-js';

import styles from './PitchyTuner.module.css';

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const MIN_CLARITY = 0.82;
// Ignore detector results below this level to prevent quiet output noise from
// keeping the last pitch alive.
const MIN_LEVEL_DB = -35;
const MIN_RMS = 10 ** (MIN_LEVEL_DB / 20);
// Every UPDATE_MS, show the median of the clear frames since the last update.
// Higher = steadier, lower = snappier; a new note shows within ~1–1.5x this.
const UPDATE_MS = 75;
/** Live pitch readout of `source` (McLeod via pitchy), A4 = 440 Hz. */
export default function PitchyTuner(props: { source: AudioNode }) {
  const ctx = props.source.context;
  // ponytail: 4096 reaches ~25 Hz at 48k at the cost of ~85 ms per frame.
  const analyser = new AnalyserNode(ctx, { fftSize: 2048 });
  props.source.connect(analyser);
  const buf = new Float32Array(analyser.fftSize);
  const detector = PitchDetector.forFloat32Array(buf.length);
  let frames: number[] = [];
  let lastUpdate = 0;
  const [reading, setReading] = createSignal({ note: '—', cents: '', hz: '' });
  const clearReading = () => setReading({ note: '—', cents: '', hz: '' });

  let raf = requestAnimationFrame(function tick(now) {
    analyser.getFloatTimeDomainData(buf);
    let sumSquares = 0;
    for (const sample of buf) sumSquares += sample * sample;
    if (Math.sqrt(sumSquares / buf.length) >= MIN_RMS) {
      const [hz, clarity] = detector.findPitch(buf, ctx.sampleRate);
      if (clarity >= MIN_CLARITY) {
        frames.push(69 + 12 * Math.log2(hz / 440));
      }
    }
    if (now - lastUpdate >= UPDATE_MS) {
      lastUpdate = now;
      if (frames.length) {
        const midi = frames.sort((a, b) => a - b)[frames.length >> 1];
        const note = Math.round(midi);
        const cents = Math.round((midi - note) * 100);
        setReading({
          note: `${NOTES[((note % 12) + 12) % 12]}${Math.floor(note / 12) - 1}`,
          cents: `${cents >= 0 ? '+' : ''}${cents}¢`,
          hz: `${(440 * 2 ** ((midi - 69) / 12)).toFixed(1)} Hz`,
        });
      } else {
        clearReading();
      }
      frames = [];
    }
    raf = requestAnimationFrame(tick);
  });

  onCleanup(() => {
    cancelAnimationFrame(raf);
    // The sampler teardown may already have disconnected the source.
    try {
      props.source.disconnect(analyser);
    } catch {}
  });

  return (
    <output class={styles.readout} title="Tuner pitch">
      <span class={styles.note}>{reading().note}</span>
      <span class={styles.cents}>{reading().cents}</span>
      <span class={styles.hz}>{reading().hz}</span>
    </output>
  );
}
