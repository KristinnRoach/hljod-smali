import { createStore, produce, reconcile } from 'solid-js/store';
import type { SamplePlayer } from '@kidlib/web-audio';

// What is sounding right now, per voice, as display-ready state for visuals.
// Owns voice lifecycle (started -> releasing -> stopped) and unit conversion
// (seconds -> 0..1 of the sample). Player configuration (loopEnabled) lives in
// samplePlayer.ts, param values in samplerParamState.ts.

export type Range01 = { start: number; end: number };

export type VoicePlayback = {
  midiNote: number;
  phase: 'playing' | 'releasing';
  /** Trigger order, so selectors can pick the newest voice. */
  startOrder: number;
  /** Loop the engine resolved, once the voice reports it. */
  loop?: Range01;
  /** Trim the engine resolved, ordered; `inverted` plays backward. */
  trim?: Range01 & { inverted: boolean };
};

const [voices, setVoices] = createStore<Record<string, VoicePlayback>>({});
export { voices };

/** The most recently triggered voice still sounding, including its release tail. */
export const latestVoice = (): VoicePlayback | undefined =>
  Object.values(voices).reduce<VoicePlayback | undefined>(
    (latest, voice) => (!latest || voice.startOrder > latest.startOrder ? voice : latest),
    undefined,
  );

export const loopRange = () => latestVoice()?.loop ?? null;
export const trimRange = () => latestVoice()?.trim ?? null;

let startOrder = 0;

/** Mirrors `player`'s voice messages into `voices`. Returns a dispose that clears them. */
export const connectPlayback = (player: SamplePlayer): (() => void) => {
  const toUnit = (seconds: number) => seconds / player.sampleDuration;
  // Range messages are dropped for unknown voices: voice:started is sent on the
  // main thread before the processor can report anything for that trigger.
  const known = (voiceId: string) => voiceId in voices && player.sampleDuration > 0;

  const unsubscribes = [
    player.onMessage('voice:started', (msg) => {
      // Assign, not merge: a retriggered voice can start without stopping first.
      setVoices(
        produce((all) => {
          all[msg.voiceId] = { midiNote: msg.midiNote, phase: 'playing', startOrder: ++startOrder };
        }),
      );
    }),
    player.onMessage('voice:releasing', (msg) => {
      if (msg.voiceId in voices) setVoices(msg.voiceId, 'phase', 'releasing');
    }),
    // Sent once the voice is silent (after its release tail), not on note-off.
    player.onMessage('voice:stopped', (msg) =>
      setVoices(
        produce((all) => {
          delete all[msg.voiceId];
        }),
      ),
    ),
    player.onMessage('loop:range', (msg) => {
      if (!known(msg.voiceId)) return;
      setVoices(msg.voiceId, 'loop', { start: toUnit(msg.loopStart), end: toUnit(msg.loopEnd) });
    }),
    player.onMessage('trim:range', (msg) => {
      if (!known(msg.voiceId)) return;
      setVoices(msg.voiceId, 'trim', {
        start: toUnit(msg.startPoint),
        end: toUnit(msg.endPoint),
        inverted: msg.inverted,
      });
    }),
  ];

  return () => {
    unsubscribes.forEach((unsubscribe) => unsubscribe());
    setVoices(reconcile({}));
  };
};
