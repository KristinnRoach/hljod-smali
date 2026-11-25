import { createSignal } from 'solid-js';
import { createStore } from 'solid-js/store';
import {
  samplerParams,
  type SamplerParamKey,
  type SamplerParams,
  type SamplerParamValues,
} from '@kidlib/web-audio';

const DRAFT_STORAGE_KEY = 'play:working-param-draft:v1';

export const defaultSamplerParamValues = {
  ...Object.fromEntries(Object.entries(samplerParams).map(([k, d]) => [k, d.defaultValue])),
  // Temp local tweaks to defaults, update web-audio package when settled or use an override consistently (e.g. double click to reset to defaults)
  dryWet: 0.5,
} as SamplerParamValues;

const loadDraft = (): SamplerParamValues => {
  const values = { ...defaultSamplerParamValues };
  try {
    const draft = JSON.parse(
      sessionStorage.getItem(DRAFT_STORAGE_KEY) ?? 'null',
    ) as SamplerParams | null;
    if (draft) {
      Object.entries(draft).forEach(([key, value]) => {
        if (key in samplerParams && typeof value === 'number' && Number.isFinite(value)) {
          values[key as SamplerParamKey] = value;
        }
      });
    }
  } catch {
    // Session persistence is best-effort; descriptor defaults remain valid.
  }
  values.loopDuration = values.loopEnd - values.loopStart;
  return values;
};

const [paramValueStore, setParamValueStore] = createStore<SamplerParamValues>(loadDraft());

export const samplerParamValues = () => paramValueStore;

export const [loopDurationLocked, setLoopDurationLocked] = createSignal(false);

export const [zoomScaledParams, setZoomScaledParams] = createSignal<readonly SamplerParamKey[]>([
  // 'trimStart',
  // 'trimEnd',
  // 'loopStart',
  // 'loopEnd',
]);

type RangeConstraint = {
  /**
   * free: no limit.
   * overlap: trimStart <= loopEnd and trimEnd >= loopStart.
   * inside: trimStart <= loopStart and trimEnd >= loopEnd.
   */
  limit: 'free' | 'overlap' | 'inside';
  /** At the limit: push the other range, or stop. */
  onLimit: 'push' | 'stop';
  allowInverted: boolean;
};

/** Change these to change how trim and loop limit each other. */
const rangeConstraints: Record<'trim' | 'loop', RangeConstraint> = {
  /** While editing trim. */
  trim: { limit: 'overlap', onLimit: 'push', allowInverted: false },
  /** While editing the loop. */
  loop: { limit: 'inside', onLimit: 'stop', allowInverted: true },
};

/**
 * Applies `rangeConstraints` to `values` in place.
 *
 * Known edge cases, not handled:
 * - Pushed points don't return when the push is undone.
 * - Trim pushing the loop can collapse it to zero length (inside).
 * - Ranges touching at a single point count as overlapping.
 * - Moving the whole loop into the limit changes its length (loop onLimit stop).
 * - With different limits, trim edits can leave loop points outside trim; they snap in when edited.
 * - Changing trim and loop together (presets, zoom) counts as a trim edit.
 * - Dragging one point quickly past its other end can make the other end jump
 *   (with inversion allowed).
 * - Applies while looping is off too, but not to a loaded draft until the first edit.
 */
