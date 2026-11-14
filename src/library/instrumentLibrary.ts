// The one module that owns instruments: what they are, where they're stored,
// how they're encoded, and what makes one valid. Nothing outside this directory
// should touch Dexie or WAV encoding.
import type { SamplerParams } from '@kidlib/web-audio';
import { audioBufferToWav, validateWavBuffer } from './bufferUtils';
import { db, type InstrumentEnvelopes, type InstrumentRef } from './instrumentDb';

const WORKING_SAMPLE_ID = 'current';
const GENERATED_NAME_PREFIX = 'Instrument ';

/**
 * Which instrument, without saying anything about where its audio lives. The
 * built-in one is explicit rather than "the row with no id", so a storage
 * adapter can resolve the two differently.
 */
export type { InstrumentRef };

/**
 * Which instrument, and what to call it. The rung most callers want: enough to
 * label a button or decide what an overwrite would replace, without claiming to
 * know when it was created.
 */
export interface InstrumentIdentity {
  ref: InstrumentRef;
  name: string;
}

/**
 * Enough to render an instrument in a list. Deliberately carries no audio.
 * Only `listInstruments` produces these, which is what makes `createdAt`
 * trustworthy -- absent means the built-in instrument, not "not filled in".
 */
export interface InstrumentSummary extends InstrumentIdentity {
  /** Absent for the built-in instrument, present for every saved one. */
  createdAt?: Date;
}

/** The unsaved sample to restore on reload, with whatever it came from. */
export interface WorkingSample {
  sample: ArrayBuffer;
  /** Null when the sample has no instrument behind it. */
  ref: InstrumentRef | null;
}

/** An instrument with its audio resolved, ready to hand to the sampler. */
export interface Instrument extends InstrumentIdentity {
  sample: ArrayBuffer;
  params?: SamplerParams;
  envelopes?: InstrumentEnvelopes;
}

const BUILTIN_NAME = 'Default';

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
export const loadBuiltinSample = async (): Promise<ArrayBuffer> => {
  const res = await fetch(`${import.meta.env.BASE_URL}audio/init_sample.webm`);
  if (!res.ok) {
    throw new Error(`Failed to fetch app default sample: ${res.status} ${res.statusText}`);
  }
  return res.arrayBuffer();
};

// ------------------------------------------------------- saved instruments

/**
 * Newest first, with the built-in instrument pinned at the top.
 *
 * Summaries carry no audio, so a caller can render the library without pulling
 * the audio of every instrument into memory. Note that the Dexie read still
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
 * selected. That differs from `loadWorkingSample`, where the row regenerates
 * and discarding is safe.
 */
export const loadInstrument = async (ref: InstrumentRef): Promise<Instrument> => {
  if (ref.kind === 'builtin') {
    return { ref, name: BUILTIN_NAME, sample: await loadBuiltinSample() };
  }

  const row = await db.instruments.get(ref.id);
  if (!row) throw new Error(`Saved instrument ${ref.id} no longer exists`);
  if (!validateWavBuffer(row.sample)) {
    throw new Error(`Saved instrument “${row.name}” has unusable audio data`);
  }

  return {
    ref,
    name: row.name,
    sample: row.sample,
    params: row.params,
    envelopes: row.envelopes,
  };
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
 * encodes. Moving the encoder into the package: KristinnRoach/web-audio#97.
 */
export interface SaveInstrumentInput {
  /** Omit to insert; pass an existing id to update that instrument in place. */
  id?: number;
  name: string;
  sample: AudioBuffer;
  /** Required so an overwrite always has one meaning: replace, never preserve or clear by omission. */
  params: SamplerParams;
  /** Omit to preserve existing envelopes when overwriting an older caller's instrument. */
  envelopes?: InstrumentEnvelopes;
}

/** Returns the id written. */
export const saveInstrument = async ({
  id,
  name,
  sample,
  params,
  envelopes,
}: SaveInstrumentInput): Promise<number> => {
  const record = {
    name,
    sample: audioBufferToWav(sample),
    params,
    ...(envelopes === undefined ? {} : { envelopes }),
  };

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

// ---------------------------------------------------------- working sample

/**
 * The unsaved sample to restore on reload. Not an instrument: no name, no id,
 * no params. Returns `undefined` when there is none, or when the stored one is
 * unusable -- in which case it's discarded, since it regenerates from whatever
 * the user loads next.
 */
export const loadWorkingSample = async (): Promise<WorkingSample | undefined> => {
  const stored = await db.workingSample.get(WORKING_SAMPLE_ID);
  if (!stored) return;
  if (validateWavBuffer(stored.sample)) {
    // Our encoder writes 16-bit PCM at byte 44; older Brave saves can be all zero.
    const pcm = new Uint8Array(stored.sample, 44, new DataView(stored.sample).getUint32(40, true));
    if (pcm.some((byte) => byte !== 0)) return { sample: stored.sample, ref: stored.ref };
  }

  try {
    await db.workingSample.delete(WORKING_SAMPLE_ID);
  } catch (error) {
    console.error('Failed to remove invalid working sample:', error);
  }
};

export const saveWorkingSample = async (
  sample: AudioBuffer,
  ref: InstrumentRef | null = null,
): Promise<void> => {
  await db.workingSample.put({
    id: WORKING_SAMPLE_ID,
    sample: audioBufferToWav(sample),
    ref,
  });
};
