import type { Component } from 'solid-js';
import type { SampleRecorder } from './createSampleRecorder';
import styles from './RecordButton.module.css';

/** Idle arms, armed starts now, recording stops. Esc discards the take. */
export const RecordButton: Component<{ recorder: SampleRecorder; disabled: boolean }> = (props) => (
  <button
    type="button"
    class={styles.button}
    data-state={props.recorder.state()}
    title="Record Sample · Esc cancels"
    aria-label="Record Sample"
    disabled={props.disabled || props.recorder.busy()}
    onClick={() => void props.recorder.pressRecord()}
  >
    <i />
  </button>
);
