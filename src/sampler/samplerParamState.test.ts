import { expect, test, vi } from 'vite-plus/test';

// @kidlib/web-audio subclasses AudioWorkletNode at import time.
vi.stubGlobal('AudioWorkletNode', class {});
const { samplerParamValues, setSamplerParamValue, scaleSamplePointsToRange } =
  await import('./samplerParamState');

test('zoom scales all playback points together and reset restores their positions', () => {
  setSamplerParamValue('trimStart', 0);
  setSamplerParamValue('trimEnd', 1);
  setSamplerParamValue('loopStart', 0.2);
  setSamplerParamValue('loopEnd', 0.8);
  const full = { start: 0, end: 1 };
  const zoomed = { start: 0.25, end: 0.75 };

  scaleSamplePointsToRange(full, zoomed);
  expect(samplerParamValues().trimStart).toBe(0.25);
  expect(samplerParamValues().trimEnd).toBe(0.75);
  expect(samplerParamValues().loopStart).toBeCloseTo(0.35);
  expect(samplerParamValues().loopEnd).toBeCloseTo(0.65);

  scaleSamplePointsToRange(zoomed, full);
  expect(samplerParamValues().trimStart).toBe(0);
  expect(samplerParamValues().trimEnd).toBe(1);
  expect(samplerParamValues().loopStart).toBeCloseTo(0.2);
  expect(samplerParamValues().loopEnd).toBeCloseTo(0.8);
});

test('moving the viewport past the old loop preserves its width', () => {
  setSamplerParamValue('trimStart', 0);
  setSamplerParamValue('trimEnd', 1);
  setSamplerParamValue('loopStart', 0.2);
  setSamplerParamValue('loopEnd', 0.4);

  scaleSamplePointsToRange({ start: 0, end: 1 }, { start: 0.8, end: 1 });
  expect(samplerParamValues().loopStart).toBeCloseTo(0.84);
  expect(samplerParamValues().loopEnd).toBeCloseTo(0.88);
});
