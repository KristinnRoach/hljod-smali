import { createEffect, createRoot, createSignal, onCleanup, untrack } from 'solid-js';
import type { SamplePlayer } from '@kidlib/web-audio';

// One player per session. App creates and disposes it.
export const [samplePlayer, setSamplePlayer] = createSignal<SamplePlayer | null>(null);

// For consumers outside Solid's graph (MidiMan, the DEV window handle).
// `untrack` keeps a call from a tracking scope from subscribing.
export const getSamplePlayer = () => untrack(samplePlayer);

// Player messages as signals: subscribed once here instead of per component.
const [loopEnabled, setLoopEnabled] = createSignal(false);
// Loop the engine resolved (0..1 of the sample), null until a voice reports it.
const [loopRange, setLoopRange] = createSignal<{ start: number; end: number } | null>(null);
// Trim the engine resolved (0..1, ordered; `inverted` plays backward), same as loopRange.
const [trimRange, setTrimRange] = createSignal<{
  start: number;
  end: number;
  inverted: boolean;
} | null>(null);
export { loopEnabled, loopRange, trimRange };

createRoot(() =>
  createEffect(() => {
    const player = samplePlayer();
    setLoopEnabled(player?.loopEnabled ?? false);
    setLoopRange(null);
    setTrimRange(null);
    if (!player) return;
    onCleanup(
      player.onMessage('trim:range', (msg) => {
        const duration = player.sampleDuration;
        if (duration > 0)
          setTrimRange({
            start: msg.startPoint / duration,
            end: msg.endPoint / duration,
            inverted: msg.inverted,
          });
      }),
    );
    onCleanup(player.onMessage('loop:enabled', (msg) => setLoopEnabled(msg.enabled)));
    onCleanup(
      player.onMessage('loop:range', (msg) => {
        const duration = player.sampleDuration;
        if (duration > 0)
          setLoopRange({ start: msg.loopStart / duration, end: msg.loopEnd / duration });
      }),
    );
  }),
);

// dev-only handle so e2e tests can inspect voice pool state
if (import.meta.env.DEV) {
  (window as any).getSamplePlayer = getSamplePlayer;
}
