import type { NoteTarget } from '@kidlib/web-audio/io';

/** Instrument control stays outside the audio transport. Notes play on arrival;
 * sampleOffset is retained by the protocol but not scheduled in this version.
 * All MIDI channels address the same sampler.
 */
export class AudioPipeMidiInput {
  private held = new Map<number, { target: NoteTarget; count: number }>();

  constructor(private readonly getTarget: () => NoteTarget | null | undefined) {}

  receive(message: unknown): void {
    if (message === null) {
      this.reset();
      return;
    }
    if (!message || typeof message !== 'object' || !('type' in message) || message.type !== 'midi')
      return;
    if ('reset' in message && message.reset === true) this.reset();
    if (!('notes' in message) || !Array.isArray(message.notes)) return;
    for (const event of message.notes) {
      if (
        !event ||
        typeof event.on !== 'boolean' ||
        !Number.isInteger(event.note) ||
        event.note < 0 ||
        event.note > 127 ||
        !Number.isInteger(event.velocity) ||
        event.velocity < 0 ||
        event.velocity > 127
      )
        continue;
      if (event.on && event.velocity > 0) {
        const target = this.getTarget();
        if (!target) continue;
        const previous = this.held.get(event.note);
        if (previous && previous.target !== target) previous.target.release(event.note);
        target.play(event.note, event.velocity);
        this.held.set(event.note, {
          target,
          count: previous?.target === target ? previous.count + 1 : 1,
        });
      } else {
        const held = this.held.get(event.note);
        if (!held) continue;
        // SamplePlayer keeps one voice per pitch, so release it on the last note-off only.
        if (--held.count > 0) continue;
        this.held.delete(event.note);
        held.target.release(event.note);
      }
    }
  }

  private reset(): void {
    const held = [...this.held];
    this.held.clear();
    for (const [note, { target }] of held) target.release(note);
  }
}
