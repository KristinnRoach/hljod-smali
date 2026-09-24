import { createSignal, untrack } from 'solid-js';
import type { SamplePlayer } from '@kidlib/web-audio';

// One player per session. App creates and disposes it.
export const [samplePlayer, setSamplePlayer] = createSignal<SamplePlayer | null>(null);

// For consumers outside Solid's graph (MidiMan, the DEV window handle).
// `untrack` keeps a call from a tracking scope from subscribing.
export const getSamplePlayer = () => untrack(samplePlayer);

// dev-only handle so e2e tests can inspect voice pool state
if (import.meta.env.DEV) {
  (window as any).getSamplePlayer = getSamplePlayer;
}
