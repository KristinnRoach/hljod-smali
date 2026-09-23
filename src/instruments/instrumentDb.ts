// Dexie schema for the instrument library. Internal to `instrumentLibrary.ts`
// -- nothing else should import this. See CONTEXT.md for `instrument`,
// `sample`, `working samples`.
import Dexie, { Table } from 'dexie';
import type { SampleEnvelopeId, EnvelopeConfig, SamplerParams } from '@kidlib/web-audio';

export type InstrumentEnvelopes = Partial<Record<SampleEnvelopeId, EnvelopeConfig>>;

/**
 * The pre-0.5.0 `EnvelopeState` shape (web-audio <= 0.4.x), kept only for the
 * v4 upgrade. Old times only had to be non-decreasing.
 */
interface LegacyEnvelopeState {
  enabled: boolean;
  timeScale: number;
  loop: boolean;
  shape: {
    points: { time: number; value: number; curve?: 'linear' | 'exponential' }[];
    valueRange: [number, number];
    sustainIndex: number | null;
    releaseIndex: number;
  };
}

// 0.5.0 rejects point times that are not strictly increasing.
const MIN_POINT_GAP = 1e-3;

/**
 * Maps an old amp-env state to `EnvelopeConfig`. Amp values mean the same in both.
 * Writes the current format directly; v5 then finds nothing left to rename.
 */
export function migrateLegacyAmpEnvelope(state: LegacyEnvelopeState): EnvelopeConfig {
  const { points, valueRange, sustainIndex, releaseIndex } = state.shape;
  const [low, high] = valueRange;
  let previousTime = -Infinity;
  return {
    enabled: state.enabled,
    timeScale: state.timeScale,
    shape: {
      points: points.map(({ time, value, curve }) => {
        previousTime = Math.max(time, previousTime + MIN_POINT_GAP);
        return { time: previousTime, value: (value - low) / (high - low), curve };
      }),
      mode: state.loop
        ? { type: 'loop' }
        : sustainIndex === null
          ? { type: 'once' }
          : { type: 'sustain' },
      sustainPoint: sustainIndex ?? releaseIndex,
      releasePoint: releaseIndex,
    },
  };
}

/** Which instrument. `builtin` has no row of its own. */
export type InstrumentRef = { kind: 'builtin' } | { kind: 'saved'; id: number };

/**
 * A saved instrument as stored: the samples it plays plus the params it plays
 * them with. `layers[0]` is the authority sample -- SamplePlayer takes
 * duration, loop points and zero crossings from it, and `params` are tuned
 * against it.
 *
 * NOTE: the stored field stays `layers` and the stores stay
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
  envelopes?: InstrumentEnvelopes;
}

export interface WorkingSamplesRow {
  id: 'current';
  layers: ArrayBuffer[];
  /**
   * The instruments these layers came from, base first. Absent for layers with
   * no instrument behind them (dropped files) and on rows written before this
   * field existed. Unindexed, so no migration.
   */
  refs?: InstrumentRef[];
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

    // v4: envelopes move to web-audio 0.5.0's `EnvelopeConfig`. Only amp-env
    // keeps its meaning; old pitch/filter values don't map, so they fall back
    // to defaults on load. Data-only, indexes unchanged.
    this.version(4)
      .stores({
        samples: '++id, name, createdAt',
        workingSamples: 'id',
      })
      .upgrade(async (tx) => {
        await tx
          .table('samples')
          .toCollection()
          .modify((row: any) => {
            const amp = row.envelopes?.['amp-env'];
            if (amp?.shape) row.envelopes = { amp: migrateLegacyAmpEnvelope(amp) };
            else if (row.envelopes) delete row.envelopes;
          });
      });

    // v5: web-audio renamed envelope ids ('amp-env' -> 'amp'), `envelope` ->
    // `shape`, and the shape's `sustain`/`release` -> `sustainPoint`/`releasePoint`.
    // Data-only, indexes unchanged.
    this.version(5)
      .stores({
        samples: '++id, name, createdAt',
        workingSamples: 'id',
      })
      .upgrade(async (tx) => {
        await tx
          .table('samples')
          .toCollection()
          .modify((row: any) => {
            if (!row.envelopes) return;
            row.envelopes = Object.fromEntries(
              Object.entries(row.envelopes).map(([id, config]: [string, any]) => {
                if (!config?.envelope) return [id, config];
                const { envelope, ...rest } = config;
                const { sustain, release, ...shape } = envelope;
                return [
                  id.replace(/-env$/, ''),
                  { ...rest, shape: { ...shape, sustainPoint: sustain, releasePoint: release } },
                ];
              }),
            );
          });
      });

    this.instruments = this.table('samples');
  }
}

export const db = new InstrumentDatabase();
