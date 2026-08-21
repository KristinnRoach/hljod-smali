// fake-indexeddb must install its globals before patchDb constructs Dexie.
import 'fake-indexeddb/auto';

import { beforeEach, expect, test, vi } from 'vite-plus/test';

import { db } from './patchDb';
import {
  LayerCapExceeded,
  MAX_LAYERS,
  deletePatch,
  listPatches,
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

beforeEach(async () => {
  // `listPatches` and the boot path fetch the built-in default patch; there is
  // no server here, so make it fail the way a missing asset would.
  vi.stubGlobal(
    'fetch',
    vi.fn(() => Promise.reject(new Error('no network in tests'))),
  );
  vi.spyOn(console, 'error').mockImplementation(() => {});

  if (!db.isOpen()) await db.open();
  await db.samples.clear();
  await db.workingSamples.clear();
});

test('savePatch inserts, listPatches returns it newest-first', async () => {
  const first = await savePatch({ name: 'One', layers: layerSet(1) });
  const second = await savePatch({ name: 'Two', layers: layerSet(2) });

  expect(first).not.toBe(second);

  const patches = await listPatches();
  expect(patches.map((p) => p.name)).toEqual(['Two', 'One']);
  expect(patches[0].layers).toHaveLength(2);
});

test('savePatch with an id overwrites in place instead of inserting', async () => {
  const id = await savePatch({ name: 'Original', layers: layerSet(1) });
  const sameId = await savePatch({ id, name: 'Renamed', layers: layerSet(1) });

  expect(sameId).toBe(id);
  const patches = await listPatches();
  expect(patches).toHaveLength(1);
  expect(patches[0].name).toBe('Renamed');
});

test('savePatch rejects an id that no longer exists', async () => {
  await expect(savePatch({ id: 999, name: 'Ghost', layers: layerSet(1) })).rejects.toThrow(
    'no longer exists',
  );
});

test('the layer cap is enforced on both write paths', async () => {
  const tooMany = layerSet(MAX_LAYERS + 1);

  await expect(savePatch({ name: 'Too many', layers: tooMany })).rejects.toBeInstanceOf(
    LayerCapExceeded,
  );
  await expect(saveWorkingPatch(tooMany)).rejects.toBeInstanceOf(LayerCapExceeded);

  // ...and nothing was written by the rejected calls.
  expect(await listPatches()).toHaveLength(0);
  expect(await loadWorkingPatch()).toBeUndefined();
});

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

test('a corrupted saved patch stays listed so it can still be deleted', async () => {
  await db.samples.add({ name: 'Corrupt', layers: [new ArrayBuffer(8)], createdAt: new Date() });

  const patches = await listPatches();
  expect(patches.map((p) => p.name)).toEqual(['Corrupt']);

  await deletePatch(patches[0].id!);
  expect(await listPatches()).toHaveLength(0);
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

test('listPatches still returns saved patches when the default patch fails to load', async () => {
  await savePatch({ name: 'Mine', layers: layerSet(1) });

  const patches = await listPatches();
  expect(patches.map((p) => p.name)).toEqual(['Mine']);
});

test('savePatch stores layers as decodable WAV, not raw AudioBuffers', async () => {
  const buffer = fakeAudioBuffer(16, 2);
  await savePatch({ name: 'Encoded', layers: [buffer] });

  const [saved] = await listPatches();
  expect(saved.layers[0].byteLength).toBe(audioBufferToWav(buffer).byteLength);
  expect(new Uint8Array(saved.layers[0]).slice(0, 4)).toEqual(
    new Uint8Array([0x52, 0x49, 0x46, 0x46]), // 'RIFF'
  );
});
