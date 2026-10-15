// Generic Solid knob for any SamplePlayer parameter, driven by web-audio's
// samplerParams descriptors. Replaces the per-param web components
// (volume-knob, feedback-knob, ...) from audio-components.
import { Component, createEffect, createSignal, onCleanup } from 'solid-js';

import {
  samplerParams,
  type SamplerParamKey,
  type SamplerParamDescriptor,
  type SamplePlayer,
} from '@kidlib/web-audio';

import { samplerParamValues, setSamplerParamValue } from './samplerParamState';
import SolidKnob from '@/ui/SolidKnob';

import styles from './ParamKnob.module.css';

// Temp flags while testing with local web-audio trim/loop point changes
const SAMPLE_POINT_DEBOUNCE_MS = 0;
const USE_MIN_MAX_ALLOWED = false;
const SAMPLE_POINT_PARAMS = new Set<SamplerParamKey>([
  'trimStart',
  'trimEnd',
  'loopStart',
  'loopEnd',
]);

interface ParamKnobProps {
  param: SamplerParamKey;
  player: SamplePlayer | null;
  label?: string;
  size?: number;
  class?: string;
  layout?: 'row' | 'column';
  minAllowed?: () => number;
  maxAllowed?: () => number;
}

const ParamKnob: Component<ParamKnobProps> = (props) => {
  const desc: SamplerParamDescriptor = samplerParams[props.param];
  const [sampleDuration, setSampleDuration] = createSignal(0);
  const value = () => samplerParamValues()[props.param];

  const handleChange = (requestedValue: number) => {
    if (USE_MIN_MAX_ALLOWED) {
      const minAllowed = Math.max(desc.min, props.minAllowed?.() ?? desc.min);
      const maxAllowed = Math.min(desc.max, props.maxAllowed?.() ?? desc.max);
      const clampedValue = Math.max(minAllowed, Math.min(requestedValue, maxAllowed));
      setSamplerParamValue(props.param, clampedValue);
    } else {
      setSamplerParamValue(props.param, requestedValue);
    }
  };

  // Keep the player and visible knob in sync with Play's parameter state.
  createEffect(() => {
    const nextValue = value();

    const player = props.player;
    if (!player) return;

    if (!SAMPLE_POINT_PARAMS.has(props.param) || SAMPLE_POINT_DEBOUNCE_MS <= 0) {
      desc.apply(player, nextValue);
      return;
    }
    // ponytail: trailing debounce -- zoom rescales all four points per wheel
    // event and the processor's loop snapping glitches on the stream. The
    // cleanup cancels the pending apply when the value changes again.
    const timer = setTimeout(() => desc.apply(player, nextValue), SAMPLE_POINT_DEBOUNCE_MS);
    onCleanup(() => clearTimeout(timer));
  });

  // On player ready, track the loaded sample's duration for the seconds
  // readout of normalized params. These listeners must not be recreated when
  // the knob value changes.
  createEffect(() => {
    const player = props.player;
    if (!player) return;

    const unsubscribe: Array<() => void> = [];

    setSampleDuration(player.sampleDuration);
    unsubscribe.push(
      player.onMessage('sample:loaded', (msg: any) => setSampleDuration(msg.durationSeconds)),
    );

    onCleanup(() => unsubscribe.forEach((stop) => stop()));
  });

  const label = () => props.label ?? desc.label;
  const format = desc.format ?? ((v: number, _duration: number) => v.toFixed(2));
  const readout = () => format(value(), sampleDuration());

  return (
    <div
      data-param={props.param}
      data-layout={props.layout}
      class={`${styles.knobContainer} ${props.class ?? ''}`}
    >
      <div class={styles.knobLabel}>{label()}</div>
      <SolidKnob
        label={label()}
        value={value()}
        min={desc.min}
        max={desc.max}
        defaultValue={desc.defaultValue}
        size={props.size}
        step={desc.step}
        curve={desc.curve}
        allowedValues={desc.allowedValues}
        onChange={handleChange}
      />
      <span class={styles.knobValue}>{readout()}</span>
    </div>
  );
};

export default ParamKnob;
