import type { Component, JSX } from 'solid-js';
import styles from './Plot.module.css';

export type PlotDimensions = { width: number; height: number };

/** Sibling layers share one responsive drawing box; decoration sits outside it. */
const Plot: Component<{
  dimensions: PlotDimensions;
  ref?: (element: HTMLDivElement) => void;
  children: JSX.Element;
}> = (props) => (
  <div class={styles.frame}>
    <div ref={props.ref} class={styles.layers} style={{ height: `${props.dimensions.height}px` }}>
      {props.children}
    </div>
  </div>
);

export default Plot;
