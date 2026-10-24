import { expect, test } from 'vite-plus/test';
import { voicePlayheadBand } from './playheadBands';
import type { VoicePlayback } from './playbackState';

const voice = (): VoicePlayback => ({
  midiNote: 60,
  phase: 'playing',
  startOrder: 1,
  position: 0.5,
});

test('head stays centered and its width scales with the visible span', () => {
  expect(voicePlayheadBand(voice(), 1)).toEqual({ start: 0.49, end: 0.51 });
  const zoomed = voicePlayheadBand(voice(), 0.1)!;
  expect(zoomed.start).toBeCloseTo(0.499);
  expect(zoomed.end).toBeCloseTo(0.501);
});

test('unknown positions have no head', () => {
  expect(voicePlayheadBand({ ...voice(), position: undefined }, 1)).toBeUndefined();
});
