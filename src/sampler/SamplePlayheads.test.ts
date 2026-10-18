import { expect, test } from 'vite-plus/test';

import { noteAppearance } from './SamplePlayheads';

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
