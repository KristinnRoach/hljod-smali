import { Show, type Component } from 'solid-js';

import styles from './SamplePointMarkers.module.css';
import { loopRange, trimRange } from './playbackState';
import { loopEnabled } from './samplePlayer';
import { samplerParamValues } from './samplerParamState';
import Marker from '@/ui/Marker';
import Region from '@/ui/Region';

// Testing aid: bands and markers for the loop and trim the engine resolved. Maybe drop for prod.
const SHOW_RESOLVED_LOOP_REGION = true;
const SHOW_RESOLVED_LOOP_MARKERS = false;
const SHOW_RESOLVED_TRIM_MARKERS = false;

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
        <Region x1={values.loopStart} x2={values.loopEnd} class={styles.loopActive} />
        <Show when={SHOW_RESOLVED_LOOP_REGION}>
          <Show when={loopRange()}>
            {(range) => <Region x1={range().start} x2={range().end} class={styles.loopResolved} />}
          </Show>
        </Show>
      </Show>
    </>
  );
};

/** Trim and loop points as `<AudioWaveform>` overlays. */
const SamplePointMarkers: Component = () => {
  const values = samplerParamValues();
  return (
    <>
      <Show
        when={SHOW_RESOLVED_TRIM_MARKERS ? trimRange() : null}
        fallback={
          <>
            <Marker x={values.trimStart} class={styles.trimMarker} />
            <Marker x={values.trimEnd} class={styles.trimMarker} />
          </>
        }
      >
        {(range) => (
          <>
            <Marker x={range().start} class={styles.trimMarker} />
            <Marker x={range().end} class={styles.trimMarker} />
          </>
        )}
      </Show>
      <Show
        when={SHOW_RESOLVED_LOOP_MARKERS ? loopRange() : null}
        fallback={
          <>
            <Marker x={values.loopStart} class={styles.loopMarker} />
            <Marker x={values.loopEnd} class={styles.loopMarker} />
          </>
        }
      >
        {(range) => (
          <>
            <Marker x={range().start} class={styles.loopMarker} />
            <Marker x={range().end} class={styles.loopMarker} />
          </>
        )}
      </Show>
    </>
  );
};

export default SamplePointMarkers;
