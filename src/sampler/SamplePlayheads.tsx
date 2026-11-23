import { createMemo, For, Show, type Component } from 'solid-js';

import { voices } from './playbackState';
import styles from './SamplePlayheads.module.css';

export const noteAppearance = (midiNote: number) => ({
  y: 80 - (Math.max(0, Math.min(127, midiNote)) / 127) * 60,
  color: `hsl(${(midiNote % 12) * 30} 80% 65%)`,
});

const MIN_TRAIL_SPAN = 0.005;
const MAX_TRAIL_SPAN = 0.35;
const TRAIL_MULTIPLIER = 1.5;

export type PlayheadTrail = {
  start: number;
  width: number;
  direction: 'forward' | 'backward';
};

/** Velocity-stretched motion trail bridging consecutive frame positions; omitted when slow or jumping. */
export const playheadTrail = (
  previousX: number | undefined,
  x: number,
): PlayheadTrail | undefined => {
  if (previousX === undefined) return;
  const dx = x - previousX;
  const step = Math.abs(dx);
  if (step < MIN_TRAIL_SPAN || step > MAX_TRAIL_SPAN) return;

  const width = Math.min(step * TRAIL_MULTIPLIER, MAX_TRAIL_SPAN);
  if (dx > 0) {
    return { start: x - width, width, direction: 'forward' };
  }
  return { start: x, width, direction: 'backward' };
};

const Playhead: Component<{
  x: number;
  midiNote: number;
  distinguishVoices?: boolean;
  releasing: boolean;
  releaseDuration?: number;
}> = (props) => {
  const appearance = () => (props.distinguishVoices ? noteAppearance(props.midiNote) : undefined);
  const trailState = createMemo<{ x: number; trail: PlayheadTrail | undefined }>((prev) => ({
    x: props.x,
    trail: playheadTrail(prev?.x, props.x),
  }));
  const sharedStyle = () => ({
    '--playhead-y': appearance() ? `${appearance()!.y}%` : undefined,
    '--playhead-color': appearance()?.color,
    '--release-duration':
      props.releaseDuration !== undefined ? `${props.releaseDuration}s` : undefined,
  });

  return (
    <>
      <Show when={trailState().trail}>
        {(trail) => (
          <span
            class={styles.trail}
            classList={{
              [styles.backward]: trail().direction === 'backward',
              [styles.releasing]: props.releasing,
            }}
            style={{
              ...sharedStyle(),
              left: `${trail().start * 100}%`,
              width: `${trail().width * 100}%`,
            }}
          />
        )}
      </Show>
      <span
        class={styles.head}
        classList={{ [styles.releasing]: props.releasing }}
        style={{
          ...sharedStyle(),
          left: `${props.x * 100}%`,
        }}
      />
    </>
  );
};

/** Independent of waveform drawing; positions use the current visible sample range. */
const SamplePlayheads: Component<{
  start: number;
  end: number;
  distinguishVoices?: boolean;
}> = (props) => (
  <div class={styles.playheads} aria-hidden="true">
    <For each={Object.values(voices)}>
      {(voice) => (
        <Show when={voice.position !== undefined}>
          <Playhead
            x={(voice.position! - props.start) / (props.end - props.start)}
            midiNote={voice.midiNote}
            distinguishVoices={props.distinguishVoices}
            releasing={voice.phase === 'releasing'}
            releaseDuration={voice.releaseDuration}
          />
        </Show>
      )}
    </For>
  </div>
);

export default SamplePlayheads;
