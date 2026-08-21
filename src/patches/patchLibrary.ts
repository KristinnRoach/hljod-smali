// The one module that owns patches: what they are, where they're stored, how
// they're encoded, and what makes one valid. Nothing outside this directory
// should touch Dexie, WAV encoding, or the layer cap.
import type { SamplePlayer, SamplerParamPatch } from '@kidlib/web-audio';
import { audioBufferToWav, validateWavBuffer } from '../utils/audio/bufferUtils';
import { db, type SavedPatchRow } from './patchDb';

// A type-only import: `@kidlib/web-audio` extends `AudioWorkletNode` at module
// top level, so importing it for real would drag the audio engine in and make
// this module unloadable outside a browser. Annotating with the package's
// literal type keeps one source of truth -- if the package changes the cap,
// this line stops compiling.
const MAX_LAYERS: typeof SamplePlayer.MAX_LAYERS = 4;

const WORKING_PATCH_ID = 'current';
const GENERATED_NAME_PREFIX = 'Patch ';

export type Patch = SavedPatchRow;

export { MAX_LAYERS };

/** Thrown by `savePatch`/`saveWorkingPatch` when a layer set exceeds the cap. */
export class LayerCapExceeded extends Error {
  constructor(readonly count: number) {
    super(`Max ${MAX_LAYERS} layers (got ${count})`);
    this.name = 'LayerCapExceeded';
  }
}

const assertWithinCap = (layers: readonly unknown[]) => {
  if (layers.length > MAX_LAYERS) throw new LayerCapExceeded(layers.length);
};

// One bad layer invalidates the set: layer 0 is the authority for duration and
// loop points, and a hole in the middle would silently shift the rest. The
// shape check is not paranoia -- the v3 migration writes `layers: [undefined]`
// for any v2 row that had no `audioData`, and validateWavBuffer reads
// `.byteLength` straight off its argument.
const isUsableLayerSet = (layers: unknown): layers is ArrayBuffer[] =>
  Array.isArray(layers) &&
  layers.length > 0 &&
  layers.length <= MAX_LAYERS &&
  layers.every((layer) => layer instanceof ArrayBuffer && validateWavBuffer(layer));

// ---------------------------------------------------------------- listeners

const listeners = new Set<() => void>();

/** Called after any change to the saved patch list. Returns an unsubscriber. */
export const subscribe = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const notify = () => listeners.forEach((listener) => listener());

// ------------------------------------------------------------ default patch

/** The app's built-in patch, shipped in `public/audio/`. */
export const loadDefaultLayers = async (): Promise<ArrayBuffer[]> => {
  const res = await fetch(`${import.meta.env.BASE_URL}audio/init_sample.webm`);
  if (!res.ok) {
    throw new Error(`Failed to fetch app default sample: ${res.status} ${res.statusText}`);
  }
  return [await res.arrayBuffer()];
};

// ------------------------------------------------------------ saved patches

/**
 * Newest first, with the built-in default patch pinned at the top. If the
 * default can't be fetched the saved patches are still returned.
 *
 * Saved layers are deliberately NOT validated here. A corrupted saved patch is
 * user data, and dropping it from the list would leave no way to delete it --
 * so it stays listed and fails loudly at load time instead. That differs from
 * `loadWorkingPatch`, where the row is regenerable and discarding is safe.
 */
export const listPatches = async (): Promise<Patch[]> => {
  const [defaultResult, savedResult] = await Promise.allSettled([
    loadDefaultLayers(),
    db.samples.orderBy('createdAt').reverse().toArray(),
  ]);

  if (savedResult.status === 'rejected') throw savedResult.reason;
  if (defaultResult.status === 'rejected') {
    console.error('Failed to load default patch:', defaultResult.reason);
    return savedResult.value;
  }

  return [{ name: 'Default sample', layers: defaultResult.value }, ...savedResult.value];
};

/** Next unused `Patch N`. */
export const nextPatchName = async (): Promise<string> => {
  const taken = new Set(await db.samples.where('name').startsWith(GENERATED_NAME_PREFIX).keys());
  let n = 1;
  while (taken.has(`${GENERATED_NAME_PREFIX}${n}`)) n += 1;
  return `${GENERATED_NAME_PREFIX}${n}`;
};

export interface SavePatchInput {
  /** Omit to insert; pass an existing id to overwrite that patch in place. */
  id?: number;
  name: string;
  layers: readonly AudioBuffer[];
  params?: SamplerParamPatch;
}

/** Returns the id written. Throws `LayerCapExceeded` past the cap. */
export const savePatch = async ({ id, name, layers, params }: SavePatchInput): Promise<number> => {
  assertWithinCap(layers);

  const record = { name, layers: layers.map(audioBufferToWav), params };

  let savedId: number;
  if (id === undefined) {
    savedId = (await db.samples.add({ ...record, createdAt: new Date() })) as number;
  } else {
    const updated = await db.samples.update(id, record);
    if (!updated) throw new Error(`Saved patch ${id} no longer exists`);
    savedId = id;
  }

  notify();
  return savedId;
};

export const deletePatch = async (id: number): Promise<void> => {
  await db.samples.delete(id);
  notify();
};

// ----------------------------------------------------------- working patch

/**
 * The unsaved patch to restore on reload. Returns `undefined` when there is
 * none, or when the stored one is unusable -- in which case it's discarded,
 * since it regenerates from whatever the user loads next.
 */
export const loadWorkingPatch = async (): Promise<ArrayBuffer[] | undefined> => {
  const stored = await db.workingSamples.get(WORKING_PATCH_ID);
  if (!stored) return;
  if (isUsableLayerSet(stored.layers)) return stored.layers;

  try {
    await db.workingSamples.delete(WORKING_PATCH_ID);
  } catch (error) {
    console.error('Failed to remove invalid working patch:', error);
  }
};

/** Throws `LayerCapExceeded` past the cap. */
export const saveWorkingPatch = async (layers: readonly AudioBuffer[]): Promise<void> => {
  assertWithinCap(layers);
  await db.workingSamples.put({
    id: WORKING_PATCH_ID,
    layers: layers.map(audioBufferToWav),
  });
};
