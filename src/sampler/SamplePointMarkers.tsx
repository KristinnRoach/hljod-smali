import { Show, type Component } from 'solid-js';

import styles from './SamplePointMarkers.module.css';
import { loopEnabled } from './samplePlayer';
import { samplerParamValues } from './samplerParamState';
import WaveformMarker from './WaveformMarker';
import WaveformRegion from './WaveformRegion';

export const SampleRegions: Component = () => {
  const values = samplerParamValues();
  return (
    <>
      <WaveformRegion start={0} end={values.trimStart} class={styles.trimmedOut} />
      <WaveformRegion start={values.trimEnd} end={1} class={styles.trimmedOut} />
      <Show when={loopEnabled()}>
        <WaveformRegion start={values.loopStart} end={values.loopEnd} class={styles.loopActive} />
      </Show>
    </>
  );
};

/** Trim and loop points as `<AudioWaveform>` overlays. */
const SamplePointMarkers: Component = () => {
  const values = samplerParamValues();
  return (
    <>
      <WaveformMarker position={values.trimStart} class={styles.trimMarker} />
      <WaveformMarker position={values.trimEnd} class={styles.trimMarker} />
      <WaveformMarker position={values.loopStart} class={styles.loopMarker} />
      <WaveformMarker position={values.loopEnd} class={styles.loopMarker} />
    </>
  );
};

export default SamplePointMarkers;
