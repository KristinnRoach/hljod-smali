import { expect, test } from 'vite-plus/test';

import { noteAppearance, playheadTrail } from './SamplePlayheads';

test('higher notes sit higher, with vertical positions bounded to the plot interior', () => {
  expect(noteAppearance(0).y).toBe(80);
  expect(noteAppearance(127).y).toBe(20);
  expect(noteAppearance(72).y).toBeLessThan(noteAppearance(60).y);
  expect(noteAppearance(-1).y).toBe(80);
  expect(noteAppearance(128).y).toBe(20);
});

test('pitch classes share colors across octaves', () => {
  expect(noteAppearance(60).color).toBe(noteAppearance(72).color);
  expect(noteAppearance(60).color).not.toBe(noteAppearance(61).color);
});

test('playheadTrail omits initial, slow, and large jump/wrap updates', () => {
  expect(playheadTrail(undefined, 0.5)).toBeUndefined();
  expect(playheadTrail(0.5, 0.502)).toBeUndefined();
  expect(playheadTrail(0.95, 0.05)).toBeUndefined();
});

test('playheadTrail stretches behind forward and backward movement', () => {
  const forward = playheadTrail(0.2, 0.24);
  expect(forward?.direction).toBe('forward');
  expect(forward?.width).toBeCloseTo(0.06);
  expect(forward?.start).toBeCloseTo(0.18);

  const backward = playheadTrail(0.5, 0.46);
  expect(backward?.direction).toBe('backward');
  expect(backward?.width).toBeCloseTo(0.06);
  expect(backward?.start).toBeCloseTo(0.46);
});
