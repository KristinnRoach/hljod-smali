import { createEffect, createRoot, createSignal, onCleanup, untrack } from 'solid-js';
import type { SamplePlayer } from '@kidlib/web-audio';

// One player per session. App creates and disposes it.
export const [samplePlayer, setSamplePlayer] = createSignal<SamplePlayer | null>(null);

// For consumers outside Solid's graph (MidiMan, the DEV window handle).
// `untrack` keeps a call from a tracking scope from subscribing.
export const getSamplePlayer = () => untrack(samplePlayer);

// Player messages as signals: subscribed once here instead of per component.
const [loopEnabled, setLoopEnabled] = createSignal(false);
export { loopEnabled };

createRoot(() =>
  createEffect(() => {
    const player = samplePlayer();
    setLoopEnabled(player?.loopEnabled ?? false);
    if (player) onCleanup(player.onMessage('loop:enabled', (msg) => setLoopEnabled(msg.enabled)));
  }),
);

// dev-only handle so e2e tests can inspect voice pool state
if (import.meta.env.DEV) {
  (window as any).getSamplePlayer = getSamplePlayer;
}
