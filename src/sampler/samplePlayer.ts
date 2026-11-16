import { createSignal, untrack } from 'solid-js';
import type { SamplePlayer } from '@kidlib/web-audio';

// The primary player drives the UI. createSampler creates and disposes it.
export const [samplePlayer, setSamplePlayer] = createSignal<SamplePlayer | null>(null);

// For consumers outside Solid's graph (MidiMan, the DEV window handle).
// `untrack` keeps a call from a tracking scope from subscribing.
export const getSamplePlayer = () => untrack(samplePlayer);

export const [sampleLayers, setSampleLayers] = createSignal<SamplePlayer[]>([]);

/** The live collection for MIDI, computer keyboard and scheduled playback. */
export const getSamplePlayers = () =>
  untrack(() => {
    const primary = samplePlayer();
    return [...(primary ? [primary] : []), ...sampleLayers()].filter((player) => !player.disposed);
  });

// Player configuration the engine echoes back, synced in createSampler.
// What is sounding (voices, resolved ranges) lives in playbackState.ts.
export const [loopEnabled, setLoopEnabled] = createSignal(false);

// dev-only handle so e2e tests can inspect voice pool state
if (import.meta.env.DEV) {
  (window as any).getSamplePlayer = getSamplePlayer;
}
