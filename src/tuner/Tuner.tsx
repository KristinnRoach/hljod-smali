import { createTunerDisplay } from './createTunerDisplay';
import styles from './Tuner.module.css';

/** Presentation only: accepts Hz from any detector, or null when silent. */
export default function Tuner(props: {
  frequency: number | null;
  layout?: 'row' | 'column';
  width?: string;
}) {
  const display = createTunerDisplay(() => props.frequency);
  const description = () => {
    const pitch = display.reading();
    if (!pitch || !display.visible()) return 'Tuner: no pitch detected';
    const cents = Math.round(Math.abs(pitch.cents));
    return `${pitch.note}${pitch.octave}, ${Math.abs(pitch.cents) <= 3 ? 'in tune' : `${cents} cents ${pitch.cents < 0 ? 'flat' : 'sharp'}`}`;
  };

  return (
    <output
      class={styles.tuner}
      classList={{
        [styles.column]: props.layout === 'column',
        [styles.silent]: !display.visible(),
      }}
      style={{ width: props.width }}
      aria-label={description()}
      title={description()}
      aria-live="off"
    >
      <span class={styles.note}>
        {display.reading()?.note}
        <sub>{display.reading()?.octave}</sub>
      </span>
      <span class={styles.scale} aria-hidden="true">
        ♭
        <span class={styles.track}>
          <span
            class={styles.marker}
            classList={{ [styles.inTune]: Math.abs(display.reading()?.cents ?? Infinity) <= 3 }}
            style={{ left: `${50 + (display.reading()?.cents ?? 0)}%` }}
          />
        </span>
        ♯
      </span>
    </output>
  );
}
