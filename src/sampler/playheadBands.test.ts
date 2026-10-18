import { expect, test } from 'vite-plus/test';
import { voicePlayheadBand } from './playheadBands';
import type { VoicePlayback } from './playbackState';

const voice = (delta: number, elapsed = 20): VoicePlayback => ({
  midiNote: 60,
  phase: 'playing',
  startOrder: 1,
  position: 0.5,
  motion: { from: 0.5 - delta, at: 100, delta, previousDelta: delta, elapsed },
});

test('trails fade behind forward and reverse playheads and preserve the bright head', () => {
  const forward = voicePlayheadBand(voice(0.1), 1)!;
  const reverse = voicePlayheadBand(voice(-0.1), 1)!;
  expect(forward.start).toBeCloseTo(0.34);
  expect(forward.end).toBeCloseTo(0.51);
  expect(forward.fadeIn).toBeGreaterThan(0);
  expect(reverse.start).toBeCloseTo(0.49);
  expect(reverse.end).toBeCloseTo(0.66);
  expect(reverse.fadeOut).toBeLessThan(1);
});

test('caps trail width relative to zoom and suppresses discontinuities', () => {
  const band = voicePlayheadBand(voice(0.2), 0.1)!;
  expect(band.end - band.start).toBeCloseTo(0.017);
  expect(voicePlayheadBand(voice(-0.8), 1)?.fadeOut).toBeUndefined();
  expect(voicePlayheadBand(voice(0.1, 200), 1)?.fadeIn).toBeUndefined();
  const wrapped = voice(-0.05);
  wrapped.motion!.previousDelta = 0.1;
  expect(voicePlayheadBand(wrapped, 1)?.fadeOut).toBeUndefined();
  const shortLoop = { ...voice(0.06), loop: { start: 0.45, end: 0.55 } };
  expect(voicePlayheadBand(shortLoop, 1)?.fadeIn).toBeUndefined();
});

test('unknown and stationary positions do not create trails', () => {
  expect(voicePlayheadBand({ ...voice(0), position: undefined }, 1)).toBeUndefined();
  expect(voicePlayheadBand(voice(0), 1)?.fadeIn).toBeUndefined();
});

test('extended trails stay inside loop boundaries', () => {
  const forward = voicePlayheadBand({ ...voice(0.02), loop: { start: 0.46, end: 0.6 } }, 1)!;
  expect(forward.start).toBeCloseTo(0.46);
  const reverse = voicePlayheadBand({ ...voice(-0.02), loop: { start: 0.4, end: 0.54 } }, 1)!;
  expect(reverse.end).toBeCloseTo(0.54);
});

test('short active loops are steady only while enabled and visually narrow', () => {
  const short = { ...voice(0.01), loop: { start: 0.495, end: 0.505 } };
  expect(voicePlayheadBand(short, 1, true)).toEqual(short.loop);
  expect(voicePlayheadBand(short, 1, false)).not.toEqual(short.loop);
  expect(voicePlayheadBand(short, 0.1, true)).not.toEqual(short.loop);
  expect(voicePlayheadBand({ ...short, position: 0.2 }, 1, true)).not.toEqual(short.loop);
});
