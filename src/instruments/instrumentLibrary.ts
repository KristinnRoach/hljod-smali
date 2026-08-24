// The one module that owns instruments: what they are, where they're stored,
// how they're encoded, and what makes one valid. Nothing outside this directory
// should touch Dexie, WAV encoding, or the sample cap.
import type { SamplePlayer, SamplerParams } from '@kidlib/web-audio';
import { audioBufferToWav, validateWavBuffer } from '../utils/audio/bufferUtils';
import { db } from './instrumentDb';

// A type-only import: `@kidlib/web-audio` extends `AudioWorkletNode` at module
// top level, so importing it for real would drag the audio engine in and make
// this module unloadable outside a browser. Annotating with the package's
// literal type keeps one source of truth -- if the package changes the cap,
// this line stops compiling. (The package still calls it MAX_LAYERS.)
const MAX_SAMPLES: typeof SamplePlayer.MAX_LAYERS = 4;

const WORKING_SAMPLES_ID = 'current';
const GENERATED_NAME_PREFIX = 'Instrument ';

export { MAX_SAMPLES };

/**
 * Which instrument, without saying anything about where its audio lives. The
 * built-in one is explicit rather than "the row with no id", so a storage
 * adapter can resolve the two differently.
 */
export type InstrumentRef = { kind: 'builtin' } | { kind: 'saved'; id: number };

/** Enough to render an instrument in a list. Deliberately carries no audio. */
export interface InstrumentSummary {
  ref: InstrumentRef;
  name: string;
  /** Absent for the built-in instrument. */
  createdAt?: Date;
}

/** An instrument with its audio resolved, ready to hand to the sampler. */
export interface Instrument {
  ref: InstrumentRef;
  name: string;
  samples: ArrayBuffer[];
  params?: SamplerParams;
}

const BUILTIN_NAME = 'Default';

/** Thrown by `saveInstrument`/`saveWorkingSamples` past the sample cap. */
export class SampleCapExceeded extends Error {
  constructor(readonly count: number) {
    super(`Max ${MAX_SAMPLES} samples (got ${count})`);
    this.name = 'SampleCapExceeded';
  }
}

const assertWithinCap = (samples: readonly unknown[]) => {
  if (samples.length > MAX_SAMPLES) throw new SampleCapExceeded(samples.length);
};

const assertNonEmpty = (samples: readonly unknown[]) => {
  if (samples.length === 0) throw new Error('At least one sample is required');
};

// One bad sample invalidates the set: samples[0] is the authority for duration
// and loop points, and a hole in the middle would silently shift the rest. The
// shape check is not paranoia -- the v3 migration writes `layers: [undefined]`
// for any v2 row that had no `audioData`, and validateWavBuffer reads
// `.byteLength` straight off its argument.
const isUsableSampleSet = (samples: unknown): samples is ArrayBuffer[] =>
  Array.isArray(samples) &&
  samples.length > 0 &&
  samples.length <= MAX_SAMPLES &&
  samples.every((sample) => sample instanceof ArrayBuffer && validateWavBuffer(sample));

// ---------------------------------------------------------------- listeners

const listeners = new Set<() => void>();

/** Called after any change to the saved instrument list. Returns an unsubscriber. */
export const subscribe = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const notify = () => listeners.forEach((listener) => listener());

// ------------------------------------------------------- built-in instrument

/** The audio for the built-in instrument, shipped in `public/audio/`. */
export const loadBuiltinSamples = async (): Promise<ArrayBuffer[]> => {
  const res = await fetch(`${import.meta.env.BASE_URL}audio/init_sample.webm`);
  if (!res.ok) {
    throw new Error(`Failed to fetch app default sample: ${res.status} ${res.statusText}`);
  }
  return [await res.arrayBuffer()];
};

// ------------------------------------------------------- saved instruments

/**
 * Newest first, with the built-in instrument pinned at the top.
 *
 * Summaries carry no audio, so a caller can render the library without pulling
 * every sample of every instrument into memory. Note that the Dexie read still
 * fetches whole rows -- IndexedDB has no column projection. Moving audio to its
 * own object store is what makes that read cheap, and this interface is what
 * lets that happen without touching a caller.
 */
