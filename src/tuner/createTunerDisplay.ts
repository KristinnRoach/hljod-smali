import { type Accessor, createComputed, createMemo, createSignal, on, onCleanup } from 'solid-js';

import { pitchReading } from './pitchReading';

/** Retain the last pitch through brief gaps, then let CSS fade it out. */
export function createTunerDisplay(frequency: Accessor<number | null>) {
  const [reading, setReading] = createSignal<ReturnType<typeof pitchReading>>(null);
  const [visible, setVisible] = createSignal(false);

  createComputed(() => {
    const pitch = pitchReading(frequency());
    if (pitch) {
      setReading(pitch);
      setVisible(true);
    } else {
      const timer = setTimeout(() => setVisible(false), 150);
      onCleanup(() => clearTimeout(timer));
    }
  });

  // Cents updates should move the marker without restarting the note crossfade.
  const note = createMemo(() => reading(), null, {
    equals: (a, b) => a?.note === b?.note && a?.octave === b?.octave,
  });
  const [previousNote, setPreviousNote] = createSignal<ReturnType<typeof pitchReading>>(null);
  createComputed(on(note, (_current, previous) => setPreviousNote(previous ?? null)));

  return { reading, visible, note, previousNote };
}
