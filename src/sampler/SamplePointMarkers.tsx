import { Show, type Component } from 'solid-js';

import styles from './SamplePointMarkers.module.css';
import { loopEnabled } from './samplePlayer';
import { samplerParamValues, setSamplerParamValue, moveLoop } from './samplerParamState';
import Marker from '@/ui/Marker';
import Region from '@/ui/Region';

export const SampleRegions: Component = () => {
  const values = samplerParamValues();
  return (
    <>
      <Region
        x1={values.trimStart < values.trimEnd ? 0 : values.trimEnd}
        x2={values.trimStart < values.trimEnd ? values.trimStart : 0}
        class={styles.trimmedOut}
      />
      <Region
        x1={values.trimStart < values.trimEnd ? values.trimEnd : 1}
        x2={values.trimStart < values.trimEnd ? 1 : values.trimStart}
        class={styles.trimmedOut}
      />
      <Show when={values.trimStart > values.trimEnd}>
        <Region x1={values.trimEnd} x2={values.trimStart} class={styles.inverted} />
      </Show>
      <Show when={loopEnabled()}>
        <Region x1={values.loopStart} x2={values.loopEnd} class={styles.loopRegion} />
      </Show>
    </>
  );
};

/** Trim and loop points as `<AudioWaveform>` overlays. */
const SamplePointMarkers: Component = () => {
  const values = samplerParamValues();
  return (
    <>
      <Marker
        x={values.trimStart}
        class={styles.trimMarker}
        onChange={(x) => setSamplerParamValue('trimStart', Math.max(0, Math.min(1, x)))}
      />
      <Marker
        x={values.trimEnd}
        class={styles.trimMarker}
        onChange={(x) => setSamplerParamValue('trimEnd', Math.max(0, Math.min(1, x)))}
      />
      <Marker
        x={values.loopStart}
        class={styles.loopMarker + (loopEnabled() ? ` ${styles.loopEnabled}` : '')}
        onChange={(x) => setSamplerParamValue('loopStart', Math.max(0, Math.min(1, x)))}
      />
      <Marker
        x={values.loopEnd}
        class={styles.loopMarker + (loopEnabled() ? ` ${styles.loopEnabled}` : '')}
        onChange={(x) => setSamplerParamValue('loopEnd', Math.max(0, Math.min(1, x)))}
      />
      <Show when={loopEnabled()}>
        <Region
          class={styles.loopHandle}
          x1={values.loopStart}
          x2={values.loopEnd}
          y1={0}
          y2={0.125}
          onMove={moveLoop}
        />
      </Show>
    </>
  );
};

export default SamplePointMarkers;
