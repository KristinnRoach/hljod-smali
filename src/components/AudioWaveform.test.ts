import { expect, test } from 'vite-plus/test';

import { getAudioWaveformPeaks } from './AudioWaveform';

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
