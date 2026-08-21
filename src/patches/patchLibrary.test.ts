// fake-indexeddb must install its globals before patchDb constructs Dexie.
import 'fake-indexeddb/auto';

import { beforeEach, expect, test, vi } from 'vite-plus/test';

import { db } from './patchDb';
import {
  LayerCapExceeded,
  MAX_LAYERS,
  deletePatch,
  listPatches,
  loadPatch,
  loadWorkingPatch,
  nextPatchName,
  savePatch,
  saveWorkingPatch,
  subscribe,
} from './patchLibrary';
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

const layerSet = (count: number) => Array.from({ length: count }, () => fakeAudioBuffer());

/** Names in list order, with the always-present built-in patch dropped. */
const savedNames = async () =>
  (await listPatches()).filter((p) => p.ref.kind === 'saved').map((p) => p.name);

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(async () => {
  // Only `loadPatch({ kind: 'builtin' })` should ever reach the network.
  fetchMock = vi.fn(() => Promise.reject(new Error('no network in tests')));
  vi.stubGlobal('fetch', fetchMock);
  vi.spyOn(console, 'error').mockImplementation(() => {});

  if (!db.isOpen()) await db.open();
  await db.samples.clear();
  await db.workingSamples.clear();
});

// ------------------------------------------------------------------ listing

test('the built-in patch is always listed first and needs no database row', async () => {
  const [first, ...rest] = await listPatches();

  expect(first.ref).toEqual({ kind: 'builtin' });
  expect(first.name).toBe('Default sample');
  expect(first.createdAt).toBeUndefined();
  expect(rest).toHaveLength(0);
});

test('listing carries no audio and hits no network', async () => {
  await savePatch({ name: 'One', layers: layerSet(2) });

  const [, saved] = await listPatches();
  expect(saved).toEqual({
    ref: { kind: 'saved', id: expect.any(Number) },
    name: 'One',
    createdAt: expect.any(Date),
  });
  expect(saved).not.toHaveProperty('layers');
  expect(fetchMock).not.toHaveBeenCalled();
});

test('saved patches are listed newest first', async () => {
  await savePatch({ name: 'One', layers: layerSet(1) });
  await savePatch({ name: 'Two', layers: layerSet(2) });

  expect(await savedNames()).toEqual(['Two', 'One']);
});

// ------------------------------------------------------------------ loading

test('loadPatch resolves a saved patch to its audio and params', async () => {
  const id = await savePatch({ name: 'One', layers: layerSet(2), params: { volume: 0.5 } });

  const loaded = await loadPatch({ kind: 'saved', id });
  expect(loaded.name).toBe('One');
  expect(loaded.layers).toHaveLength(2);
  expect(loaded.layers[0]).toBeInstanceOf(ArrayBuffer);
  expect(loaded.params).toEqual({ volume: 0.5 });
});

test('loadPatch fetches the built-in audio only when asked for it', async () => {
  const wav = audioBufferToWav(fakeAudioBuffer());
  fetchMock.mockResolvedValueOnce({ ok: true, arrayBuffer: () => Promise.resolve(wav) });

  const loaded = await loadPatch({ kind: 'builtin' });
  expect(loaded.layers).toHaveLength(1);
  expect(loaded.params).toBeUndefined();
  expect(fetchMock).toHaveBeenCalledTimes(1);
});

test('loadPatch rejects a ref whose patch is gone', async () => {
  await expect(loadPatch({ kind: 'saved', id: 999 })).rejects.toThrow('no longer exists');
});

test('a corrupted saved patch stays listed and deletable, but fails on load', async () => {
  const id = (await db.samples.add({
    name: 'Corrupt',
    layers: [new ArrayBuffer(8)],
    createdAt: new Date(),
  })) as number;

  expect(await savedNames()).toEqual(['Corrupt']);
  await expect(loadPatch({ kind: 'saved', id })).rejects.toThrow('unusable audio data');

  await deletePatch(id);
  expect(await savedNames()).toEqual([]);
});

// ------------------------------------------------------------------ writing

test('savePatch with an id overwrites in place instead of inserting', async () => {
  const id = await savePatch({ name: 'Original', layers: layerSet(1) });
  const sameId = await savePatch({ id, name: 'Renamed', layers: layerSet(1) });

  expect(sameId).toBe(id);
  expect(await savedNames()).toEqual(['Renamed']);
});

test('savePatch rejects an id that no longer exists', async () => {
  await expect(savePatch({ id: 999, name: 'Ghost', layers: layerSet(1) })).rejects.toThrow(
    'no longer exists',
  );
});

test('savePatch stores layers as decodable WAV, not raw AudioBuffers', async () => {
  const buffer = fakeAudioBuffer(16, 2);
  const id = await savePatch({ name: 'Encoded', layers: [buffer] });

  const { layers } = await loadPatch({ kind: 'saved', id });
  expect(layers[0].byteLength).toBe(audioBufferToWav(buffer).byteLength);
  expect(new Uint8Array(layers[0]).slice(0, 4)).toEqual(
    new Uint8Array([0x52, 0x49, 0x46, 0x46]), // 'RIFF'
  );
});

test('the layer cap is enforced on both write paths', async () => {
  const tooMany = layerSet(MAX_LAYERS + 1);

  await expect(savePatch({ name: 'Too many', layers: tooMany })).rejects.toBeInstanceOf(
    LayerCapExceeded,
  );
  await expect(saveWorkingPatch(tooMany)).rejects.toBeInstanceOf(LayerCapExceeded);

  // ...and nothing was written by the rejected calls.
  expect(await savedNames()).toEqual([]);
  expect(await loadWorkingPatch()).toBeUndefined();
});

test('nextPatchName skips names already taken', async () => {
  expect(await nextPatchName()).toBe('Patch 1');

  await savePatch({ name: 'Patch 1', layers: layerSet(1) });
  await savePatch({ name: 'Patch 3', layers: layerSet(1) });

  expect(await nextPatchName()).toBe('Patch 2');
});

test('subscribers fire on save and delete, and stop after unsubscribing', async () => {
  const listener = vi.fn();
  const unsubscribe = subscribe(listener);

  const id = await savePatch({ name: 'Watched', layers: layerSet(1) });
  expect(listener).toHaveBeenCalledTimes(1);

  await deletePatch(id);
  expect(listener).toHaveBeenCalledTimes(2);

  unsubscribe();
  await savePatch({ name: 'Unwatched', layers: layerSet(1) });
  expect(listener).toHaveBeenCalledTimes(2);
});

// ------------------------------------------------------------ working patch

test('the working patch round-trips', async () => {
  await saveWorkingPatch(layerSet(2));

  const restored = await loadWorkingPatch();
  expect(restored).toHaveLength(2);
  expect(restored![0]).toBeInstanceOf(ArrayBuffer);
});

test('a corrupted working patch is discarded, not returned', async () => {
  // What Brave has been seen to persist: a row whose buffer is no longer a WAV.
  await db.workingSamples.put({ id: 'current', layers: [new ArrayBuffer(8)] });

  expect(await loadWorkingPatch()).toBeUndefined();
  expect(await db.workingSamples.get('current')).toBeUndefined();
});

test('a working patch holding a v3-migration hole is discarded', async () => {
  // The v3 upgrade writes `layers: [undefined]` for any v2 row with no audioData.
  await db.workingSamples.put({ id: 'current', layers: [undefined as never] });

  expect(await loadWorkingPatch()).toBeUndefined();
});
