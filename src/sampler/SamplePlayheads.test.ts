import { expect, test } from 'vite-plus/test';

import { noteAppearance, shouldConnectPositions, trailFadeAlpha } from './SamplePlayheads';

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

test('trailFadeAlpha scales consistently across frame rates', () => {
  expect(trailFadeAlpha(0)).toBe(0);
  const fade60 = trailFadeAlpha(1000 / 60, 45);
  const fade120 = trailFadeAlpha(1000 / 120, 45);
  // Two 120Hz decay steps should match one 60Hz decay step.
  expect((1 - fade120) ** 2).toBeCloseTo(1 - fade60);
});

test('shouldConnectPositions bridges normal movement and skips initial or wrap jumps', () => {
  expect(shouldConnectPositions(undefined, 0.5)).toBe(false);
  expect(shouldConnectPositions(0.2, 0.25)).toBe(true);
  expect(shouldConnectPositions(0.5, 0.45)).toBe(true);
  expect(shouldConnectPositions(0.95, 0.05)).toBe(false);
});
