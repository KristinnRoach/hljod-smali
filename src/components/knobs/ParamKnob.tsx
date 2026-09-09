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

import { samplerParamValues, setSamplerParamValue } from '../../utils/samplerParamState';
import SolidKnob from './SolidKnob';

import styles from './ParamKnob.module.css';

interface ParamKnobProps {
  param: SamplerParamKey;
  player: SamplePlayer | null;
  label?: string;
  size?: number;
  class?: string;
  minAllowed?: () => number;
  maxAllowed?: () => number;
}

export const ParamKnob: Component<ParamKnobProps> = (props) => {
  const desc: SamplerParamDescriptor = samplerParams[props.param];
  const [sampleDuration, setSampleDuration] = createSignal(0);
  const value = () => samplerParamValues()[props.param];

  const handleChange = (requestedValue: number) => {
    const minAllowed = Math.max(desc.min, props.minAllowed?.() ?? desc.min);
    const maxAllowed = Math.min(desc.max, props.maxAllowed?.() ?? desc.max);
    const clampedValue = Math.max(minAllowed, Math.min(requestedValue, maxAllowed));

    setSamplerParamValue(props.param, clampedValue);
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
    <div data-param={props.param} class={`${styles.knobContainer} ${props.class ?? ''}`}>
      <div class={styles.knobLabel}>{label()}</div>
      <SolidKnob
        class={styles.knobControl}
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
      <div class={styles.knobValue}>{readout()}</div>
    </div>
  );
};

export default ParamKnob;
