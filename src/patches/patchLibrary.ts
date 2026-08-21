// The one module that owns patches: what they are, where they're stored, how
// they're encoded, and what makes one valid. Nothing outside this directory
// should touch Dexie, WAV encoding, or the layer cap.
import type { SamplePlayer, SamplerParamPatch } from '@kidlib/web-audio';
import { audioBufferToWav, validateWavBuffer } from '../utils/audio/bufferUtils';
import { db } from './patchDb';

// A type-only import: `@kidlib/web-audio` extends `AudioWorkletNode` at module
// top level, so importing it for real would drag the audio engine in and make
// this module unloadable outside a browser. Annotating with the package's
// literal type keeps one source of truth -- if the package changes the cap,
// this line stops compiling.
const MAX_LAYERS: typeof SamplePlayer.MAX_LAYERS = 4;

const WORKING_PATCH_ID = 'current';
const GENERATED_NAME_PREFIX = 'Patch ';

export { MAX_LAYERS };

/**
 * Which patch, without saying anything about where its audio lives. The
 * built-in one is explicit rather than "the row with no id", so a storage
 * adapter can resolve the two differently.
 */
export type PatchRef = { kind: 'builtin' } | { kind: 'saved'; id: number };

/** Enough to render a patch in a list. Deliberately carries no audio. */
export interface PatchSummary {
  ref: PatchRef;
  name: string;
  /** Absent for the built-in patch. */
  createdAt?: Date;
}

/** A patch with its audio resolved, ready to hand to the sampler. */
export interface LoadedPatch {
  ref: PatchRef;
  name: string;
  layers: ArrayBuffer[];
  params?: SamplerParamPatch;
}

const BUILTIN_NAME = 'Default sample';

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

/** The audio for the built-in patch, shipped in `public/audio/`. */
export const loadDefaultLayers = async (): Promise<ArrayBuffer[]> => {
  const res = await fetch(`${import.meta.env.BASE_URL}audio/init_sample.webm`);
  if (!res.ok) {
    throw new Error(`Failed to fetch app default sample: ${res.status} ${res.statusText}`);
  }
  return [await res.arrayBuffer()];
};

// ------------------------------------------------------------ saved patches

/**
 * Newest first, with the built-in patch pinned at the top.
 *
 * Summaries carry no audio, so a caller can render the library without pulling
 * every layer of every patch into memory. Note that the Dexie read still
 * fetches whole rows -- IndexedDB has no column projection. Moving audio to its
 * own object store is what makes that read cheap, and this interface is what
 * lets that happen without touching a caller.
 */
export const listPatches = async (): Promise<PatchSummary[]> => {
  const saved = await db.samples.orderBy('createdAt').reverse().toArray();
  const savedSummaries = saved.flatMap<PatchSummary>((row) =>
    row.id === undefined
      ? []
      : [{ ref: { kind: 'saved', id: row.id }, name: row.name, createdAt: row.createdAt }],
  );

  return [{ ref: { kind: 'builtin' }, name: BUILTIN_NAME }, ...savedSummaries];
};

/**
 * Resolve a patch's audio and settings.
 *
 * Saved layers are validated here rather than in `listPatches`, so a corrupted
 * patch stays listed and deletable but fails loudly when selected. That differs
 * from `loadWorkingPatch`, where the row regenerates and discarding is safe.
 */
export const loadPatch = async (ref: PatchRef): Promise<LoadedPatch> => {
  if (ref.kind === 'builtin') {
    return { ref, name: BUILTIN_NAME, layers: await loadDefaultLayers() };
  }

  const row = await db.samples.get(ref.id);
  if (!row) throw new Error(`Saved patch ${ref.id} no longer exists`);
  if (!isUsableLayerSet(row.layers)) {
    throw new Error(`Saved patch “${row.name}” has unusable audio data`);
  }

  return { ref, name: row.name, layers: row.layers, params: row.params };
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
