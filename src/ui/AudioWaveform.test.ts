import { expect, test } from 'vite-plus/test';

import { getAudioWaveformPath, getAudioWaveformPeaks } from './AudioWaveform';

const buffer = (...channels: number[][]): AudioBuffer =>
  ({
    length: channels[0]?.length ?? 0,
    numberOfChannels: channels.length,
    getChannelData: (channel: number) => Float32Array.from(channels[channel] ?? []),
  }) as AudioBuffer;

test('each peak includes transients between representative sample positions', () => {
  const peaks = getAudioWaveformPeaks(buffer([0, 0.9, 0, 0, 0, -0.8, 0, 0]), 2);

  expect(peaks).toEqual([
    { min: 0, max: expect.closeTo(0.9) },
    { min: expect.closeTo(-0.8), max: 0 },
  ]);
});

test('peaks include every channel', () => {
  const peaks = getAudioWaveformPeaks(buffer([0, 0, 0, 0], [0.75, 0, -0.5, 0]), 1);

  expect(peaks).toEqual([{ min: -0.5, max: 0.75 }]);
});

test('peak count is bounded by the available samples', () => {
  expect(getAudioWaveformPeaks(buffer([0, 1]), 100)).toHaveLength(2);
  expect(getAudioWaveformPeaks(buffer([]), 100)).toEqual([]);
});

test('zoom peaks exclude samples outside the visible range', () => {
  expect(getAudioWaveformPeaks(buffer([-1, -1, 0.2, 0.4, 0.6, 0.8, 1, 1]), 2, 0.25, 0.75)).toEqual([
    { min: expect.closeTo(0.2), max: expect.closeTo(0.4) },
    { min: expect.closeTo(0.6), max: expect.closeTo(0.8) },
  ]);
});

test('a sub-sample range still produces a peak', () => {
  expect(getAudioWaveformPeaks(buffer([0, 0.75, 0, 0]), 300, 0.3, 0.31)).toEqual([
    { min: 0.75, max: 0.75 },
  ]);
});

test('invalid ranges fall back to the full buffer and out-of-bounds ranges are clamped', () => {
  const source = buffer([-0.5, 0.5]);
  const full = getAudioWaveformPeaks(source);
  expect(getAudioWaveformPeaks(source, 300, 0.8, 0.2)).toEqual(full);
  expect(getAudioWaveformPeaks(source, 300, 0.5, 0.5)).toEqual(full);
  expect(getAudioWaveformPeaks(source, 300, NaN, Infinity)).toEqual(full);
  expect(getAudioWaveformPeaks(source, 300, -1, 2)).toEqual(full);
});

test('close views connect actual sample positions with neighbors at both edges', () => {
  expect(getAudioWaveformPath(buffer([0, 0.5, 1, -1, 0, 0, 0, 0]), 2, 0.25, 0.5)).toBe(
    'M0.125 0.25L0.25 0L0.375 1L0.5 0.5',
  );
});

test('a sub-sample viewport contains a connected segment rather than a zero-length peak', () => {
  expect(getAudioWaveformPath(buffer([0, 1, 0, -1]), 300, 0.3, 0.31)).toBe('M0 0.5L0.25 0L0.5 0.5');
});

test('sample paths keep channels separate', () => {
  expect(getAudioWaveformPath(buffer([0, 1], [0, -1]))).toBe('M0 0.5L0.5 0L1 0M0 0.5L0.5 1L1 1');
});

test('constant, single-sample and final-sample views retain a visible line', () => {
  expect(getAudioWaveformPath(buffer([0]))).toBe('M0 0.5L1 0.5');
  expect(getAudioWaveformPath(buffer([0, 0]))).toBe('M0 0.5L0.5 0.5L1 0.5');
  expect(getAudioWaveformPath(buffer([0, 1]), 300, 0.9, 1)).toBe('M0 0.5L0.5 0L1 0');
  expect(getAudioWaveformPath(buffer([]))).toBe('');
});
