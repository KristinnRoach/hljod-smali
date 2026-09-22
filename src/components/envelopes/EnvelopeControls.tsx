import { For, Show, type Component } from 'solid-js';
import type { EnvelopeMode, EnvelopeConfig, SampleEnvelopeId } from '@kidlib/web-audio';
import SolidKnob from '../knobs/SolidKnob';
// eslint-disable-next-line no-unused-vars -- used as a `use:` directive below
import tooltip from '@/directives/tooltip';
import styles from './EnvelopeControls.module.css';

const sustainAt = (mode: EnvelopeMode) => (mode.type === 'sustain' ? mode.at : undefined);

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
      <input
        use:tooltip={['Enabled']}
        aria-label="Envelope enabled"
        type="checkbox"
        checked={props.state?.enabled ?? false}
        disabled={!props.state}
        onChange={(event) =>
          props.onUpdate((current) => ({ ...current, enabled: event.currentTarget.checked }))
        }
      />

      <input
        use:tooltip={['Loop']}
        aria-label="Envelope loop"
        type="checkbox"
        checked={props.state?.envelope.mode.type === 'loop'}
        disabled={!props.state}
        onChange={(event) =>
          props.onUpdate((current) => ({
            ...current,
            // Loop and sustain are alternatives, so turning the loop off lands on 'once'.
            envelope: {
              ...current.envelope,
              mode: event.currentTarget.checked ? { type: 'loop' } : { type: 'once' },
            },
          }))
        }
      />

      <input
        use:tooltip={['Rate sync']}
        aria-label="Envelope rate sync"
        type="checkbox"
        checked={props.rateSync}
        disabled={!props.state}
        onChange={(event) => props.onRateSyncChange(event.currentTarget.checked)}
      />
    </div>

    <Show when={props.state?.envelope}>
      {(envelope) => (
        <div class={styles.pointRoleSelectors}>
          <select
            use:tooltip={['Select Sustain Point']}
            aria-label="Sustain point"
            value={String(sustainAt(envelope().mode) ?? 'none')}
            onChange={(event) =>
              props.onUpdate((current) => ({
                ...current,
                envelope: {
                  ...current.envelope,
                  mode:
                    event.currentTarget.value === 'none'
                      ? { type: 'once' }
                      : { type: 'sustain', at: Number(event.currentTarget.value) },
                },
              }))
            }
          >
            <option value="none" selected={sustainAt(envelope().mode) === undefined}>
              off
            </option>
            <For each={envelope().points}>
              {(_point, index) => (
                <option value={String(index())} selected={index() === sustainAt(envelope().mode)}>
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
