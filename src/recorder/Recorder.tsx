import type { Component } from 'solid-js';
import type { SamplePlayer } from '@kidlib/web-audio';
import { createSampleRecorder } from './createSampleRecorder';
import { RecordButton } from './RecordButton';
import { ThresholdMeter } from './ThresholdMeter';
import { AutoButton } from './AutoButton';
import styles from './Recorder.module.css';

/** Records a new sample into the sampler. */
export const Recorder: Component<{ player: SamplePlayer | null }> = (props) => {
  const recorder = createSampleRecorder(() => props.player);
  return (
    <div class={styles.recorder} role="group" aria-label="Sample recorder">
      <RecordButton recorder={recorder} disabled={!props.player} />
      <div class={styles.row}>
        <ThresholdMeter recorder={recorder} disabled={!props.player} />
        <AutoButton recorder={recorder} disabled={!props.player} />
      </div>
    </div>
  );
};
