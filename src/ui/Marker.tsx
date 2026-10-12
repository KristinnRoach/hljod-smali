import type { Component } from 'solid-js';

import styles from './Marker.module.css';

interface MarkerProps {
  /** x position, 0..1. */
  position: number;
  class?: string;
}

/** Full-height vertical line. Place inside an SVG with `viewBox="0 0 1 1"`. */
const Marker: Component<MarkerProps> = (props) => (
  <line
    class={`${styles.marker} ${props.class ?? ''}`}
    x1={props.position}
    x2={props.position}
    y1={0}
    y2={1}
    vector-effect="non-scaling-stroke"
  />
);

export default Marker;
