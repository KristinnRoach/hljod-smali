import { For, type Component } from 'solid-js';
import type { EnvelopeState, EnvelopeType } from '@kidlib/web-audio';
import SolidKnob from '../knobs/SolidKnob';
import styles from './EnvelopeControls.module.css';

export interface EnvelopeControlsProps {
  envType: EnvelopeType;
  envTypes: EnvelopeType[];
  state: EnvelopeState | null;
  onTypeChange: (type: EnvelopeType) => void;
  onUpdate: (updater: (current: EnvelopeState) => EnvelopeState) => void;
}

export const EnvelopeControls: Component<EnvelopeControlsProps> = (props) => (
  <div class={`${styles.bar} envelope-editor-controls`}>
      <select
        value={props.envType}
        onChange={(event) => props.onTypeChange(event.currentTarget.value as EnvelopeType)}
      >
        <For each={props.envTypes}>
          {(type) => (
            <option value={type} selected={type === props.envType}>
              {type}
            </option>
          )}
        </For>
      </select>

    <div class={styles.toggles}>
      <label class={styles.field}>
        <input
          type="checkbox"
          checked={props.state?.enabled ?? false}
          disabled={!props.state}
          onChange={(event) =>
            props.onUpdate((current) => ({ ...current, enabled: event.currentTarget.checked }))
          }
        />
        Enabled
      </label>

      <label class={styles.field}>
        <input
          type="checkbox"
          checked={props.state?.loop ?? false}
          disabled={!props.state}
          onChange={(event) =>
            props.onUpdate((current) => ({ ...current, loop: event.currentTarget.checked }))
          }
        />
        Loop
      </label>

      <label class={styles.field}>
        <input
          type="checkbox"
          checked={props.state?.playbackRateSync ?? false}
          disabled={!props.state}
          onChange={(event) =>
            props.onUpdate((current) => ({
              ...current,
              playbackRateSync: event.currentTarget.checked,
            }))
          }
        />
        Rate sync
      </label>
    </div>

    <div class={`${styles.field} ${styles.speed}`}>
      <label class={styles.knobLabel}>Speed</label>
      <SolidKnob
        class={styles.knob}
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
