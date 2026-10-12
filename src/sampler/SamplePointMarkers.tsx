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
      <Region start={0} end={values.trimStart} class={styles.trimmedOut} />
      <Region start={values.trimEnd} end={1} class={styles.trimmedOut} />
      <Show when={loopEnabled()}>
        <Region start={values.loopStart} end={values.loopEnd} class={styles.loopActive} />
      </Show>
    </>
  );
};

/** Trim and loop points as `<AudioWaveform>` overlays. */
const SamplePointMarkers: Component = () => {
  const values = samplerParamValues();
  return (
    <>
      <Marker position={values.trimStart} class={styles.trimMarker} />
      <Marker position={values.trimEnd} class={styles.trimMarker} />
      <Marker position={values.loopStart} class={styles.loopMarker} />
      <Marker position={values.loopEnd} class={styles.loopMarker} />
    </>
  );
};

export default SamplePointMarkers;
