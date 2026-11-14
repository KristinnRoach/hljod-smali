import type { Component } from 'solid-js';
import type { SampleRecorder } from './createSampleRecorder';
import styles from './Waveform.module.css';

/** Peak bars of the running take, then of the finished one. */
export const Waveform: Component<{ recorder: SampleRecorder }> = (props) => (
  <svg class={styles.wave} viewBox="0 0 100 24" preserveAspectRatio="none" aria-hidden="true">
    <path
      d={props.recorder
        .wave()
        .map(
          (p, i, values) =>
            `M${(i * 100) / values.length},${12 - Math.max(0.5, p * 12)}v${Math.max(1, p * 24)}`,
        )
        .join(' ')}
    />
  </svg>
);
