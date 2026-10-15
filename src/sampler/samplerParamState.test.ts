import { expect, test, vi } from 'vite-plus/test';

// @kidlib/web-audio subclasses AudioWorkletNode at import time.
vi.stubGlobal('AudioWorkletNode', class {});
const { samplerParamValues, setSamplerParamValue, scaleSamplePointsToRange } =
  await import('./samplerParamState');

// test('trim moves drag the loop points with them', () => {
//   setSamplerParamValue('loopStart', 0.2);
//   setSamplerParamValue('loopEnd', 0.8);

//   setSamplerParamValue('trimStart', 0.5);
//   setSamplerParamValue('trimEnd', 0.6);

//   expect(samplerParamValues().loopStart).toBe(0.5);
//   expect(samplerParamValues().loopEnd).toBe(0.6);
// });

// test('trim moved past the whole loop keeps the loop inside it, not inverted', () => {
//   setSamplerParamValue('trimStart', 0);
//   setSamplerParamValue('trimEnd', 1);
//   setSamplerParamValue('loopStart', 0.5);
//   setSamplerParamValue('loopEnd', 0.8);

//   setSamplerParamValue('trimEnd', 0.3);

//   expect(samplerParamValues().loopStart).toBe(0.3);
//   expect(samplerParamValues().loopEnd).toBe(0.3);
// });

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
