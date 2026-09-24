import { For, Show, type Component } from 'solid-js';
import type { EnvelopeConfig, SampleEnvelopeId } from '@kidlib/web-audio';
import { RadioGroup } from '@/ui/RadioGroup';
import { Toggle } from '@/ui/Toggle';
import SolidKnob from '@/ui/SolidKnob';
// eslint-disable-next-line no-unused-vars -- used as a `use:` directive below
import tooltip from '@/ui/tooltip';
import styles from './EnvelopeControls.module.css';

export interface EnvelopeControlsProps {
  envId: SampleEnvelopeId;
  envIds: SampleEnvelopeId[];
  state: EnvelopeConfig | null;
  onIdChange: (id: SampleEnvelopeId) => void;
  onUpdate: (updater: (current: EnvelopeConfig) => EnvelopeConfig) => void;
}

export const EnvelopeControls: Component<EnvelopeControlsProps> = (props) => (
  <div class={styles.bar}>
    <select
      aria-label="Select Envelope"
      value={props.envId}
      onChange={(event) => props.onIdChange(event.currentTarget.value as SampleEnvelopeId)}
    >
      <For each={props.envIds}>
        {(id) => (
          <option value={id} selected={id === props.envId}>
            {id}
          </option>
        )}
      </For>
    </select>

    <div class={styles.toggles}>
      <Toggle
        ref={(el) => tooltip(el, () => ['Enabled'])}
        aria-label="Envelope enabled"
        class={styles.toggle}
        checked={props.state?.enabled ?? false}
        disabled={!props.state}
        onChange={(enabled) => props.onUpdate((current) => ({ ...current, enabled }))}
      >
        <span class={styles.dot} />
      </Toggle>

      <RadioGroup
        aria-label="Envelope mode"
        title="Envelope mode"
        hideInput
        class={styles.modeSelector}
        options={[
          {
            value: 'once',
            label: '▶',
            ariaLabel: 'One-Shot',
            attrs: { ref: (el) => tooltip(el, () => ['One-Shot']) },
          },
          {
            value: 'sustain',
            label: '▶│',
            ariaLabel: 'Sustain',
            attrs: { ref: (el) => tooltip(el, () => ['Sustain']) },
          },
          {
            value: 'loop',
            label: '↻',
            ariaLabel: 'Loop',
            attrs: { ref: (el) => tooltip(el, () => ['Loop']) },
          },
        ]}

        value={props.state?.shape.mode.type ?? 'sustain'}
        disabled={!props.state}
        onChange={(mode) =>
          props.onUpdate((current) => ({
            ...current,
            shape: { ...current.shape, mode: { type: mode } },
          }))
        }
      />

      <Toggle
        ref={(el) => tooltip(el, () => ['Rate sync'])}
        aria-label="Envelope rate sync"
        class={styles.toggle}
        checked={props.state?.playbackRateSync ?? false}
        disabled={!props.state}
        onChange={(playbackRateSync) =>
          props.onUpdate((current) => ({ ...current, playbackRateSync }))
        }
      >
        ⇋
      </Toggle>
    </div>

    <Show when={props.state?.shape}>
      {(shape) => (
        <div class={styles.pointRoleSelectors}>
          <select
            use:tooltip={['Select Sustain Point']}
            aria-label="Sustain point"
            value={String(shape().sustainPoint)}
            onChange={(event) =>
              props.onUpdate((current) => ({
                ...current,
                shape: { ...current.shape, sustainPoint: Number(event.currentTarget.value) },
              }))
            }
          >
            <For each={shape().points}>
              {(_point, index) => (
                <option value={String(index())} selected={index() === shape().sustainPoint}>
                  {index()}
                </option>
              )}
            </For>
          </select>

          <select
            use:tooltip={['Select Release Point']}
            aria-label="Release point"
            value={String(shape().releasePoint)}
            onChange={(event) =>
              props.onUpdate((current) => ({
                ...current,
                shape: { ...current.shape, releasePoint: Number(event.currentTarget.value) },
              }))
            }
          >
            <For each={shape().points}>
              {(_point, index) => (
                <option value={String(index())} selected={index() === shape().releasePoint}>
                  {index()}
                </option>
              )}
            </For>
          </select>
        </div>
      )}
    </Show>

    <div class={`${styles.speedKnobContainer}`}>
      <label>Speed</label>
      <SolidKnob
        label="Envelope speed"
        value={props.state?.timeScale ?? 1}
        min={0.1}
        max={16}
        step={0.5}
        defaultValue={1}
        size={28}
        disabled={!props.state}
        onChange={(timeScale) => props.onUpdate((current) => ({ ...current, timeScale }))}
      />
      <output class={styles.value}>{props.state?.timeScale.toFixed(1) ?? '1.0'}×</output>
    </div>
  </div>
);

export default EnvelopeControls;
