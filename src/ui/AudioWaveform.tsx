import { createMemo, createUniqueId, Index, Show, type Component, type JSX } from 'solid-js';

import styles from './AudioWaveform.module.css';
import type { PlotDimensions } from './Plot';

export type AudioWaveformPeak = {
  min: number;
  max: number;
};

/** A span of the buffer (0..1) to redraw in the highlight color. */
export type AudioWaveformHighlight = {
  start: number;
  end: number;
};

type AudioWaveformSource = Pick<AudioBuffer, 'getChannelData' | 'length' | 'numberOfChannels'>;

/** Visible samples at or below which lines connect, independent of peak count. Higher switches earlier but draws more points. */
const CONNECTED_SAMPLE_THRESHOLD = 14_400;
/** Detail in the min/max overview; also configurable per instance via peakCount. */
const DEFAULT_PEAK_COUNT = 1200; // ~1-2× the waveform's rendered px width: fewer shows gaps, more is invisible

interface AudioWaveformProps {
  dimensions: PlotDimensions;
  /** The actual drawing viewport, for consumers that need screen coordinates. */
  ref?: (element: SVGSVGElement) => void;
  buffer?: AudioBuffer | null;
  /** Number of horizontal peak buckets. Defaults to 300. */
  peakCount?: number;
  /** Visible range in full-buffer coordinates, 0..1. Defaults to 0 and 1. */
  start?: number;
  end?: number;
  class?: string;
  /** Spans redrawn in `--audio-waveform-highlight-color`, in buffer coordinates (0..1). */
  highlights?: AudioWaveformHighlight[];
  /** Overlays drawn above the waveform, in normalized 0..1 coordinates (x = buffer position). */
  children?: JSX.Element;
}

const clampSample = (sample: number) => Math.max(-1, Math.min(1, sample));

const waveformRange = (start = 0, end = 1) => {
  const from = Number.isFinite(start) ? Math.max(0, Math.min(1, start)) : 0;
  const to = Number.isFinite(end) ? Math.max(0, Math.min(1, end)) : 1;
  return from < to ? { start: from, end: to } : { start: 0, end: 1 };
};

const waveformPeakCount = (requested = DEFAULT_PEAK_COUNT) =>
  Number.isFinite(requested) ? Math.max(1, Math.floor(requested)) : DEFAULT_PEAK_COUNT;

/** Reduces the visible range to min/max buckets without dropping in-between transients. */
export function getAudioWaveformPeaks(
  buffer: AudioWaveformSource,
  requestedPeakCount = DEFAULT_PEAK_COUNT,
  start = 0,
  end = 1,
): AudioWaveformPeak[] {
  if (!buffer.length || !buffer.numberOfChannels) return [];

  const range = waveformRange(start, end);
  const firstSample = Math.floor(range.start * buffer.length);
  const sampleCount = Math.ceil(range.end * buffer.length) - firstSample;
  const peakCount = Math.min(sampleCount, waveformPeakCount(requestedPeakCount));
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
      // Join buckets so the overview reads like the dense sample line it turns into.
      return `${index ? 'L' : 'M'}${x} ${sampleToY(peak.max)}V${sampleToY(peak.min)}`;
    })
    .join('');

/** Use peak buckets at a distance and connected samples when individual samples fit. */
export function getAudioWaveformPath(
  buffer: AudioWaveformSource,
  requestedPeakCount = DEFAULT_PEAK_COUNT,
  start = 0,
  end = 1,
): string {
  if (!buffer.length || !buffer.numberOfChannels) return '';
  const range = waveformRange(start, end);
  const firstSample = Math.floor(range.start * buffer.length);
  const endSample = Math.ceil(range.end * buffer.length);
  if (endSample - firstSample > CONNECTED_SAMPLE_THRESHOLD) {
    return peaksToPath(
      getAudioWaveformPeaks(buffer, requestedPeakCount, range.start, range.end),
      range.start,
      range.end,
    );
  }

  // Include neighbors so clipping preserves the line across viewport edges.
  const first = Math.max(0, firstSample - 1);
  const last = Math.min(buffer.length - 1, endSample);
  return Array.from({ length: buffer.numberOfChannels }, (_, channelIndex) => {
    const channel = buffer.getChannelData(channelIndex);
    const segments: string[] = [];
    for (let index = first; index <= last; index += 1) {
      const y = sampleToY(clampSample(channel[index] ?? 0));
      segments.push(`${index === first ? 'M' : 'L'}${index / buffer.length} ${y}`);
    }
    // Hold the final sample through the buffer's end, including one-sample buffers.
    if (last === buffer.length - 1) {
      segments.push(`L1 ${sampleToY(clampSample(channel[last] ?? 0))}`);
    }
    return segments.join('');
  }).join('');
}

/** Non-interactive, normalized SVG waveform primitive. */
const AudioWaveform: Component<AudioWaveformProps> = (props) => {
  const range = createMemo(() => waveformRange(props.start, props.end));
  const path = createMemo(() => {
    const buffer = props.buffer;
    const { start, end } = range();
    return buffer ? getAudioWaveformPath(buffer, props.peakCount, start, end) : '';
  });
  const highlightMask = createUniqueId();
  return (
    <svg
      ref={props.ref}
      class={`${styles.waveform} ${props.class ?? ''}`}
      x="0"
      y="0"
      width={props.dimensions.width}
      height={props.dimensions.height}
      viewBox={`${range().start} 0 ${range().end - range().start} 1`}
      preserveAspectRatio="none"
      pointer-events="none"
      aria-hidden="true"
    >
      <path d={path()} vector-effect="non-scaling-stroke" />
      <Show when={props.highlights?.length}>
        {/* Reuse the cached path; only the small mask rectangles change. */}
        <mask
          id={highlightMask}
          maskUnits="userSpaceOnUse"
          x={range().start}
          y={0}
          width={range().end - range().start}
          height={1}
          style={{ 'mask-type': 'luminance' }}
        >
          <Index each={props.highlights}>
            {(span) => (
              <rect
                x={span().start}
                width={span().end - span().start}
                y={0}
                height={1}
                fill="white"
              />
            )}
          </Index>
        </mask>
        <path
          class={styles.highlight}
          d={path()}
          mask={`url(#${highlightMask})`}
          vector-effect="non-scaling-stroke"
        />
      </Show>
      {props.children}
    </svg>
  );
};

export default AudioWaveform;
