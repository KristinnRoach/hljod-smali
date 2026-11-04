// Dexie schema for the instrument library. Internal to `instrumentLibrary.ts`
// -- nothing else should import this.
import Dexie, { Table } from 'dexie';
import type { SampleEnvelopeId, EnvelopeConfig, SamplerParams } from '@kidlib/web-audio';

export type InstrumentEnvelopes = Partial<Record<SampleEnvelopeId, EnvelopeConfig>>;

/** Which instrument. `builtin` has no row of its own. */
export type InstrumentRef = { kind: 'builtin' } | { kind: 'saved'; id: number };

/** A saved instrument as stored: the sample it plays plus the params it plays it with. */
export interface SavedInstrumentRow {
  id?: number;
  name: string;
  sample: ArrayBuffer;
  createdAt?: Date;
  params?: SamplerParams;
  envelopes?: InstrumentEnvelopes;
}

export interface WorkingSampleRow {
  id: 'current';
  sample: ArrayBuffer;
  /** The instrument the sample came from. Null for dropped files. */
  ref: InstrumentRef | null;
}

class InstrumentDatabase extends Dexie {
  instruments!: Table<SavedInstrumentRow>;
  workingSample!: Table<WorkingSampleRow, WorkingSampleRow['id']>;

  constructor() {
    super('SampleDatabase');
    // Higher than any version that shipped, so older databases upgrade to this:
    // Dexie deletes every store not listed, which wipes them. No migrations.
    this.version(7).stores({
      instruments: '++id, name, createdAt',
      workingSample: 'id',
    });
  }
}

export const db = new InstrumentDatabase();
