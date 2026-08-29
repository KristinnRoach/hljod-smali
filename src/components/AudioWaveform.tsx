import { createMemo, type Component } from 'solid-js';

import styles from './AudioWaveform.module.css';

export type AudioWaveformPeak = {
  min: number;
  max: number;
};

type AudioWaveformSource = Pick<AudioBuffer, 'getChannelData' | 'length' | 'numberOfChannels'>;

export interface AudioWaveformProps {
  buffer?: AudioBuffer | null;
  /** Number of horizontal peak buckets. Defaults to 300. */
  peakCount?: number;
  class?: string;
}

const clampSample = (sample: number) => Math.max(-1, Math.min(1, sample));

/** Reduces an audio buffer to min/max buckets without dropping in-between transients. */
export function getAudioWaveformPeaks(
  buffer: AudioWaveformSource,
  requestedPeakCount = 300,
): AudioWaveformPeak[] {
  if (!buffer.length || !buffer.numberOfChannels) return [];

  const safePeakCount = Number.isFinite(requestedPeakCount)
    ? Math.max(1, Math.floor(requestedPeakCount))
    : 300;
  const peakCount = Math.min(buffer.length, safePeakCount);
  const channels = Array.from({ length: buffer.numberOfChannels }, (_value, channel) =>
    buffer.getChannelData(channel),
  );

  return Array.from({ length: peakCount }, (_value, peakIndex) => {
    const start = Math.floor((peakIndex * buffer.length) / peakCount);
    const end = Math.max(start + 1, Math.floor(((peakIndex + 1) * buffer.length) / peakCount));
    let min = 1;
    let max = -1;

    for (const channel of channels) {
      for (let sampleIndex = start; sampleIndex < end; sampleIndex += 1) {
        const sample = clampSample(channel[sampleIndex] ?? 0);
        min = Math.min(min, sample);
        max = Math.max(max, sample);
      }
    }

    return { min, max };
  });
}

const sampleToY = (sample: number) => (1 - sample) / 2;

const peaksToPath = (peaks: AudioWaveformPeak[]) =>
  peaks
    .map((peak, index) => {
      const x = (index + 0.5) / peaks.length;
      return `M${x} ${sampleToY(peak.max)}V${sampleToY(peak.min)}`;
    })
    .join('');

/** Non-interactive, normalized SVG waveform primitive. */
export const AudioWaveform: Component<AudioWaveformProps> = (props) => {
  const path = createMemo(() => {
    const buffer = props.buffer;
    return buffer ? peaksToPath(getAudioWaveformPeaks(buffer, props.peakCount)) : '';
  });

  return (
    <svg
      class={`${styles.waveform} ${props.class ?? ''}`}
      x="0"
      y="0"
      width="100%"
      height="100%"
      viewBox="0 0 1 1"
      preserveAspectRatio="none"
      pointer-events="none"
      aria-hidden="true"
    >
      <path d={path()} vector-effect="non-scaling-stroke" />
    </svg>
  );
};

export default AudioWaveform;
