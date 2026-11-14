// fake-indexeddb must install its globals before instrumentDb constructs Dexie.
import 'fake-indexeddb/auto';

import { beforeEach, expect, test, vi } from 'vite-plus/test';

import { db } from './instrumentDb';
import {
  deleteInstrument,
  listInstruments,
  loadInstrument,
  loadWorkingSample,
  nextInstrumentName,
  saveInstrument,
  saveWorkingSample,
  subscribe,
} from './instrumentLibrary';
import { audioBufferToWav } from './bufferUtils';
import type { EnvelopeConfig } from '@kidlib/web-audio';

// Minimal stand-in for the parts of AudioBuffer that audioBufferToWav reads.
const fakeAudioBuffer = (length = 8, channels = 1, sampleRate = 44_100): AudioBuffer => {
  const data = new Float32Array(length).fill(0.5);
  return {
    length,
    numberOfChannels: channels,
    sampleRate,
    copyFromChannel: (destination: Float32Array) => destination.set(data),
  } as unknown as AudioBuffer;
};

const envelopeConfig = {
  enabled: true,
  timeScale: 1,
  shape: {
    points: [
      { time: 0, value: 0 },
      { time: 1, value: 1 },
    ],
    mode: { type: 'once' },
    sustainPoint: 1,
    releasePoint: 1,
  },
} satisfies EnvelopeConfig;

/** Names in list order, with the always-present built-in instrument dropped. */
const savedNames = async () =>
  (await listInstruments())
    .filter((summary) => summary.ref.kind === 'saved')
    .map((summary) => summary.name);

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(async () => {
  // Only `loadInstrument({ kind: 'builtin' })` should ever reach the network.
  fetchMock = vi.fn(() => Promise.reject(new Error('no network in tests')));
  vi.stubGlobal('fetch', fetchMock);
  vi.spyOn(console, 'error').mockImplementation(() => {});

  if (!db.isOpen()) await db.open();
  await db.instruments.clear();
  await db.workingSample.clear();
});

// ------------------------------------------------------------------ listing

test('the built-in instrument is always listed first and needs no database row', async () => {
  const [first, ...rest] = await listInstruments();

  expect(first.ref).toEqual({ kind: 'builtin' });
  expect(first.name).toBe('Default');
  expect(first.createdAt).toBeUndefined();
  expect(rest).toHaveLength(0);
});

test('listing carries no audio and hits no network', async () => {
  await saveInstrument({ name: 'One', sample: fakeAudioBuffer(), params: {} });

  const [, saved] = await listInstruments();
  expect(saved).toEqual({
    ref: { kind: 'saved', id: expect.any(Number) },
    name: 'One',
    createdAt: expect.any(Date),
  });
  expect(saved).not.toHaveProperty('sample');
  expect(fetchMock).not.toHaveBeenCalled();
});

test('saved instruments are listed newest first', async () => {
  await saveInstrument({ name: 'One', sample: fakeAudioBuffer(), params: {} });
  await saveInstrument({ name: 'Two', sample: fakeAudioBuffer(), params: {} });

  expect(await savedNames()).toEqual(['Two', 'One']);
});

// ------------------------------------------------------------------ loading

test('loadInstrument resolves a saved instrument to its audio and params', async () => {
  const id = await saveInstrument({
    name: 'One',
    sample: fakeAudioBuffer(),
    params: { volume: 0.5 },
  });

  const loaded = await loadInstrument({ kind: 'saved', id });
  expect(loaded.name).toBe('One');
  expect(loaded.sample).toBeInstanceOf(ArrayBuffer);
  expect(loaded.params).toEqual({ volume: 0.5 });
});

test('loadInstrument fetches the built-in audio only when asked for it', async () => {
  const wav = audioBufferToWav(fakeAudioBuffer());
  fetchMock.mockResolvedValueOnce({ ok: true, arrayBuffer: () => Promise.resolve(wav) });

  const loaded = await loadInstrument({ kind: 'builtin' });
  expect(loaded.sample).toBeInstanceOf(ArrayBuffer);
  expect(loaded.params).toBeUndefined();
  expect(fetchMock).toHaveBeenCalledTimes(1);
});

test('loadInstrument rejects a ref whose instrument is gone', async () => {
  await expect(loadInstrument({ kind: 'saved', id: 999 })).rejects.toThrow('no longer exists');
});

