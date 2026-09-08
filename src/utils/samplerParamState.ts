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
  return values;
};

const [paramValues, setParamValues] = createStore<SamplerParamValues>(loadDraft());

export const samplerParamValues = () => paramValues;

export const setSamplerParamValue = (key: SamplerParamKey, value: number): void => {
  if (!Number.isFinite(value) || paramValues[key] === value) return;

  setParamValues(key, value);
  try {
    sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(paramValues));
  } catch {
    // Live state remains usable when session storage is unavailable.
  }
};

export const snapshotSamplerParamValues = (): SamplerParamValues => ({
  ...samplerParamValues(),
});

export const restoreSamplerParamValues = (values: SamplerParams): void => {
  (Object.keys(values) as SamplerParamKey[]).forEach((key) => {
    if (key in samplerParams) setSamplerParamValue(key, values[key]!);
  });
};
