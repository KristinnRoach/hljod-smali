// db/sampleIdb.ts
import Dexie, { Table } from 'dexie';
import type { SamplerParamPatch } from '@kidlib/web-audio';

/**
 * A saved instrument: the audio it plays plus the params it plays it with.
 * `layers[0]` is the authority layer -- SamplePlayer takes duration, loop
 * points and zero crossings from it, and `params` are tuned against it.
 */
export interface SavedPatch {
  id?: number;
  name: string;
  layers: ArrayBuffer[];
  createdAt?: Date;
  params?: SamplerParamPatch;
}

export interface WorkingPatch {
  id: 'current';
  layers: ArrayBuffer[];
}

export class SampleDatabase extends Dexie {
  // ponytail: store names stay `samples`/`workingSamples`. Renaming an IndexedDB
  // store needs a two-version copy-then-drop (you can't reliably read a table
  // you're deleting in the same version), which is more migration risk than the
  // name is worth. The rows are patches.
  samples!: Table<SavedPatch>;
  workingSamples!: Table<WorkingPatch, WorkingPatch['id']>;

  constructor() {
    super('SampleDatabase');
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
  }
}

export const db = new SampleDatabase();
