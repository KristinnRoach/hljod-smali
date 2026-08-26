import { createEffect, createSignal, type Component, type JSX } from 'solid-js';
import type { SamplePlayer } from '@kidlib/web-audio';
import styles from './SamplerIconToggle.module.css';

/**
 * Icon-rendered counterpart to SamplerToggle. Same descriptor shape as
 * `samplerToggles` in @kidlib/web-audio, minus `format`: these controls show an
 * SVG rather than a text label. Kept app-side because the icons are app assets.
 */
interface IconToggleDescriptor {
  label: string;
  defaultValue: boolean;
  icon: (enabled: boolean) => JSX.Element;
  apply: (player: SamplePlayer, enabled: boolean) => void;
}

const LoopIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 1.6 24 20.747" fill="currentColor">
    <path d="M 1.412 11.973 C 1.412 15.085 3.827 17.616 6.795 17.616 L 6.795 19.026 C 3.048 19.026 0 15.862 0 11.973 C 0 8.084 3.048 4.919 6.795 4.919 L 12.765 4.919 L 10.441 2.597 L 11.44 1.6 L 15.469 5.625 L 11.441 9.651 L 10.441 8.652 L 12.767 6.33 L 6.795 6.33 C 3.827 6.33 1.412 8.861 1.412 11.973 Z M 17.205 4.919 L 17.205 6.33 C 20.173 6.33 22.588 8.861 22.588 11.973 C 22.588 15.085 20.173 17.616 17.205 17.616 L 11.233 17.616 L 13.557 15.294 L 12.559 14.296 L 8.531 18.321 L 12.56 22.347 L 13.559 21.35 L 11.233 19.026 L 17.204 19.026 C 20.952 19.026 24 15.862 24 11.973 C 24 8.084 20.952 4.919 17.205 4.919 Z" />
  </svg>
);

const HoldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="4 0 16 24" fill="currentColor">
    <path d="M 14.667 2 L 20 2 L 20 22 L 14.667 22 L 14.667 2 Z M 4 2 L 9.333 2 L 9.333 22 L 4 22 L 4 2 Z" />
  </svg>
);

const PitchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="4 0 16 24" fill="currentColor">
    <path d="M 12 0 L 12 14.067 C 11.213 13.613 10.307 13.333 9.333 13.333 C 6.387 13.333 4 15.72 4 18.667 C 4 21.613 6.387 24 9.333 24 C 12.28 24 14.667 21.613 14.667 18.667 L 14.667 5.333 L 20 5.333 L 20 0 L 12 0 Z" />
  </svg>
);

const ForwardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path
      d="M 34.241 44.441 H 47.535 L 44.848 38.728 L 56.716 46.728 L 44.848 54.728 L 47.535 49.016 H 34.241 V 44.441 Z"
      transform="matrix(1, -0.000377, 0.000377, 1, -33.6977, -33.24232)"
    />
  </svg>
);

const ReverseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path
      d="M -34.241 -33.015 H -20.947 L -23.634 -38.728 L -11.766 -30.728 L -23.634 -22.728 L -20.947 -28.441 H -34.241 V -33.015 Z"
      transform="matrix(-1, -0.000377, -0.000377, 1, -10.84163, 44.18786)"
    />
  </svg>
);

export const samplerIconToggles = {
  playbackDirection: {
    label: 'Toggle Playback Direction',
    defaultValue: false,
    icon: (enabled) => (enabled ? <ReverseIcon /> : <ForwardIcon />),
    apply: (player, enabled) => player.setPlaybackDirection(enabled ? 'reverse' : 'forward'),
  },
  loopLock: {
    label: 'Toggle Loop Locked',
    defaultValue: false,
    icon: () => <LoopIcon />,
    apply: (player, enabled) => player.setLoopLocked(enabled),
  },
  holdLock: {
    label: 'Toggle Hold Locked',
    defaultValue: false,
    icon: () => <HoldIcon />,
    apply: (player, enabled) => player.setHoldLocked(enabled),
  },
  pitch: {
    label: 'Toggle Pitch',
    defaultValue: true,
    icon: () => <PitchIcon />,
    apply: (player, enabled) => player.setPitchEnabled(enabled),
  },
} as const satisfies Record<string, IconToggleDescriptor>;

export type SamplerIconToggleKey = keyof typeof samplerIconToggles;

interface SamplerIconToggleProps {
  param: SamplerIconToggleKey;
  player: SamplePlayer | null;
  class?: string;
}

const SamplerIconToggle: Component<SamplerIconToggleProps> = (props) => {
  const descriptor = samplerIconToggles[props.param];
  const [enabled, setEnabled] = createSignal<boolean>(descriptor.defaultValue);

  createEffect(() => {
    const player = props.player;
    if (player) descriptor.apply(player, enabled());
  });

  return (
    <button
      type="button"
      title={descriptor.label}
      aria-label={descriptor.label}
      aria-pressed={enabled()}
      disabled={!props.player}
      class={`${styles.button} ${enabled() ? '' : styles.off} ${props.player ? '' : styles.disabled} ${props.class || ''}`}
      onClick={() => setEnabled((current) => !current)}
    >
      {descriptor.icon(enabled())}
    </button>
  );
};

export default SamplerIconToggle;
