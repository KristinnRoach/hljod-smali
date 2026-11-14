import type { Component } from 'solid-js';
import type { SampleRecorder } from './createSampleRecorder';
// eslint-disable-next-line no-unused-vars -- used as a `use:` directive below
import tooltip from '@/ui/tooltip';
import styles from './ThresholdMeter.module.css';

const MIN_DB = -60;

/** Start threshold slider whose track doubles as the input level bar. */
export const ThresholdMeter: Component<{ recorder: SampleRecorder; disabled: boolean }> = (
  props,
) => {
  // ponytail: -30 mirrors the Recorder's mic default until the first arm reports the real one.
  const value = () => props.recorder.threshold() ?? -30;
  const level = () => (1 - Math.max(MIN_DB, Math.min(0, props.recorder.peak())) / MIN_DB) * 100;
  return (
    <input
      use:tooltip={['bottom', 'Gain threshold to start recording']}
      type="range"
      class={styles.meter}
      style={{ '--level': `${level()}%` }}
      min={MIN_DB}
      max="0"
      step="1"
      value={value()}
      aria-label="Recording start threshold"
      aria-valuetext={`${value()} dB`}
      title="Sensitivity: how loud a sound must be to start recording"
      disabled={props.disabled || props.recorder.state() === 'RECORDING'}
      onInput={(event) => props.recorder.setThresholdDb(event.currentTarget.valueAsNumber)}
    />
  );
};
