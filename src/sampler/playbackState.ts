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
  /** Playhead, 0..1 of the sample, while position tracking is on. */
  position?: number;
  /** Effective release duration reported by the engine, in seconds. */
  releaseDuration?: number;
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

  // Display-only interpolation. Remove this block and assign position in the message
  // handler to return to raw engine reports; no audio or waveform code depends on it.
  const pendingPositions = new Map<
    string,
    { from: number; to: number; at: number; duration: number; delta: number }
  >();
  let frame: number | undefined;
  const flushPositions = (now: number) => {
    frame = undefined;
    let moving = false;
    setVoices(
      produce((all) => {
        for (const [voiceId, motion] of pendingPositions) {
          if (!all[voiceId]) continue;
          const progress = motion.duration
            ? Math.min(1, Math.max(0, (now - motion.at) / motion.duration))
            : 1;
          all[voiceId].position = motion.from + (motion.to - motion.from) * progress;
          if (progress < 1) moving = true;
        }
      }),
    );
    if (moving) frame = requestAnimationFrame(flushPositions);
  };
  const queuePosition = (voiceId: string, position: number) => {
    const voice = voices[voiceId];
    const previous = pendingPositions.get(voiceId);
    const at = performance.now();
    const elapsed = previous ? at - previous.at : 0;
    const delta = previous ? position - previous.to : 0;
    const range = voice.loop ?? voice.trim ?? { start: 0, end: 1 };
    // Snap on first report, long gaps, reversals, or large jumps (including wraps).
    const snap =
      !previous ||
      elapsed <= 0 ||
      elapsed > 100 ||
      delta * previous.delta < 0 ||
      Math.abs(delta) > (range.end - range.start) / 2;
    pendingPositions.set(voiceId, {
      from: snap ? position : (voice.position ?? position),
      to: position,
      at,
      duration: snap ? 0 : Math.min(elapsed, 50),
      delta: snap ? 0 : delta,
    });
    if (frame === undefined) frame = requestAnimationFrame(flushPositions);
  };

  const unsubscribes = [
    player.onMessage('voice:started', (msg) => {
      pendingPositions.delete(msg.voiceId);
      // Assign, not merge: a retriggered voice can start without stopping first.
      setVoices(
        produce((all) => {
          all[msg.voiceId] = { midiNote: msg.midiNote, phase: 'playing', startOrder: ++startOrder };
        }),
      );
    }),
    player.onMessage('voice:releasing', (msg) => {
      if (!(msg.voiceId in voices)) return;
      setVoices(msg.voiceId, {
        phase: 'releasing',
        releaseDuration: msg.releaseDuration,
      });
    }),
    // Sent once the voice is silent (after its release tail), not on note-off.
    player.onMessage('voice:stopped', (msg) => {
      pendingPositions.delete(msg.voiceId);
      setVoices(
        produce((all) => {
          delete all[msg.voiceId];
        }),
      );
    }),
    player.onMessage('loop:range', (msg) => {
      if (!known(msg.voiceId)) return;
      setVoices(msg.voiceId, 'loop', { start: toUnit(msg.loopStart), end: toUnit(msg.loopEnd) });
    }),
    player.onMessage('voice:position', (msg) => {
      if (!known(msg.voiceId)) return;
      queuePosition(msg.voiceId, msg.position);
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
    if (frame !== undefined) cancelAnimationFrame(frame);
    pendingPositions.clear();
    unsubscribes.forEach((unsubscribe) => unsubscribe());
    setVoices(reconcile({}));
  };
};
