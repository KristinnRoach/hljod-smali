// fake-indexeddb must install its globals before any Dexie instance opens.
import 'fake-indexeddb/auto';

import Dexie from 'dexie';
import { expect, test } from 'vite-plus/test';

import { InstrumentDatabase } from './instrumentDb';

// The v2 shapes, kept here rather than exported: one buffer per row, params
// nested under `patch`, and format fields the encoded WAV already carries.
interface V2SavedRow {
  id?: number;
  name: string;
  audioData?: ArrayBuffer;
  createdAt?: Date;
  patch?: { params?: Record<string, number> };
  sampleRate?: number;
  channels?: number;
}

const wav = (byte: number) => {
  const buffer = new ArrayBuffer(8);
  new Uint8Array(buffer).fill(byte);
  return buffer;
};

const bytes = (buffer: ArrayBuffer) => Array.from(new Uint8Array(buffer));

/**
 * Populate a v2 database and reopen it through the real version chain, so the
 * v3 upgrade runs the way it will on a user's machine. Each call gets its own
 * name; the `db` singleton is never touched.
 */
const migrateFromV2 = async (
  name: string,
  seed: { samples?: V2SavedRow[]; working?: ArrayBuffer },
) => {
  const v2 = new Dexie(name);
  v2.version(1).stores({ samples: '++id, name, createdAt' });
  v2.version(2).stores({ samples: '++id, name, createdAt', workingSamples: 'id' });
  await v2.open();
  if (seed.samples) await v2.table('samples').bulkAdd(seed.samples);
  if (seed.working)
    await v2.table('workingSamples').put({ id: 'current', audioData: seed.working });
  v2.close();

  const migrated = new InstrumentDatabase(name);
  await migrated.open();
  return migrated;
};

test('the v3 upgrade moves a saved row to layers and flattens its params', async () => {
  const db = await migrateFromV2('MigrationV3Saved', {
    samples: [
      {
        name: 'Old',
        audioData: wav(0xaa),
        createdAt: new Date('2026-01-01'),
        patch: { params: { volume: 0.5 } },
        sampleRate: 44_100,
        channels: 2,
      },
    ],
  });

  try {
    const row = (await db.instruments.toArray())[0];
    expect(row.name).toBe('Old');
    expect(row.layers).toHaveLength(1);
    expect(bytes(row.layers[0])).toEqual(bytes(wav(0xaa)));
    expect(row.params).toEqual({ volume: 0.5 });
    expect(row.createdAt).toEqual(new Date('2026-01-01'));

    // The fields the WAV header now carries, and the wrapper that held params.
    expect(Object.keys(row)).not.toContain('audioData');
    expect(Object.keys(row)).not.toContain('patch');
    expect(Object.keys(row)).not.toContain('sampleRate');
    expect(Object.keys(row)).not.toContain('channels');
  } finally {
    db.close();
  }
});

test('a v2 row that never had audioData migrates to a hole, not a valid instrument', async () => {
  // The claim `isUsableSampleSet`'s shape check exists for. Such a row stays
  // listed and deletable; `loadInstrument` is what refuses it.
  const db = await migrateFromV2('MigrationV3Hole', {
    samples: [{ name: 'No audio', createdAt: new Date('2026-01-02') }],
  });

  try {
    const row = (await db.instruments.toArray())[0];
    expect(row.layers).toEqual([undefined]);
    expect(row.params).toBeUndefined();
  } finally {
    db.close();
  }
});

test('the v3 upgrade moves the working samples row too', async () => {
  const db = await migrateFromV2('MigrationV3Working', { working: wav(0xbb) });

  try {
    const row = await db.workingSamples.get('current');
    expect(row?.layers).toHaveLength(1);
    expect(bytes(row!.layers[0])).toEqual(bytes(wav(0xbb)));
    expect(Object.keys(row!)).not.toContain('audioData');
  } finally {
    db.close();
  }
});

const migrateFrom = async (version: number, name: string, samples: object[]) => {
  const old = new Dexie(name);
  old.version(version).stores({ samples: '++id, name, createdAt', workingSamples: 'id' });
  await old.open();
  await old.table('samples').bulkAdd(samples);
  old.close();

  const migrated = new InstrumentDatabase(name);
  await migrated.open();
  return migrated;
};

// The pre-0.5.0 `EnvelopeState`, as `main` saved it.
const legacyEnvelope = (overrides: object = {}) => ({
  enabled: true,
  timeScale: 1.5,
  playbackRateSync: true,
  loop: false,
  shape: {
    kind: 'points',
    points: [
      { time: 0, value: 0, curve: 'linear' },
      { time: 0, value: 1 },
      { time: 0.5, value: 0.5, curve: 'exponential' },
      { time: 1, value: 0 },
    ],
    valueRange: [0, 1],
    sustainIndex: 2,
    releaseIndex: 2,
  },
  ...overrides,
});

test('the v4 upgrade keeps amp in the current format and drops pitch/filter', async () => {
  const db = await migrateFrom(3, 'MigrationV4Envelopes', [
    {
      name: 'Enveloped',
      layers: [wav(0xcc)],
      envelopes: {
        'amp-env': legacyEnvelope(),
        'pitch-env': legacyEnvelope(),
        'filter-env': legacyEnvelope(),
      },
    },
    {
      name: 'Looping',
      layers: [wav(0xcc)],
      envelopes: { 'amp-env': legacyEnvelope({ loop: true }) },
    },
    { name: 'Plain', layers: [wav(0xcc)] },
  ]);

  try {
    const [enveloped, looping, plain] = await db.instruments.toArray();
    expect(enveloped.envelopes).toEqual({
      amp: {
        enabled: true,
        timeScale: 1.5,
        shape: {
          // The duplicate time is nudged apart; 0.5.0 needs strictly increasing times.
          points: [
            { time: 0, value: 0, curve: 'linear' },
            { time: 0.001, value: 1, curve: undefined },
            { time: 0.5, value: 0.5, curve: 'exponential' },
            { time: 1, value: 0, curve: undefined },
          ],
          mode: { type: 'sustain' },
          sustainPoint: 2,
          releasePoint: 2,
        },
      },
    });
    expect(looping.envelopes?.amp?.shape.mode).toEqual({ type: 'loop' });
    expect(plain.envelopes).toBeUndefined();
  } finally {
    db.close();
  }
});

test('the v5 upgrade renames envelope ids and shape fields', async () => {
  const shape = {
    points: [
      { time: 0, value: 0 },
      { time: 1, value: 1 },
    ],
    mode: { type: 'once' },
  };
  const db = await migrateFrom(4, 'MigrationV5Envelopes', [
    {
      name: 'Enveloped',
      layers: [wav(0xcc)],
      envelopes: {
        'amp-env': { enabled: true, timeScale: 2, envelope: { ...shape, sustain: 1, release: 0 } },
      },
    },
  ]);

  try {
    const [enveloped] = await db.instruments.toArray();
    expect(enveloped.envelopes).toEqual({
      amp: { enabled: true, timeScale: 2, shape: { ...shape, sustainPoint: 1, releasePoint: 0 } },
    });
  } finally {
    db.close();
  }
});
