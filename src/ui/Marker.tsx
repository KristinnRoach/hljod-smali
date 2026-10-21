import type { Component } from 'solid-js';

import styles from './Marker.module.css';
import { dragSvgX } from './dragSvgX';

interface MarkerProps {
  x: number;
  onChange?: (x: number) => void;
  /** Default 0 */
  y1?: number;
  /** Default 1 */
  y2?: number;
  class?: string;
}

/** Vertical line at `x`. Coordinates are in the parent SVG's viewBox units. */
const Marker: Component<MarkerProps> = (props) => (
  <line
    class={`${styles.marker} ${props.class ?? ''}`}
    style={
      props.onChange
        ? { 'pointer-events': 'stroke', cursor: 'ew-resize', 'touch-action': 'none' }
        : undefined
    }
    on:pointerdown={(event) => props.onChange && dragSvgX(event, props.x, props.onChange)}
    x1={props.x}
    x2={props.x}
    y1={props.y1 ?? 0}
    y2={props.y2 ?? 1}
    vector-effect="non-scaling-stroke"
  />
);

export default Marker;

// Example: x in seconds for a 2.5 s sample. Marker at 1.2 s, lower half only.
// <svg viewBox="0 0 2.5 1" preserveAspectRatio="none">
//   <Marker x={1.2} y1={0.5} />
// </svg>
