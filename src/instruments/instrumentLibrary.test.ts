// fake-indexeddb must install its globals before instrumentDb constructs Dexie.
import 'fake-indexeddb/auto';

import { beforeEach, expect, test, vi } from 'vite-plus/test';

import { db } from './instrumentDb';
import {
  deleteInstrument,
  listInstruments,
  loadInstrument,
  loadWorkingSamples,
  MAX_SAMPLES,
  nextInstrumentName,
  SampleCapExceeded,
  saveInstrument,
  saveWorkingSamples,
  subscribe,
} from './instrumentLibrary';
import { audioBufferToWav } from '../utils/audio/bufferUtils';

// Minimal stand-in for the parts of AudioBuffer that audioBufferToWav reads.
const fakeAudioBuffer = (length = 8, channels = 1, sampleRate = 44_100): AudioBuffer => {
  const data = new Float32Array(length).fill(0.5);
  return {
    length,
    numberOfChannels: channels,
    sampleRate,
    getChannelData: () => data,
  } as unknown as AudioBuffer;
};

const sampleSet = (count: number) => Array.from({ length: count }, () => fakeAudioBuffer());

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
  await db.workingSamples.clear();
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
  await saveInstrument({ name: 'One', samples: sampleSet(2) });

  const [, saved] = await listInstruments();
  expect(saved).toEqual({
    ref: { kind: 'saved', id: expect.any(Number) },
    name: 'One',
    createdAt: expect.any(Date),
  });
  expect(saved).not.toHaveProperty('samples');
  expect(fetchMock).not.toHaveBeenCalled();
});

test('saved instruments are listed newest first', async () => {
  await saveInstrument({ name: 'One', samples: sampleSet(1) });
  await saveInstrument({ name: 'Two', samples: sampleSet(2) });

  expect(await savedNames()).toEqual(['Two', 'One']);
});

// ------------------------------------------------------------------ loading

test('loadInstrument resolves a saved instrument to its audio and params', async () => {
  const id = await saveInstrument({ name: 'One', samples: sampleSet(2), params: { volume: 0.5 } });

  const loaded = await loadInstrument({ kind: 'saved', id });
  expect(loaded.name).toBe('One');
  expect(loaded.samples).toHaveLength(2);
  expect(loaded.samples[0]).toBeInstanceOf(ArrayBuffer);
  expect(loaded.params).toEqual({ volume: 0.5 });
});

test('loadInstrument fetches the built-in audio only when asked for it', async () => {
  const wav = audioBufferToWav(fakeAudioBuffer());
  fetchMock.mockResolvedValueOnce({ ok: true, arrayBuffer: () => Promise.resolve(wav) });

  const loaded = await loadInstrument({ kind: 'builtin' });
  expect(loaded.samples).toHaveLength(1);
  expect(loaded.params).toBeUndefined();
  expect(fetchMock).toHaveBeenCalledTimes(1);
});

test('loadInstrument rejects a ref whose instrument is gone', async () => {
  await expect(loadInstrument({ kind: 'saved', id: 999 })).rejects.toThrow('no longer exists');
});

test('a corrupted saved instrument stays listed and deletable, but fails on load', async () => {
  const id = (await db.instruments.add({
    name: 'Corrupt',
    layers: [new ArrayBuffer(8)],
    createdAt: new Date(),
  })) as number;

  expect(await savedNames()).toEqual(['Corrupt']);
  await expect(loadInstrument({ kind: 'saved', id })).rejects.toThrow('unusable audio data');

  await deleteInstrument(id);
  expect(await savedNames()).toEqual([]);
});

// ------------------------------------------------------------------ writing

test('saveInstrument with an id overwrites in place instead of inserting', async () => {
  const id = await saveInstrument({ name: 'Original', samples: sampleSet(1) });
  const sameId = await saveInstrument({ id, name: 'Renamed', samples: sampleSet(1) });

  expect(sameId).toBe(id);
  expect(await savedNames()).toEqual(['Renamed']);
});

test('saveInstrument rejects an id that no longer exists', async () => {
  await expect(saveInstrument({ id: 999, name: 'Ghost', samples: sampleSet(1) })).rejects.toThrow(
    'no longer exists',
  );
});

test('saveInstrument stores samples as decodable WAV, not raw AudioBuffers', async () => {
  const buffer = fakeAudioBuffer(16, 2);
  const id = await saveInstrument({ name: 'Encoded', samples: [buffer] });

  const { samples } = await loadInstrument({ kind: 'saved', id });
  expect(samples[0].byteLength).toBe(audioBufferToWav(buffer).byteLength);
  expect(new Uint8Array(samples[0]).slice(0, 4)).toEqual(
    new Uint8Array([0x52, 0x49, 0x46, 0x46]), // 'RIFF'
  );
});

test('the sample cap is enforced on both write paths', async () => {
  const tooMany = sampleSet(MAX_SAMPLES + 1);

  await expect(saveInstrument({ name: 'Too many', samples: tooMany })).rejects.toBeInstanceOf(
    SampleCapExceeded,
  );
  await expect(saveWorkingSamples(tooMany)).rejects.toBeInstanceOf(SampleCapExceeded);

  // ...and nothing was written by the rejected calls.
  expect(await savedNames()).toEqual([]);
  expect(await loadWorkingSamples()).toBeUndefined();
});

test('nextInstrumentName skips names already taken', async () => {
  expect(await nextInstrumentName()).toBe('Instrument 1');

  await saveInstrument({ name: 'Instrument 1', samples: sampleSet(1) });
  await saveInstrument({ name: 'Instrument 3', samples: sampleSet(1) });

  expect(await nextInstrumentName()).toBe('Instrument 2');
});

test('subscribers fire on save and delete, and stop after unsubscribing', async () => {
  const listener = vi.fn();
  const unsubscribe = subscribe(listener);

  const id = await saveInstrument({ name: 'Watched', samples: sampleSet(1) });
  expect(listener).toHaveBeenCalledTimes(1);

  await deleteInstrument(id);
  expect(listener).toHaveBeenCalledTimes(2);

  unsubscribe();
  await saveInstrument({ name: 'Unwatched', samples: sampleSet(1) });
  expect(listener).toHaveBeenCalledTimes(2);
});

// ---------------------------------------------------------- working samples

test('the working samples round-trip', async () => {
  await saveWorkingSamples(sampleSet(2));

  const restored = await loadWorkingSamples();
  expect(restored).toHaveLength(2);
  expect(restored![0]).toBeInstanceOf(ArrayBuffer);
});

test('corrupted working samples are discarded, not returned', async () => {
  // What Brave has been seen to persist: a row whose buffer is no longer a WAV.
  await db.workingSamples.put({ id: 'current', layers: [new ArrayBuffer(8)] });

  expect(await loadWorkingSamples()).toBeUndefined();
  expect(await db.workingSamples.get('current')).toBeUndefined();
});

test('a working sample set holding a v3-migration hole is discarded', async () => {
  // The v3 upgrade writes `layers: [undefined]` for any v2 row with no audioData.
  await db.workingSamples.put({ id: 'current', layers: [undefined as never] });

  expect(await loadWorkingSamples()).toBeUndefined();
});
