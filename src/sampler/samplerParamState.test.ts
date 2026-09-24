import { expect, test, vi } from 'vite-plus/test';

// @kidlib/web-audio subclasses AudioWorkletNode at import time.
vi.stubGlobal('AudioWorkletNode', class {});
const { samplerParamValues, setSamplerParamValue } = await import('./samplerParamState');

test('trim moves drag the loop points with them', () => {
  setSamplerParamValue('loopStart', 0.2);
  setSamplerParamValue('loopEnd', 0.8);

  setSamplerParamValue('trimStart', 0.5);
  setSamplerParamValue('trimEnd', 0.6);

  expect(samplerParamValues().loopStart).toBe(0.5);
  expect(samplerParamValues().loopEnd).toBe(0.6);
});
