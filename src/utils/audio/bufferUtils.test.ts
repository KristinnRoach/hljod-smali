import { expect, test } from 'vite-plus/test';
import {
  arrayBufferToBase64,
  audioBufferToWav,
  base64ToArrayBuffer,
  validateWavBuffer,
} from './bufferUtils';

test('rejects a WAV whose declared audio payload is truncated', () => {
  const buffer = new ArrayBuffer(44);
  const header = new Uint8Array(buffer);
  const view = new DataView(buffer);

  header.set([0x52, 0x49, 0x46, 0x46], 0); // RIFF
  view.setUint32(4, 38, true);
  header.set([0x57, 0x41, 0x56, 0x45], 8); // WAVE
  header.set([0x66, 0x6d, 0x74, 0x20], 12); // fmt
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, 44_100, true);
  view.setUint32(28, 88_200, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  header.set([0x64, 0x61, 0x74, 0x61], 36); // data
  view.setUint32(40, 2, true);

  expect(validateWavBuffer(buffer)).toBe(false);
});

test('base64 round-trip preserves bytes', () => {
  const original = Uint8Array.from([0, 1, 127, 128, 255]);
  const bytes = new Uint8Array(base64ToArrayBuffer(arrayBufferToBase64(original.buffer)));

  expect(Array.from(bytes)).toEqual(Array.from(original));
});

test('writes a WAV its own validator accepts', () => {
  const samples = Float32Array.from([0, 0.5]);
  const audioBuffer = {
    length: samples.length,
    numberOfChannels: 1,
    sampleRate: 44_100,
    getChannelData: () => samples,
  } as unknown as AudioBuffer;

  const wav = audioBufferToWav(audioBuffer);

  expect(wav.byteLength).toBe(44 + samples.length * 2);
  expect(validateWavBuffer(wav)).toBe(true);
});
