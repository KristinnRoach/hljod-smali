import type { Component } from 'solid-js';

import styles from './Region.module.css';

interface RegionProps {
  x1: number;
  x2: number;
  /** Default 0 */
  y1?: number;
  /** Default 1 */
  y2?: number;
  class?: string;
}

/**
 * Band from `x1` to `x2`. Coordinates are in the parent SVG's viewBox units.
 * `x1` may be greater than `x2`, and `y1` greater than `y2`.
 */
const Region: Component<RegionProps> = (props) => {
  const y1 = () => props.y1 ?? 0;
  const y2 = () => props.y2 ?? 1;
  return (
    <rect
      class={`${styles.region} ${props.class ?? ''}`}
      x={Math.min(props.x1, props.x2)}
      width={Math.abs(props.x2 - props.x1)}
      y={Math.min(y1(), y2())}
      height={Math.abs(y2() - y1())}
    />
  );
};

export default Region;

// Example: x in seconds for a 2.5 s sample. Band from 0.5 s to 1.5 s, full height.
// <svg viewBox="0 0 2.5 1" preserveAspectRatio="none">
//   <Region x1={0.5} x2={1.5} />
// </svg>
