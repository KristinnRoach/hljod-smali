import { Show } from 'solid-js';

import { pitchReading } from './pitchReading';
import styles from './Tuner.module.css';

/** Presentation only: accepts Hz from any detector, or null when silent. */
export default function Tuner(props: {
  frequency: number | null;
  layout?: 'row' | 'column';
  width?: string;
}) {
  const reading = () => pitchReading(props.frequency);
  const description = () => {
    const pitch = reading();
    if (!pitch) return 'Tuner: no pitch detected';
    const cents = Math.round(Math.abs(pitch.cents));
    return `${pitch.note}${pitch.octave}, ${Math.abs(pitch.cents) <= 3 ? 'in tune' : `${cents} cents ${pitch.cents < 0 ? 'flat' : 'sharp'}`}`;
  };

  return (
    <output
      class={styles.tuner}
      classList={{ [styles.column]: props.layout === 'column' }}
      style={{ width: props.width }}
      aria-label={description()}
      title={description()}
      aria-live="off"
    >
      <span class={styles.note}>
        {reading()?.note ?? '·'}
        <sub>{reading()?.octave}</sub>
      </span>
      <span class={styles.scale} aria-hidden="true">
        ♭
        <span class={styles.track}>
          <Show when={reading()}>
            {(pitch) => (
              <span
                class={styles.marker}
                classList={{ [styles.inTune]: Math.abs(pitch().cents) <= 3 }}
                style={{ left: `${50 + pitch().cents}%` }}
              />
            )}
          </Show>
        </span>
        ♯
      </span>
    </output>
  );
}