const constrainRanges = (values: SamplerParamValues): void => {
  const previous = paramValueStore;

  // Inversion off: the edited point stops at the other one.
  if (!rangeConstraints.trim.allowInverted && values.trimStart > values.trimEnd) {
    if (values.trimStart !== previous.trimStart) values.trimStart = values.trimEnd;
    else values.trimEnd = values.trimStart;
  }
  if (!rangeConstraints.loop.allowInverted && values.loopStart > values.loopEnd) {
    if (values.loopStart !== previous.loopStart) values.loopStart = values.loopEnd;
    else values.loopEnd = values.loopStart;
  }

  const trimEdited = values.trimStart !== previous.trimStart || values.trimEnd !== previous.trimEnd;

  const loopStartEdited = values.loopStart !== previous.loopStart;
  const loopEndEdited = values.loopEnd !== previous.loopEnd;
  if (!trimEdited && !loopStartEdited && !loopEndEdited) return;

  const { limit, onLimit } = trimEdited ? rangeConstraints.trim : rangeConstraints.loop;
  if (limit === 'free') return;

  const moveTrim = trimEdited ? onLimit === 'stop' : onLimit === 'push';

  // Low/high ends, whichever way each range points.
  const trimInverted = values.trimStart > values.trimEnd;
  const trimLow = trimInverted ? 'trimEnd' : 'trimStart';
  const trimHigh = trimInverted ? 'trimStart' : 'trimEnd';
  const loopInverted = values.loopStart > values.loopEnd;
  const loopLow = loopInverted ? 'loopEnd' : 'loopStart';
  const loopHigh = loopInverted ? 'loopStart' : 'loopEnd';

  if (moveTrim) {
    // Loop ends that trim must reach.
    const startLimit = limit === 'overlap' ? loopHigh : loopLow;
    const endLimit = limit === 'overlap' ? loopLow : loopHigh;
    values[trimLow] = Math.min(values[trimLow], values[startLimit]);
    values[trimHigh] = Math.max(values[trimHigh], values[endLimit]);
  } else if (limit === 'overlap') {
    values[loopHigh] = Math.max(values[loopHigh], values[trimLow]);
    values[loopLow] = Math.min(values[loopLow], values[trimHigh]);
  } else {
    const clampToTrim = (x: number) => Math.max(values[trimLow], Math.min(values[trimHigh], x));
    // Editing one loop point leaves the other where it is.
    if (trimEdited || loopStartEdited) values.loopStart = clampToTrim(values.loopStart);
    if (trimEdited || loopEndEdited) values.loopEnd = clampToTrim(values.loopEnd);
  }
};

/** Only writer of the store: derives loopDuration, writes, persists the draft. */
const commitParamValues = (values: SamplerParamValues): void => {
  constrainRanges(values);
  values.loopDuration = values.loopEnd - values.loopStart;

  setParamValueStore(values);
  try {
    sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(paramValueStore));
  } catch {
    // Live state remains usable when session storage is unavailable.
  }
};

/** Remap selected normalized parameters between ranges, clamping to 0..1. */
export const scaleSamplerParamRange = (
  keys: readonly SamplerParamKey[],
  previous: { start: number; end: number },
  next: { start: number; end: number },
): void => {
  const span = previous.end - previous.start;
  if (span <= 0) return;
  const values = { ...paramValueStore };
  for (const key of keys) {
    if (key === 'loopDuration') continue;
    const position = (values[key] - previous.start) / span;
    values[key] = Math.max(0, Math.min(1, next.start + position * (next.end - next.start)));
  }
  if (keys.includes('loopDuration')) {
    values.loopEnd = Math.max(
      0,
      Math.min(
        1,
        values.loopStart + (paramValueStore.loopDuration * (next.end - next.start)) / span,
      ),
    );
  }
  // Apply together so intermediate trim bounds cannot collapse the loop.
  commitParamValues(values);
};

/** Move the whole loop to a normalized Start, preserving its signed length. */
export const moveLoop = (start: number): void => {
  if (!Number.isFinite(start)) return;
  const duration = paramValueStore.loopDuration;
  const loopStart = Math.max(Math.max(0, -duration), Math.min(start, 1 - Math.max(0, duration)));
  commitParamValues({ ...paramValueStore, loopStart, loopEnd: loopStart + duration });
};

/** Set one param from the UI, applying the Duration lock and Duration -> End derivation. */
export const setSamplerParamValue = (key: SamplerParamKey, value: number): void => {
  if (!Number.isFinite(value) || paramValueStore[key] === value) return;

  if (key === 'loopStart' && loopDurationLocked()) return moveLoop(value);

  const values = { ...paramValueStore, [key]: value };
  if (key === 'loopDuration') {
    values.loopEnd = Math.max(0, Math.min(1, values.loopStart + value));
  }
  commitParamValues(values);
};

export const snapshotSamplerParamValues = (): SamplerParamValues => ({
  ...samplerParamValues(),
});

export const restoreSamplerParamValues = (values: SamplerParams): void => {
  const next = { ...paramValueStore };
  (Object.keys(values) as SamplerParamKey[]).forEach((key) => {
    if (key in samplerParams && Number.isFinite(values[key])) next[key] = values[key]!;
  });
  if (values.loopDuration !== undefined && values.loopEnd === undefined) {
    next.loopEnd = Math.max(0, Math.min(1, next.loopStart + next.loopDuration));
  }
  commitParamValues(next);
};
