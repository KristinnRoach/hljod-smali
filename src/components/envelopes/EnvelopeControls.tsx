import { For, Show, type Component } from 'solid-js';
import type { EnvelopeState, EnvelopeType } from '@kidlib/web-audio';
import SolidKnob from '../knobs/SolidKnob';
// eslint-disable-next-line no-unused-vars -- used as a `use:` directive below
import tooltip from '@/directives/tooltip';
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
      aria-label="Select Envelope"
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
      <input
        use:tooltip={['Enabled']}
        type="checkbox"
        checked={props.state?.enabled ?? false}
        disabled={!props.state}
        onChange={(event) =>
          props.onUpdate((current) => ({ ...current, enabled: event.currentTarget.checked }))
        }
      />

      <input
        use:tooltip={['Loop']}
        type="checkbox"
        checked={props.state?.loop ?? false}
        disabled={!props.state}
        onChange={(event) =>
          props.onUpdate((current) => ({ ...current, loop: event.currentTarget.checked }))
        }
      />

      <input
        use:tooltip={['Rate sync']}
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
    </div>

    <Show when={props.state?.shape.kind === 'points' ? props.state.shape : null}>
      {(shape) => (
        <div class={styles.pointRoleSelectors}>
          <select
            use:tooltip={['Select Sustain Point']}
            value={String(shape().sustainIndex ?? 'none')}
            onChange={(event) =>
              props.onUpdate((current) =>
                current.shape.kind === 'points'
                  ? {
                      ...current,
                      shape: {
                        ...current.shape,
                        sustainIndex:
                          event.currentTarget.value === 'none'
                            ? null
                            : Number(event.currentTarget.value),
                      },
                    }
                  : current,
              )
            }
          >
            <option value="none" selected={shape().sustainIndex == null}>
              off
            </option>
            <For each={shape().points}>
              {(_point, index) => (
                <option value={String(index())} selected={index() === shape().sustainIndex}>
                  {index()}
                </option>
              )}
            </For>
          </select>

          <select
            use:tooltip={['Select Release Point']}
            value={String(shape().releaseIndex)}
            onChange={(event) =>
              props.onUpdate((current) =>
                current.shape.kind === 'points'
                  ? {
                      ...current,
                      shape: {
                        ...current.shape,
                        releaseIndex: Number(event.currentTarget.value),
                      },
                    }
                  : current,
              )
            }
          >
            <For each={shape().points}>
              {(_point, index) => (
                <option value={String(index())} selected={index() === shape().releaseIndex}>
                  {index()}
                </option>
              )}
            </For>
          </select>
        </div>
      )}
    </Show>

    <div class={`${styles.speedKnobContainer}`}>
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
