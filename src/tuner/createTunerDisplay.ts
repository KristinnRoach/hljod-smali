import { type Accessor, createComputed, createSignal, onCleanup } from 'solid-js';

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

  return { reading, visible };
}
