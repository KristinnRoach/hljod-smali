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
  dryWet: 0.1,
  reverbSend: 0.75,
  reverbSize: 0.5,
  delayTime: 0.15,
  delayFeedback: 0.1,
  feedbackPitch: 0.5,
  feedbackLpf: 6666,
  feedbackDecay: 0.15,
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
  return clampLoopToTrim(values);
};

// Loop points stay inside the trim range. Clamping is monotonic, so an ordered
// loop stays ordered.
function clampLoopToTrim(values: SamplerParamValues): SamplerParamValues {
  const clamp = (value: number) => Math.min(Math.max(value, values.trimStart), values.trimEnd);
  return { ...values, loopStart: clamp(values.loopStart), loopEnd: clamp(values.loopEnd) };
}

const [paramValues, setParamValues] = createStore<SamplerParamValues>(loadDraft());

export const samplerParamValues = () => paramValues;

const updateParamValues = (values: SamplerParamValues): void => {
  setParamValues(clampLoopToTrim(values));
  try {
    sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(paramValues));
  } catch {
    // Live state remains usable when session storage is unavailable.
  }
};

/** Preserve Trim/Loop positions relative to the viewport when its range changes. */
export const scaleSamplePointsToRange = (
  previous: { start: number; end: number },
  next: { start: number; end: number },
): void => {
  const span = previous.end - previous.start;
  if (span <= 0) return;
  const values = { ...paramValues };
  for (const key of ['trimStart', 'trimEnd', 'loopStart', 'loopEnd'] as const) {
    const position = (values[key] - previous.start) / span;
    values[key] = Math.max(0, Math.min(1, next.start + position * (next.end - next.start)));
  }
  // Apply all four together so intermediate trim bounds cannot collapse the loop.
  updateParamValues(values);
};

export const setSamplerParamValue = (key: SamplerParamKey, value: number): void => {
  if (!Number.isFinite(value) || paramValues[key] === value) return;

  updateParamValues({ ...paramValues, [key]: value });
};

export const snapshotSamplerParamValues = (): SamplerParamValues => ({
  ...samplerParamValues(),
});

export const restoreSamplerParamValues = (values: SamplerParams): void => {
  (Object.keys(values) as SamplerParamKey[]).forEach((key) => {
    if (key in samplerParams) setSamplerParamValue(key, values[key]!);
  });
};
