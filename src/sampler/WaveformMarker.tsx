import type { Component } from 'solid-js';

import styles from './WaveformMarker.module.css';

interface WaveformMarkerProps {
  /** Normalized buffer position, 0..1. */
  position: number;
  class?: string;
}

/** Vertical line at a buffer position. Place inside `<AudioWaveform>`. */
const WaveformMarker: Component<WaveformMarkerProps> = (props) => (
  <line
    class={`${styles.marker} ${props.class ?? ''}`}
    x1={props.position}
    x2={props.position}
    y1={0}
    y2={1}
    vector-effect="non-scaling-stroke"
  />
);

export default WaveformMarker;
