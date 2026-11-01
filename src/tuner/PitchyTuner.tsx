import { PitchDetector } from 'pitchy';
import { createSignal, onCleanup } from 'solid-js';

import Tuner from './Tuner';

const MIN_CLARITY = 0.82;
// Ignore detector results below this level to prevent quiet output noise from
// keeping the last pitch alive.
const MIN_LEVEL_DB = -35;
const MIN_RMS = 10 ** (MIN_LEVEL_DB / 20);
// Every UPDATE_MS, show the median of the clear frames since the last update.
// Higher = steadier, lower = snappier; a new note shows within ~1–1.5x this.
const UPDATE_MS = 75;
/** Live pitch readout of `source` (McLeod via pitchy), A4 = 440 Hz. */
export default function PitchyTuner(props: {
  source: AudioNode;
  layout?: 'row' | 'column';
  width?: string;
}) {
  const ctx = props.source.context;
  const analyser = new AnalyserNode(ctx, { fftSize: 2048 });
  props.source.connect(analyser);
  const buf = new Float32Array(analyser.fftSize);
  const detector = PitchDetector.forFloat32Array(buf.length);
  let frames: number[] = [];
  let lastUpdate = 0;
  const [frequency, setFrequency] = createSignal<number | null>(null);

  let raf = requestAnimationFrame(function tick(now) {
    analyser.getFloatTimeDomainData(buf);
    let sumSquares = 0;
    for (const sample of buf) sumSquares += sample * sample;
    if (Math.sqrt(sumSquares / buf.length) >= MIN_RMS) {
      const [hz, clarity] = detector.findPitch(buf, ctx.sampleRate);
      if (clarity >= MIN_CLARITY && Number.isFinite(hz) && hz > 0) {
        frames.push(hz);
      }
    }
    if (now - lastUpdate >= UPDATE_MS) {
      lastUpdate = now;
      setFrequency(frames.length ? frames.sort((a, b) => a - b)[frames.length >> 1] : null);
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

  return <Tuner frequency={frequency()} layout={props.layout} width={props.width} />;
}