export const listInstruments = async (): Promise<InstrumentSummary[]> => {
  const saved = await db.instruments.orderBy('createdAt').reverse().toArray();
  const savedSummaries = saved.flatMap<InstrumentSummary>((row) =>
    row.id === undefined
      ? []
      : [{ ref: { kind: 'saved', id: row.id }, name: row.name, createdAt: row.createdAt }],
  );

  return [{ ref: { kind: 'builtin' }, name: BUILTIN_NAME }, ...savedSummaries];
};

/**
 * Resolve an instrument's audio and settings.
 *
 * Saved samples are validated here rather than in `listInstruments`, so a
 * corrupted instrument stays listed and deletable but fails loudly when
 * selected. That differs from `loadWorkingSamples`, where the row regenerates
 * and discarding is safe.
 */
export const loadInstrument = async (ref: InstrumentRef): Promise<Instrument> => {
  if (ref.kind === 'builtin') {
    return { ref, name: BUILTIN_NAME, samples: await loadBuiltinSamples() };
  }

  const row = await db.instruments.get(ref.id);
  if (!row) throw new Error(`Saved instrument ${ref.id} no longer exists`);
  if (!isUsableSampleSet(row.layers)) {
    throw new Error(`Saved instrument “${row.name}” has unusable audio data`);
  }

  return { ref, name: row.name, samples: row.layers, params: row.params };
};

/** Next unused `Instrument N`. */
export const nextInstrumentName = async (): Promise<string> => {
  const taken = new Set(
    await db.instruments.where('name').startsWith(GENERATED_NAME_PREFIX).keys(),
  );
  let n = 1;
  while (taken.has(`${GENERATED_NAME_PREFIX}${n}`)) n += 1;
  return `${GENERATED_NAME_PREFIX}${n}`;
};

/**
 * Save takes decoded audio because that is what the sampler holds; everything
 * else in this module deals in encoded bytes. This is the one place that
 * encodes. See CONTEXT.md -- who owns encode/decode is an open question for
 * `@kidlib/web-audio`.
 */
export interface SaveInstrumentInput {
  /** Omit to insert; pass an existing id to replace that complete instrument in place. */
  id?: number;
  name: string;
  samples: readonly AudioBuffer[];
  /** Required so an overwrite always has one meaning: replace, never preserve or clear by omission. */
  params: SamplerParams;
}

/** Returns the id written. Throws `SampleCapExceeded` past the cap. */
export const saveInstrument = async ({
  id,
  name,
  samples,
  params,
}: SaveInstrumentInput): Promise<number> => {
  assertNonEmpty(samples);
  assertWithinCap(samples);

  const record = { name, layers: samples.map(audioBufferToWav), params };

  let savedId: number;
  if (id === undefined) {
    savedId = (await db.instruments.add({ ...record, createdAt: new Date() })) as number;
  } else {
    const updated = await db.instruments.update(id, record);
    if (!updated) throw new Error(`Saved instrument ${id} no longer exists`);
    savedId = id;
  }

  notify();
  return savedId;
};

export const deleteInstrument = async (id: number): Promise<void> => {
  await db.instruments.delete(id);
  notify();
};

// ---------------------------------------------------------- working samples

/**
 * The unsaved samples to restore on reload. Not an instrument: no name, no id,
 * no params. Returns `undefined` when there are none, or when the stored set is
 * unusable -- in which case it's discarded, since it regenerates from whatever
 * the user loads next.
 */
export const loadWorkingSamples = async (): Promise<ArrayBuffer[] | undefined> => {
  const stored = await db.workingSamples.get(WORKING_SAMPLES_ID);
  if (!stored) return;
  if (isUsableSampleSet(stored.layers)) return stored.layers;

  try {
    await db.workingSamples.delete(WORKING_SAMPLES_ID);
  } catch (error) {
    console.error('Failed to remove invalid working samples:', error);
  }
};

/** Throws `SampleCapExceeded` past the cap. */
export const saveWorkingSamples = async (samples: readonly AudioBuffer[]): Promise<void> => {
  if (samples.length === 0) {
    await db.workingSamples.delete(WORKING_SAMPLES_ID);
    return;
  }
  assertWithinCap(samples);
  await db.workingSamples.put({
    id: WORKING_SAMPLES_ID,
    layers: samples.map(audioBufferToWav),
  });
};