test('a corrupted saved instrument stays listed and deletable, but fails on load', async () => {
  const id = (await db.instruments.add({
    name: 'Corrupt',
    sample: new ArrayBuffer(8),
    createdAt: new Date(),
  })) as number;

  expect(await savedNames()).toEqual(['Corrupt']);
  await expect(loadInstrument({ kind: 'saved', id })).rejects.toThrow('unusable audio data');

  await deleteInstrument(id);
  expect(await savedNames()).toEqual([]);
});

// ------------------------------------------------------------------ writing

test('saveInstrument with an id updates supplied fields and preserves omitted envelopes', async () => {
  const envelopes = {
    amp: envelopeConfig,
    filter: envelopeConfig,
    pitch: envelopeConfig,
  };
  const id = await saveInstrument({
    name: 'Original',
    sample: fakeAudioBuffer(),
    params: { volume: 0.25 },
    envelopes,
  });
  const sameId = await saveInstrument({
    id,
    name: 'Renamed',
    sample: fakeAudioBuffer(),
    params: { volume: 0.75 },
  });

  expect(sameId).toBe(id);
  expect(await savedNames()).toEqual(['Renamed']);
  const loaded = await loadInstrument({ kind: 'saved', id });
  expect(loaded.params).toEqual({ volume: 0.75 });
  expect(loaded.envelopes).toEqual(envelopes);
});

test('saveInstrument rejects an id that no longer exists', async () => {
  await expect(
    saveInstrument({ id: 999, name: 'Ghost', sample: fakeAudioBuffer(), params: {} }),
  ).rejects.toThrow('no longer exists');
});

test('saveInstrument stores samples as decodable WAV, not raw AudioBuffers', async () => {
  const buffer = fakeAudioBuffer(16, 2);
  const id = await saveInstrument({ name: 'Encoded', sample: buffer, params: {} });

  const { sample } = await loadInstrument({ kind: 'saved', id });
  expect(sample.byteLength).toBe(audioBufferToWav(buffer).byteLength);
  expect(new Uint8Array(sample).slice(0, 4)).toEqual(
    new Uint8Array([0x52, 0x49, 0x46, 0x46]), // 'RIFF'
  );
});

test('nextInstrumentName skips names already taken', async () => {
  expect(await nextInstrumentName()).toBe('Instrument 1');

  await saveInstrument({ name: 'Instrument 1', sample: fakeAudioBuffer(), params: {} });
  await saveInstrument({ name: 'Instrument 3', sample: fakeAudioBuffer(), params: {} });

  expect(await nextInstrumentName()).toBe('Instrument 2');
});

test('subscribers fire on save and delete, and stop after unsubscribing', async () => {
  const listener = vi.fn();
  const unsubscribe = subscribe(listener);

  const id = await saveInstrument({ name: 'Watched', sample: fakeAudioBuffer(), params: {} });
  expect(listener).toHaveBeenCalledTimes(1);

  await deleteInstrument(id);
  expect(listener).toHaveBeenCalledTimes(2);

  unsubscribe();
  await saveInstrument({ name: 'Unwatched', sample: fakeAudioBuffer(), params: {} });
  expect(listener).toHaveBeenCalledTimes(2);
});

// ---------------------------------------------------------- working sample

test('the working sample round-trips', async () => {
  await saveWorkingSample(fakeAudioBuffer(), { kind: 'builtin' });

  const restored = await loadWorkingSample();
  expect(restored?.sample).toBeInstanceOf(ArrayBuffer);
  expect(restored?.ref).toEqual({ kind: 'builtin' });
});

test('a corrupted working sample is discarded, not returned', async () => {
  // A truncated row must not be handed to the audio decoder.
  await db.workingSample.put({ id: 'current', sample: new ArrayBuffer(8), ref: null });

  expect(await loadWorkingSample()).toBeUndefined();
  expect(await db.workingSample.get('current')).toBeUndefined();
});

test('an all-zero working sample is discarded without deleting saved instruments', async () => {
  const sample = audioBufferToWav(fakeAudioBuffer());
  new Uint8Array(sample, 44).fill(0);
  const id = (await db.instruments.add({ name: 'Keep', sample })) as number;
  await db.workingSample.put({ id: 'current', sample, ref: { kind: 'saved', id } });

  expect(await loadWorkingSample()).toBeUndefined();
  expect(await db.workingSample.get('current')).toBeUndefined();
  expect((await loadInstrument({ kind: 'saved', id })).sample).toEqual(sample);
});
