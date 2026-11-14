import type { Component } from 'solid-js';
import type { SampleRecorder } from './createSampleRecorder';
// eslint-disable-next-line no-unused-vars -- used as a `use:` directive below
import tooltip from '@/ui/tooltip';
import styles from './AutoButton.module.css';

/** Listens to the room briefly and sets the start threshold above its noise. */
export const AutoButton: Component<{ recorder: SampleRecorder; disabled: boolean }> = (props) => (
  <button
    type="button"
    class={styles.button}
    aria-label="Auto"
    use:tooltip={['right', 'Auto threshold']}
    disabled={props.disabled || props.recorder.measuring() || props.recorder.state() !== 'IDLE'}
    onClick={() => void props.recorder.measure()}
  >
    Ⓐ
  </button>
);
