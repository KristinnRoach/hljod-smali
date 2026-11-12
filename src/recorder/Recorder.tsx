import type { Component } from 'solid-js';
import type { SamplePlayer } from '@kidlib/web-audio';
import { createSampleRecorder } from './createSampleRecorder';
import { RecordButton } from './RecordButton';
import { ThresholdMeter } from './ThresholdMeter';
import styles from './Recorder.module.css';

/** Records a new sample into the sampler. */
export const Recorder: Component<{ player: SamplePlayer | null }> = (props) => {
  const recorder = createSampleRecorder(() => props.player);
  return (
    <div class={styles.recorder} role="group" aria-label="Sample recorder">
      <RecordButton recorder={recorder} disabled={!props.player} />
      <ThresholdMeter recorder={recorder} disabled={!props.player} />
    </div>
  );
};
