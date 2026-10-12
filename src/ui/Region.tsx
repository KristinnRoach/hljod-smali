import type { Component } from 'solid-js';

import styles from './Region.module.css';

interface RegionProps {
  /** x positions, 0..1. Order doesn't matter. */
  start: number;
  end: number;
  class?: string;
}

/** Full-height band between two x positions. Place inside an SVG with `viewBox="0 0 1 1"`. */
const Region: Component<RegionProps> = (props) => (
  <rect
    class={`${styles.region} ${props.class ?? ''}`}
    x={Math.min(props.start, props.end)}
    width={Math.abs(props.end - props.start)}
    y={0}
    height={1}
  />
);

export default Region;
