import { Show, type Component } from 'solid-js';

import styles from './SamplePointMarkers.module.css';
import { loopEnabled } from './samplePlayer';
import { samplerParamValues } from './samplerParamState';
import Marker from '@/ui/Marker';
import Region from '@/ui/Region';

export const SampleRegions: Component = () => {
  const values = samplerParamValues();
  return (
    <>
      <Region x1={0} x2={values.trimStart} class={styles.trimmedOut} />
      <Region x1={values.trimEnd} x2={1} class={styles.trimmedOut} />
      <Show when={loopEnabled()}>
        <Region x1={values.loopStart} x2={values.loopEnd} class={styles.loopActive} />
      </Show>
    </>
  );
};

/** Trim and loop points as `<AudioWaveform>` overlays. */
const SamplePointMarkers: Component = () => {
  const values = samplerParamValues();
  return (
    <>
      <Marker x={values.trimStart} class={styles.trimMarker} />
      <Marker x={values.trimEnd} class={styles.trimMarker} />
      <Marker x={values.loopStart} class={styles.loopMarker} />
      <Marker x={values.loopEnd} class={styles.loopMarker} />
    </>
  );
};

export default SamplePointMarkers;
