import { Show, type Component } from 'solid-js';

import styles from './SamplePointMarkers.module.css';
import { loopEnabled, loopRange, trimRange } from './samplePlayer';
import { samplerParamValues } from './samplerParamState';
import Marker from '@/ui/Marker';
import Region from '@/ui/Region';

// Testing aid: bands and markers for the loop and trim the engine resolved. Maybe drop for prod.
const SHOW_RESOLVED_LOOP_REGION = true;
const SHOW_RESOLVED_LOOP_MARKERS = true;
const SHOW_RESOLVED_TRIM_REGION = true;
const SHOW_RESOLVED_TRIM_MARKERS = true;

const HIDE_UNRESOLVED_REGIONS = true;

export const SampleRegions: Component = () => {
  const values = samplerParamValues();
  return (
    <>
      <Show when={!HIDE_UNRESOLVED_REGIONS}>
        <Region x1={0} x2={values.trimStart} class={styles.trimmedOut} />
        <Region x1={values.trimEnd} x2={1} class={styles.trimmedOut} />
      </Show>
      <Show when={SHOW_RESOLVED_TRIM_REGION}>
        <Show when={trimRange()}>
          {(range) => (
            <>
              <Region x1={0} x2={range().start} class={`${styles.trimmedOutResolved}}`} />
              <Region x1={range().end} x2={1} class={styles.trimmedOutResolved} />
            </>
          )}
        </Show>
        <Show
          when={(() => {
            const range = trimRange();
            return range?.inverted ? range : undefined;
          })()}
        >
          {(range) => (
            <Region x1={range().start} x2={range().end} class={styles.trimmedInsideInverted} />
          )}
        </Show>
      </Show>
      <Show when={loopEnabled()}>
        <Show when={!HIDE_UNRESOLVED_REGIONS}>
          <Region x1={values.loopStart} x2={values.loopEnd} class={styles.loopActive} />
        </Show>
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
