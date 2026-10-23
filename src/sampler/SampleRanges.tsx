import { Show, type Component } from 'solid-js';

import styles from './SampleRanges.module.css';
import { loopEnabled } from './samplePlayer';
import { samplerParamValues, setSamplerParamValue, moveLoop } from './samplerParamState';
import Marker from '@/ui/Marker';
import Region from '@/ui/Region';

type PointParam = 'trimStart' | 'trimEnd' | 'loopStart' | 'loopEnd';

const setPoint = (param: PointParam) => (x: number) =>
  setSamplerParamValue(param, Math.max(0, Math.min(1, x)));

/** Trimmed-out areas (and the inverted span when start > end) plus the trim markers. */
export const TrimRange: Component = () => {
  const values = samplerParamValues();
  const inverted = () => values.trimStart > values.trimEnd;
  return (
    <>
      <Region
        x1={inverted() ? values.trimEnd : 0}
        x2={inverted() ? 0 : values.trimStart}
        class={styles.trimmedOut}
      />
      <Region
        x1={inverted() ? 1 : values.trimEnd}
        x2={inverted() ? values.trimStart : 1}
        class={styles.trimmedOut}
      />
      <Show when={inverted()}>
        <Region x1={values.trimEnd} x2={values.trimStart} class={styles.inverted} />
      </Show>
      <Marker x={values.trimStart} class={styles.trimMarker} onChange={setPoint('trimStart')} />
      <Marker x={values.trimEnd} class={styles.trimMarker} onChange={setPoint('trimEnd')} />
    </>
  );
};

/** Loop span, markers and drag handle. Markers are inert while looping is off. */
export const LoopRange: Component = () => {
  const values = samplerParamValues();
  const inverted = () => values.loopStart > values.loopEnd;
  const markerClass = () => styles.loopMarker + (loopEnabled() ? ` ${styles.loopEnabled}` : '');
  const regionClass = () => styles.loopRegion + (inverted() ? ` ${styles.inverted}` : '');
  const handleClass = () => styles.loopHandle + (inverted() ? ` ${styles.inverted}` : '');

  return (
    <>
      <Show when={loopEnabled()}>
        <Region x1={values.loopStart} x2={values.loopEnd} class={regionClass()} />
      </Show>
      <Marker
        x={values.loopStart}
        class={markerClass()}
        onChange={loopEnabled() ? setPoint('loopStart') : undefined}
      />
      <Marker
        x={values.loopEnd}
        class={markerClass()}
        onChange={loopEnabled() ? setPoint('loopEnd') : undefined}
      />
      <Show when={loopEnabled()}>
        <Region
          class={handleClass()}
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
