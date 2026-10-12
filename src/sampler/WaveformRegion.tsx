import type { Component } from 'solid-js';

import styles from './WaveformRegion.module.css';

interface WaveformRegionProps {
  /** Normalized buffer positions, 0..1. Order doesn't matter. */
  start: number;
  end: number;
  class?: string;
}

/** Full-height band between two buffer positions. Place inside `<AudioWaveform>`. */
const WaveformRegion: Component<WaveformRegionProps> = (props) => (
  <rect
    class={`${styles.region} ${props.class ?? ''}`}
    x={Math.min(props.start, props.end)}
    width={Math.abs(props.end - props.start)}
    y={0}
    height={1}
  />
);

export default WaveformRegion;
