import type { Component } from 'solid-js';
import type { SamplePlayer } from '@kidlib/web-audio';
import { createSampleRecorder } from './createSampleRecorder';
import { RecordButton } from './RecordButton';
import { ThresholdMeter } from './ThresholdMeter';
import { AutoButton } from './AutoButton';
import { PlayButton } from './PlayButton';
import InputDeviceSelect from '@/io/InputDeviceSelect';
import RecorderInputSourceSelect from './RecorderInputSourceSelect';
import {
  recorderInputDeviceId,
  recorderInputSource,
  setRecorderInputDeviceId,
  setRecorderInputSource,
} from './recorderSettings';
import styles from './Recorder.module.css';

/** Records a new sample into the sampler. */
export const Recorder: Component<{ player: SamplePlayer | null }> = (props) => {
  const recorder = createSampleRecorder(() => props.player);
  return (
    <div class={styles.recorder} role="group" aria-label="Sample recorder">
      <div class={styles.row}>
        <RecordButton recorder={recorder} disabled={!props.player} />
        {/* Optional take preview: drop this line to remove it. */}
        <PlayButton recorder={recorder} player={props.player} />
      </div>
      <div class={styles.row}>
        <ThresholdMeter recorder={recorder} disabled={!props.player} />
        <AutoButton recorder={recorder} disabled={!props.player} />
      </div>
      <div class={styles.row}>
        <RecorderInputSourceSelect
          class={styles.source}
          value={recorderInputSource()}
          onChange={setRecorderInputSource}
        />
        <InputDeviceSelect
          class={styles.device}
          disabled={recorderInputSource() !== 'audio-input'}
          value={recorderInputDeviceId()}
          onChange={setRecorderInputDeviceId}
        />
      </div>
    </div>
  );
};
