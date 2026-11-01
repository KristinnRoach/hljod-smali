const NOTES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];

/** Closest equal-tempered note, A4 = 440 Hz. */
export function pitchReading(hz: number | null) {
  if (hz === null || !Number.isFinite(hz) || hz <= 0) return null;
  const midi = 69 + 12 * Math.log2(hz / 440);
  const note = Math.round(midi);
  return {
    note: NOTES[((note % 12) + 12) % 12],
    octave: Math.floor(note / 12) - 1,
    cents: (midi - note) * 100,
  };
}
