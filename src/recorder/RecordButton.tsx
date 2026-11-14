import type { Component } from 'solid-js';
import type { SampleRecorder } from './createSampleRecorder';
// eslint-disable-next-line no-unused-vars -- used as a `use:` directive below
import tooltip from '@/ui/tooltip';
import styles from './RecordButton.module.css';

/** Idle arms, armed starts now, recording stops. Esc discards the take. */
export const RecordButton: Component<{ recorder: SampleRecorder; disabled: boolean }> = (props) => (
  <button
    use:tooltip={['top', 'Arm recording · Esc cancels']}
    type="button"
    class={styles.button}
    data-state={props.recorder.state()}
    aria-label="Record Sample"
    disabled={props.disabled || props.recorder.busy()}
    onClick={() => void props.recorder.pressRecord()}
  >
    <i />
  </button>
);
