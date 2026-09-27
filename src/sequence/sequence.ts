import type { SamplePlayer } from '@kidlib/web-audio';
import { onNote } from '@/io/noteInput';

/** A note-on, or a note-off when velocity is 0, `time` seconds into the Sequence. */
export type SequenceEvent = { time: number; note: number; velocity: number };

/** Recorded note events that repeat every `length` seconds. */
export type Sequence = { events: SequenceEvent[]; length: number };

type Player = Pick<SamplePlayer, 'play' | 'release' | 'releaseAll'> & {
  context: { currentTime: number };
};

const LOOKAHEAD_S = 0.1;
const TICK_MS = 25;

/**
 * Records every live note source until the returned function is called, which
 * returns the Sequence, or null if no note was played. The Sequence starts
 * at the first note-on and ends when recording stops.
 */
// ponytail: ignores the sustain pedal; route it through noteInput and record
// it if this goes further.
export function recordSequence(): () => Sequence | null {
  const events: SequenceEvent[] = [];
  let startMs: number | undefined;

  const unsub = onNote(({ note, velocity, time }) => {
    if (startMs === undefined && velocity === 0) return;
    startMs ??= time;
    events.push({ time: (time - startMs) / 1000, note, velocity });
  });

  return () => {
    unsub();
    if (startMs === undefined) return null;
    return toSequence(events, (performance.now() - startMs) / 1000);
  };
}

/**
 * Orders events by time, since sources stamp their own times and can arrive
 * a few ms out of order, and releases notes still held when recording
 * stopped, so they can't hang on playback.
 */
export function toSequence(recorded: SequenceEvent[], length: number): Sequence {
  const events = recorded.toSorted((a, b) => a.time - b.time);
  const held = new Set<number>();
  for (const { note, velocity } of events) {
    if (velocity > 0) held.add(note);
    else held.delete(note);
  }
  const offs = [...held].map((note) => ({ time: length, note, velocity: 0 }));
  return { events: [...events, ...offs], length };
}

/**
 * Loops the Sequence on the player until the returned function is called.
 * A timer looks LOOKAHEAD_S ahead and schedules each note on the audio clock,
 * so notes land on time even though the timer itself jitters.
 */
// ponytail: background tabs throttle setInterval to ~1s, which starves the
// lookahead. Move the timer to a Worker if playback must survive that.
export function playSequence(player: Player, sequence: Sequence): () => void {
  const { events, length } = sequence;
  if (!events.length || length <= 0) return () => {};

  const now = () => player.context.currentTime;
  let loopStart = now();
  let i = 0;

  const tick = () => {
    const until = now() + LOOKAHEAD_S;
    while (loopStart + events[i].time <= until) {
      const { time, note, velocity } = events[i];
      const secondsFromNow = Math.max(0, loopStart + time - now());
      // Straight to the player, not through noteInput, so a recording never hears the Sequence.
      if (velocity > 0) player.play(note, velocity, undefined, secondsFromNow);
      else player.release(note, secondsFromNow);

      if (++i === events.length) {
        i = 0;
        loopStart += length;
      }
    }
  };

  tick();
  const timer = setInterval(tick, TICK_MS);

  return () => {
    clearInterval(timer);
    // ponytail: also releases notes played live, the simplest way to catch
    // notes already scheduled inside the lookahead window.
    player.releaseAll(0.1);
  };
}
