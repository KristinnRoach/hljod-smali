import type { Component } from 'solid-js';
import type { SampleRecorder } from './createSampleRecorder';
import styles from './AutoButton.module.css';

/** Listens to the room briefly and sets the start threshold above its noise. */
export const AutoButton: Component<{ recorder: SampleRecorder; disabled: boolean }> = (props) => (
  <button
    type="button"
    class={styles.button}
    aria-label="Auto"
    title="Set rec threshold from room noise"
    disabled={props.disabled || props.recorder.measuring() || props.recorder.state() !== 'IDLE'}
    onClick={() => void props.recorder.measure()}
  >
    Ⓐ
  </button>
);
