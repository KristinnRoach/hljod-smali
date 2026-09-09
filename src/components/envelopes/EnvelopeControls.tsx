import { For, type Component } from 'solid-js';
import type { EnvelopeState, EnvelopeType } from '@kidlib/web-audio';

export interface EnvelopeControlsProps {
  envType: EnvelopeType;
  envTypes: EnvelopeType[];
  state: EnvelopeState | null;
  onTypeChange: (type: EnvelopeType) => void;
  onUpdate: (updater: (current: EnvelopeState) => EnvelopeState) => void;
}

export const EnvelopeControls: Component<EnvelopeControlsProps> = (props) => (
  <div class="envelope-editor-controls">
    <label>
      Envelope
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
    </label>

    <label>
      Enabled
      <input
        type="checkbox"
        checked={props.state?.enabled ?? false}
        disabled={!props.state}
        onChange={(event) =>
          props.onUpdate((current) => ({ ...current, enabled: event.currentTarget.checked }))
        }
      />
    </label>

    <label>
      Loop
      <input
        type="checkbox"
        checked={props.state?.loop ?? false}
        disabled={!props.state}
        onChange={(event) =>
          props.onUpdate((current) => ({ ...current, loop: event.currentTarget.checked }))
        }
      />
    </label>

    <label>
      Rate sync
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
    </label>

    <label>
      Time scale {props.state?.timeScale.toFixed(1) ?? '1.0'}
      <input
        type="range"
        min="0.1"
        max="16"
        step="0.1"
        value={props.state?.timeScale ?? 1}
        disabled={!props.state}
        onInput={(event) =>
          props.onUpdate((current) => ({
            ...current,
            timeScale: Number(event.currentTarget.value),
          }))
        }
      />
    </label>
  </div>
);

export default EnvelopeControls;
