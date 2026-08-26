import { createEffect, createSignal, type Component } from 'solid-js';
import type { SamplePlayer } from '@kidlib/web-audio';
import styles from './SamplerToggle.module.css';

/**
 * Text-labelled boolean player controls. Lives here rather than in
 * @kidlib/web-audio because label and format are presentation: the package
 * owns the setters, the app owns how they read.
 */
interface SamplerToggleDescriptor {
  label: string;
  defaultValue: boolean;
  format: (enabled: boolean) => string;
  apply: (player: SamplePlayer, enabled: boolean) => void;
}

export const samplerToggles = {
  timestretch: {
    label: 'Timestretch',
    defaultValue: false,
    format: (enabled) => (enabled ? 'Warp' : 'RePitch'),
    apply: (player, enabled) => player.setTimestretchEnabled(enabled),
  },
  panDrift: {
    label: 'Pan drift',
    defaultValue: true,
    format: (enabled) => (enabled ? '\u25D0' : '\u25CB'),
    apply: (player, enabled) => player.setPanDriftEnabled(enabled),
  },
  feedbackMode: {
    label: 'Feedback mode',
    defaultValue: true,
    format: (enabled) => (enabled ? 'Poly' : 'Mono'),
    apply: (player, enabled) => player.setFeedbackMode(enabled ? 'polyphonic' : 'monophonic'),
  },
  gainLFOSync: {
    label: 'Amp LFO sync',
    defaultValue: false,
    format: (enabled) => (enabled ? 'Sync' : 'Free'),
    apply: (player, enabled) => player.syncLFOsToNoteFreq('gain-lfo', enabled),
  },
  pitchLFOSync: {
    label: 'Pitch LFO sync',
    defaultValue: false,
    format: (enabled) => (enabled ? 'Sync' : 'Free'),
    apply: (player, enabled) => player.syncLFOsToNoteFreq('pitch-lfo', enabled),
  },
} as const satisfies Record<string, SamplerToggleDescriptor>;

export type SamplerToggleKey = keyof typeof samplerToggles;

interface SamplerToggleProps {
  param: SamplerToggleKey;
  player: SamplePlayer | null;
  class?: string;
}

const SamplerToggle: Component<SamplerToggleProps> = (props) => {
  const descriptor = samplerToggles[props.param];
  const [enabled, setEnabled] = createSignal(descriptor.defaultValue);

  createEffect(() => {
    const player = props.player;
    if (player) descriptor.apply(player, enabled());
  });

  return (
    <div class={props.class || ''}>
      <label
        class={`${styles.toggle} ${enabled() ? styles.enabled : ''} ${props.player ? '' : styles.disabled}`}
        title={descriptor.label}
      >
        <input
          class={styles.input}
          type="checkbox"
          aria-label={descriptor.label}
          checked={enabled()}
          disabled={!props.player}
          onInput={(event) => setEnabled(event.currentTarget.checked)}
        />
        <span class={styles.container} aria-hidden="true">
          <span class={styles.switch} />
        </span>
        <span class={styles.label}>{descriptor.format(enabled())}</span>
      </label>
    </div>
  );
};

export default SamplerToggle;
