import { createMemo, type Component, type JSX } from 'solid-js';

import styles from './AudioWaveform.module.css';

export type AudioWaveformPeak = {
  min: number;
  max: number;
};

type AudioWaveformSource = Pick<AudioBuffer, 'getChannelData' | 'length' | 'numberOfChannels'>;

interface AudioWaveformProps {
  buffer?: AudioBuffer | null;
  /** Number of horizontal peak buckets. Defaults to 300. */
  peakCount?: number;
  /** Visible range in full-buffer coordinates, 0..1. Defaults to 0 and 1. */
  start?: number;
  end?: number;
  class?: string;
  /** Overlays drawn above the waveform, in normalized 0..1 coordinates (x = buffer position). */
  children?: JSX.Element;
}

const clampSample = (sample: number) => Math.max(-1, Math.min(1, sample));

const waveformRange = (start = 0, end = 1) => {
  const from = Number.isFinite(start) ? Math.max(0, Math.min(1, start)) : 0;
  const to = Number.isFinite(end) ? Math.max(0, Math.min(1, end)) : 1;
  return from < to ? { start: from, end: to } : { start: 0, end: 1 };
};

/** Reduces the visible range to min/max buckets without dropping in-between transients. */
export function getAudioWaveformPeaks(
  buffer: AudioWaveformSource,
  requestedPeakCount = 300,
  start = 0,
  end = 1,
): AudioWaveformPeak[] {
  if (!buffer.length || !buffer.numberOfChannels) return [];

  const range = waveformRange(start, end);
  const firstSample = Math.floor(range.start * buffer.length);
  const sampleCount = Math.ceil(range.end * buffer.length) - firstSample;
  const safePeakCount = Number.isFinite(requestedPeakCount)
    ? Math.max(1, Math.floor(requestedPeakCount))
    : 300;
  const peakCount = Math.min(sampleCount, safePeakCount);
  const channels = Array.from({ length: buffer.numberOfChannels }, (_value, channel) =>
    buffer.getChannelData(channel),
  );

  return Array.from({ length: peakCount }, (_value, peakIndex) => {
    const start = firstSample + Math.floor((peakIndex * sampleCount) / peakCount);
    const end = firstSample + Math.floor(((peakIndex + 1) * sampleCount) / peakCount);
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

const peaksToPath = (peaks: AudioWaveformPeak[], start: number, end: number) =>
  peaks
    .map((peak, index) => {
      const x = start + ((index + 0.5) / peaks.length) * (end - start);
      return `M${x} ${sampleToY(peak.max)}V${sampleToY(peak.min)}`;
    })
    .join('');

/** Non-interactive, normalized SVG waveform primitive. */
const AudioWaveform: Component<AudioWaveformProps> = (props) => {
  const range = createMemo(() => waveformRange(props.start, props.end));
  const path = createMemo(() => {
    const buffer = props.buffer;
    const { start, end } = range();
    return buffer
      ? peaksToPath(getAudioWaveformPeaks(buffer, props.peakCount, start, end), start, end)
      : '';
  });

  return (
    <svg
      class={`${styles.waveform} ${props.class ?? ''}`}
      x="0"
      y="0"
      width="100%"
      height="100%"
      viewBox={`${range().start} 0 ${range().end - range().start} 1`}
      preserveAspectRatio="none"
      pointer-events="none"
      aria-hidden="true"
    >
      <path d={path()} vector-effect="non-scaling-stroke" />
      {props.children}
    </svg>
  );
};

export default AudioWaveform;
