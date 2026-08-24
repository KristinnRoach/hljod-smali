// Dexie schema for the instrument library. Internal to `instrumentLibrary.ts`
// -- nothing else should import this. See CONTEXT.md for `instrument`,
// `sample`, `working samples`.
import Dexie, { Table } from 'dexie';
import type { SamplerParams } from '@kidlib/web-audio';

/**
 * A saved instrument as stored: the samples it plays plus the params it plays
 * them with. `layers[0]` is the authority sample -- SamplePlayer takes
 * duration, loop points and zero crossings from it, and `params` are tuned
 * against it.
 *
 * ponytail: the stored field stays `layers` and the stores stay
 * `samples`/`workingSamples`. Renaming either costs a migration, and the row
 * shape never leaves this directory -- `instrumentLibrary` maps it to the
 * current vocabulary on the way out. Same trade as the store names below.
 */
export interface SavedInstrumentRow {
  id?: number;
  name: string;
  layers: ArrayBuffer[];
  createdAt?: Date;
  params?: SamplerParams;
}

export interface WorkingSamplesRow {
  id: 'current';
  layers: ArrayBuffer[];
}

export class InstrumentDatabase extends Dexie {
  // The `samples` store holds instruments. The property is bound to it by hand
  // so the code above reads in the current vocabulary without a migration.
  instruments!: Table<SavedInstrumentRow>;
  workingSamples!: Table<WorkingSamplesRow, WorkingSamplesRow['id']>;

  // The name is a parameter only so `instrumentDb.test.ts` can migrate a
  // throwaway database. Everything else uses the `db` singleton below.
  constructor(name = 'SampleDatabase') {
    super(name);
    this.version(1).stores({
      samples: '++id, name, createdAt',
    });
    this.version(2).stores({
      samples: '++id, name, createdAt',
      workingSamples: 'id',
    });
    // v3: single `audioData` buffer -> `layers[]`, and the nested
    // `patch: { params }` flattens to `params`. Indexes are unchanged; none of
    // the moved fields were indexed, so this is a data-only migration.
    this.version(3)
      .stores({
        samples: '++id, name, createdAt',
        workingSamples: 'id',
      })
      .upgrade(async (tx) => {
        await tx
          .table('samples')
          .toCollection()
          .modify((row: any) => {
            row.layers = [row.audioData];
            row.params = row.patch?.params;
            delete row.audioData;
            delete row.patch;
            delete row.sampleRate;
            delete row.channels;
          });
        await tx
          .table('workingSamples')
          .toCollection()
          .modify((row: any) => {
            row.layers = [row.audioData];
            delete row.audioData;
          });
      });

    this.instruments = this.table('samples');
  }
}

export const db = new InstrumentDatabase();
