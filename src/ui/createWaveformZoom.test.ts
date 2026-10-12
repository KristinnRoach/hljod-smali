import { expect, test } from 'vite-plus/test';

import { zoomWaveformRange } from './createWaveformZoom';

test('zoom keeps the buffer position under the pointer fixed', () => {
  const current = { start: 0.2, end: 0.8 };
  const anchor = 0.25;
  const next = zoomWaveformRange(current, anchor, 0.5);

  expect(next.end - next.start).toBeCloseTo(0.3);
  expect(next.start + anchor * (next.end - next.start)).toBeCloseTo(0.35);
  expect(zoomWaveformRange(next, anchor, 2)).toEqual(current);
});

test('zoom is bounded at the sample edges and at 100×', () => {
  expect(zoomWaveformRange({ start: 0.8, end: 1 }, 1, 10)).toEqual({ start: 0, end: 1 });
  const next = zoomWaveformRange({ start: 0, end: 1 }, 0, 0.0001);
  expect(next).toEqual({ start: 0, end: 0.01 });
});

test('invalid gesture values leave the range unchanged', () => {
  const current = { start: 0, end: 1 };
  for (const factor of [0, -1, NaN, Infinity]) {
    expect(zoomWaveformRange(current, 0.5, factor)).toBe(current);
  }
  expect(zoomWaveformRange(current, NaN, 0.5)).toBe(current);
});
