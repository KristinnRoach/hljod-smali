import type { Component } from 'solid-js';
import type { SamplePlayer } from '@kidlib/web-audio';
import { createSampleRecorder } from './createSampleRecorder';
import styles from './RecordButton.module.css';

/** Records a new sample into the sampler. Esc discards a pending, armed or running take. */
export const RecordButton: Component<{ player: SamplePlayer | null }> = (props) => {
  const recorder = createSampleRecorder(() => props.player);
  return (
    <button
      type="button"
      class={styles.button}
      data-state={recorder.state()}
      title="Record Sample · Esc cancels"
      aria-label="Record Sample"
      disabled={!props.player || recorder.busy()}
      onClick={() => void recorder.pressRecord()}
    >
      <i />
    </button>
  );
};
