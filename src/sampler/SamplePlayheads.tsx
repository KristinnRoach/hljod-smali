import { For, Show, type Component } from 'solid-js';

import { voices } from './playbackState';
import styles from './SamplePlayheads.module.css';

// The engine's glideTime is a time constant; easeOutExpo (2^-10t) spans about 7 of them.
const GLIDE_DURATION_SCALE = 7;

export const noteAppearance = (midiNote: number) => ({
  y: 80 - (Math.max(0, Math.min(127, midiNote)) / 127) * 60,
  color: `hsl(${(midiNote % 12) * 30} 80% 65%)`,
});

const Playhead: Component<{
  x: number;
  midiNote: number;
  distinguishVoices?: boolean;
  releasing: boolean;
  releaseDuration?: number;
  glideTime?: number;
  glideFromNote?: number;
}> = (props) => {
  const appearance = () => (props.distinguishVoices ? noteAppearance(props.midiNote) : undefined);
  // Read once: only the first frame starts from it, later changes don't matter.
  const from =
    props.distinguishVoices && props.glideFromNote !== undefined
      ? noteAppearance(props.glideFromNote)
      : undefined;
  return (
    <span
      class={styles.head}
      classList={{ [styles.releasing]: props.releasing }}
      style={{
        left: `${props.x * 100}%`,
        '--playhead-y': appearance() ? `${appearance()!.y}%` : undefined,
        '--playhead-color': appearance()?.color,
        '--playhead-from-y': from ? `${from.y}%` : undefined,
        '--playhead-from-color': from?.color,
        '--glide-duration': `${(props.glideTime ?? 0) * GLIDE_DURATION_SCALE}s`,
        '--release-duration':
          props.releaseDuration !== undefined ? `${props.releaseDuration}s` : undefined,
      }}
    />
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
            glideTime={voice.glideTime}
            glideFromNote={voice.glideFromNote}
          />
        </Show>
      )}
    </For>
  </div>
);

export default SamplePlayheads;
