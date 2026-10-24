import { beforeEach, expect, test, vi } from 'vite-plus/test';

// @kidlib/web-audio subclasses AudioWorkletNode at import time.
vi.stubGlobal('AudioWorkletNode', class {});
const { samplerParamValues, setSamplerParamValue, scaleSamplerParamRange, setLoopDurationLocked } =
  await import('./samplerParamState');

beforeEach(() => setLoopDurationLocked(false));

test('zoom scales all playback points together and reset restores their positions', () => {
  setSamplerParamValue('trimStart', 0);
  setSamplerParamValue('trimEnd', 1);
  setSamplerParamValue('loopStart', 0.2);
  setSamplerParamValue('loopEnd', 0.8);
  const full = { start: 0, end: 1 };
  const zoomed = { start: 0.25, end: 0.75 };

  scaleSamplerParamRange(['trimStart', 'trimEnd', 'loopStart', 'loopEnd'], full, zoomed);
  expect(samplerParamValues().trimStart).toBe(0.25);
  expect(samplerParamValues().trimEnd).toBe(0.75);
  expect(samplerParamValues().loopStart).toBeCloseTo(0.35);
  expect(samplerParamValues().loopEnd).toBeCloseTo(0.65);

  scaleSamplerParamRange(['trimStart', 'trimEnd', 'loopStart', 'loopEnd'], zoomed, full);
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

  scaleSamplerParamRange(
    ['trimStart', 'trimEnd', 'loopStart', 'loopEnd'],
    { start: 0, end: 1 },
    { start: 0.8, end: 1 },
  );
  expect(samplerParamValues().loopStart).toBeCloseTo(0.84);
  expect(samplerParamValues().loopEnd).toBeCloseTo(0.88);
});

test('scales only selected parameters', () => {
  setSamplerParamValue('trimStart', 0);
  setSamplerParamValue('loopStart', 0.2);

  scaleSamplerParamRange(['trimStart'], { start: 0, end: 1 }, { start: 0.25, end: 0.75 });

  expect(samplerParamValues().trimStart).toBe(0.25);
  expect(samplerParamValues().loopStart).toBe(0.2);
});

test('zoom scaling reads the current parameter selection', async () => {
  const { zoomScaledParams, setZoomScaledParams } = await import('./samplerParamState');

  const original = zoomScaledParams();
  try {
    setSamplerParamValue('trimStart', 0);
    setSamplerParamValue('loopStart', 0.2);
    setZoomScaledParams(['trimStart']);
    scaleSamplerParamRange(zoomScaledParams(), { start: 0, end: 1 }, { start: 0.25, end: 0.75 });
    expect(samplerParamValues().trimStart).toBe(0.25);
    expect(samplerParamValues().loopStart).toBe(0.2);

    setZoomScaledParams(['loopStart']);
    scaleSamplerParamRange(zoomScaledParams(), { start: 0.25, end: 0.75 }, { start: 0, end: 1 });
    expect(samplerParamValues().trimStart).toBe(0.25);
    expect(samplerParamValues().loopStart).toBe(0);
  } finally {
    setZoomScaledParams(original);
  }
});

test('loop endpoints and signed duration stay consistent, including boundary clamping', () => {
  setSamplerParamValue('loopStart', 0.6);
  setSamplerParamValue('loopEnd', 0.9);
  expect(samplerParamValues().loopDuration).toBeCloseTo(0.3);

  setSamplerParamValue('loopDuration', -0.2);
  expect(samplerParamValues().loopEnd).toBeCloseTo(0.4);
  expect(samplerParamValues().loopStart).toBe(0.6);

  setSamplerParamValue('loopStart', 0.8);
  expect(samplerParamValues().loopEnd).toBeCloseTo(0.4);
  expect(samplerParamValues().loopDuration).toBeCloseTo(-0.4);

  setSamplerParamValue('loopDuration', -1);
  expect(samplerParamValues().loopEnd).toBe(0);
  expect(samplerParamValues().loopDuration).toBe(-0.8);
  setSamplerParamValue('loopDuration', 1);
  expect(samplerParamValues().loopEnd).toBe(1);
  expect(samplerParamValues().loopDuration).toBeCloseTo(0.2);
});

test('restore uses endpoints when a saved duration disagrees', async () => {
  const { restoreSamplerParamValues } = await import('./samplerParamState');
  restoreSamplerParamValues({ loopStart: 0.8, loopEnd: 0.2, loopDuration: 1 });
  expect(samplerParamValues().loopDuration).toBeCloseTo(-0.6);
  restoreSamplerParamValues({ loopDuration: -0.3 });
  expect(samplerParamValues().loopEnd).toBe(0.5);
});

test('zoom scales a selected signed duration as a length', () => {
  setSamplerParamValue('loopStart', 0.8);
  setSamplerParamValue('loopDuration', -0.4);
  scaleSamplerParamRange(['loopDuration'], { start: 0, end: 1 }, { start: 0.25, end: 0.75 });
  expect(samplerParamValues().loopStart).toBe(0.8);
  expect(samplerParamValues().loopDuration).toBeCloseTo(-0.2);
  expect(samplerParamValues().loopEnd).toBeCloseTo(0.6);
});

test.each([0.2, -0.2, 0])('locked Start moves the loop with signed duration %s', (duration) => {
  setSamplerParamValue('loopStart', 0.5);
  setSamplerParamValue('loopDuration', duration);
  setLoopDurationLocked(true);
  try {
    setSamplerParamValue('loopStart', 0.6);
    expect(samplerParamValues().loopStart).toBe(0.6);
    expect(samplerParamValues().loopEnd).toBeCloseTo(0.6 + duration);

    setSamplerParamValue('loopStart', 1);
    expect(samplerParamValues().loopStart).toBeCloseTo(1 - Math.max(0, duration));
    expect(samplerParamValues().loopEnd).toBeCloseTo(1 + Math.min(0, duration));
    expect(samplerParamValues().loopDuration).toBeCloseTo(duration);

    setSamplerParamValue('loopStart', 0);
    expect(samplerParamValues().loopStart).toBeCloseTo(Math.max(0, -duration));
    expect(samplerParamValues().loopEnd).toBeCloseTo(Math.max(0, duration));
    expect(samplerParamValues().loopDuration).toBeCloseTo(duration);
  } finally {
    setLoopDurationLocked(false);
  }
});

test('Duration and End remain editable while locked; unlocking leaves End fixed', () => {
  setSamplerParamValue('loopStart', 0.5);
  setLoopDurationLocked(true);
  try {
    setSamplerParamValue('loopDuration', -0.2);
    expect(samplerParamValues().loopStart).toBe(0.5);
    expect(samplerParamValues().loopEnd).toBeCloseTo(0.3);

    setSamplerParamValue('loopEnd', 0.9);
    expect(samplerParamValues().loopDuration).toBeCloseTo(0.4);
    setSamplerParamValue('loopStart', 0.4);
    expect(samplerParamValues().loopEnd).toBeCloseTo(0.8);

    setLoopDurationLocked(false);
    setSamplerParamValue('loopStart', 0.2);
    expect(samplerParamValues().loopEnd).toBeCloseTo(0.8);
    expect(samplerParamValues().loopDuration).toBeCloseTo(0.6);
  } finally {
    setLoopDurationLocked(false);
  }
});
