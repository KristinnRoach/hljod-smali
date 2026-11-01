import { expect, test } from 'vite-plus/test';

import { pitchReading } from './pitchReading';

test('finds the closest note and signed cents around A4', () => {
  expect(pitchReading(440)).toEqual({ note: 'A', octave: 4, cents: 0 });
  for (const cents of [-49, -12, 12, 49]) {
    const pitch = pitchReading(440 * 2 ** (cents / 1200));
    expect(pitch?.note).toBe('A');
    expect(pitch?.octave).toBe(4);
    expect(pitch?.cents).toBeCloseTo(cents);
  }
});

test('changes the closest note across semitone and octave boundaries', () => {
  expect(pitchReading(440 * 2 ** (51 / 1200))?.note).toBe('A♯');
  expect(pitchReading(440 * 2 ** ((60 - 69) / 12))).toEqual({ note: 'C', octave: 4, cents: 0 });
  expect(pitchReading(440 * 2 ** ((59 - 69) / 12))).toEqual({ note: 'B', octave: 3, cents: 0 });
});

test('silence and invalid frequencies have no reading', () => {
  for (const hz of [null, 0, -440, NaN, Infinity]) expect(pitchReading(hz)).toBeNull();
});
