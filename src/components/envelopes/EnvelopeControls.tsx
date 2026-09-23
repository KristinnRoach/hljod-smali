import { For, Show, type Component } from 'solid-js';
import type { EnvelopeConfig, SampleEnvelopeId } from '@kidlib/web-audio';
import SolidKnob from '../knobs/SolidKnob';
// eslint-disable-next-line no-unused-vars -- used as a `use:` directive below
import tooltip from '@/directives/tooltip';
import styles from './EnvelopeControls.module.css';
import { RadioGroup } from '../ui/RadioGroup';
import { Toggle } from '../ui/Toggle';

export interface EnvelopeControlsProps {
  envId: SampleEnvelopeId;
  envIds: SampleEnvelopeId[];
  state: EnvelopeConfig | null;
  rateSync: boolean;
  onIdChange: (id: SampleEnvelopeId) => void;
  onUpdate: (updater: (current: EnvelopeConfig) => EnvelopeConfig) => void;
  onRateSyncChange: (sync: boolean) => void;
}

export const EnvelopeControls: Component<EnvelopeControlsProps> = (props) => (
  <div class={`${styles.bar} envelope-editor-controls`}>
    {/* ponytail: pitch/filter envelopes are dev-only until their 0.5.0 value
        mapping settles, so production only edits amp-env. See #33. */}
    <Show when={import.meta.env.DEV}>
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
    </Show>

    <div class={styles.toggles}>
      {import.meta.env.DEV && (
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
      )}

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

        value={props.state?.envelope.mode.type ?? 'sustain'}
        disabled={!props.state}
        onChange={(mode) =>
          props.onUpdate((current) => ({
            ...current,
            envelope: { ...current.envelope, mode: { type: mode } },
          }))
        }
      />

      <Toggle
        ref={(el) => tooltip(el, () => ['Rate sync'])}
        aria-label="Envelope rate sync"
        class={styles.toggle}
        checked={props.rateSync}
        disabled={!props.state}
        onChange={props.onRateSyncChange}
      >
        ⇋
      </Toggle>
    </div>

    <Show when={props.state?.envelope}>
      {(envelope) => (
        <div class={styles.pointRoleSelectors}>
          <select
            use:tooltip={['Select Sustain Point']}
            aria-label="Sustain point"
            value={String(envelope().sustain)}
            onChange={(event) =>
              props.onUpdate((current) => ({
                ...current,
                envelope: { ...current.envelope, sustain: Number(event.currentTarget.value) },
              }))
            }
          >
            <For each={envelope().points}>
              {(_point, index) => (
                <option value={String(index())} selected={index() === envelope().sustain}>
                  {index()}
                </option>
              )}
            </For>
          </select>

          <select
            use:tooltip={['Select Release Point']}
            aria-label="Release point"
            value={String(envelope().release)}
            onChange={(event) =>
              props.onUpdate((current) => ({
                ...current,
                envelope: { ...current.envelope, release: Number(event.currentTarget.value) },
              }))
            }
          >
            <For each={envelope().points}>
              {(_point, index) => (
                <option value={String(index())} selected={index() === envelope().release}>
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
