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
const USE_MIN_MAX_ALLOWED: Partial<Record<SamplerParamKey, boolean>> = {
  trimStart: false, // true false
  trimEnd: false,
  loopStart: false,
  loopEnd: false,
};

interface ParamKnobProps {
  param: SamplerParamKey;
  player: SamplePlayer | null;
  label?: string;
  size?: number;
  class?: string;
  layout?: 'row' | 'column';
  minAllowed?: () => number;
  maxAllowed?: () => number;
  /** Adds friction near this value and a detent that must be pushed through to cross it. */
  detentAt?: () => number;
}

const FRICTION_ZONE = 0.4; // normalized distance where resistance starts
const MIN_GAIN = 0.08; // slowest movement right at the detent
const DETENT_PUSH = 0.2; // extra travel needed to break through the detent

const ParamKnob: Component<ParamKnobProps> = (props) => {
  const desc: SamplerParamDescriptor = samplerParams[props.param];
  const [sampleDuration, setSampleDuration] = createSignal(0);
  const value = () => samplerParamValues()[props.param];

  let detentPush = 0;
  const resist = (current: number, requested: number, detent: number) => {
    const delta = requested - current;
    const gap = detent - current;
    if (gap === 0) {
      detentPush += Math.abs(delta);
      if (detentPush < DETENT_PUSH) return current;
      detentPush = 0;
      return requested;
    }
    detentPush = 0;
    const scaled = delta * Math.max(MIN_GAIN, Math.min(1, Math.abs(gap) / FRICTION_ZONE));
    const crosses = Math.sign(scaled) === Math.sign(gap) && Math.abs(scaled) >= Math.abs(gap);
    return crosses ? detent : current + scaled;
  };

  const handleChange = (requestedValue: number) => {
    if (props.detentAt) requestedValue = resist(value(), requestedValue, props.detentAt());
    if (USE_MIN_MAX_ALLOWED[props.param]) {
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

    desc.apply(player, nextValue);
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
