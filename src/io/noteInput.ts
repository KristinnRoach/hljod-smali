import type { NoteTarget } from '@kidlib/web-audio/io';

/** A note-on, or a note-off when velocity is 0. `time` is ms on the performance.now() clock. */
export type NoteInputEvent = { note: number; velocity: number; time: number };

type NoteListener = (event: NoteInputEvent) => void;

const listeners = new Set<NoteListener>();

/**
 * Every live note source plays through playNote/releaseNote, so a listener
 * such as the Sequence recorder hears all of them. The source still picks the
 * target, since several track which player a held note went to. Pass the
 * source event's `timeStamp` as `time` when there is one: it shares
 * performance.now()'s clock and says when the note happened, not when this ran.
 */
export function playNote(
  target: NoteTarget,
  note: number,
  velocity = 100,
  time = performance.now(),
): void {
  target.play(note, velocity);
  listeners.forEach((listener) => listener({ note, velocity, time }));
}

export function releaseNote(target: NoteTarget, note: number, time = performance.now()): void {
  target.release(note);
  listeners.forEach((listener) => listener({ note, velocity: 0, time }));
}

export function onNote(listener: NoteListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
