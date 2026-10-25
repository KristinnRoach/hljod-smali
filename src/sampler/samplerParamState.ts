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
  'trimStart',
  'trimEnd',
  // 'loopStart',
  // 'loopEnd',
]);

/** Only writer of the store: derives loopDuration, writes, persists the draft. */
const commitParamValues = (values: SamplerParamValues): void => {
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
