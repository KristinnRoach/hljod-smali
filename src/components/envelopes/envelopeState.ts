import type { EnvelopeSettings } from '@kidlib/web-audio';

export type PointEnvelopeState = EnvelopeSettings;

// The package dropped per-envelope value ranges; point values are the normalized
// shape and the target places them on the param's own range.
export const VALUE_RANGE: readonly [number, number] = [0, 1];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** Adds a point in time order and keeps point-index references attached. */
export function addPoint(
  state: PointEnvelopeState,
  time: number,
  value: number,
): PointEnvelopeState {
  const { points, sustain, release } = state.envelope;
  const minTime = points[0]?.time ?? 0;
  const maxTime = points.at(-1)?.time ?? minTime;
  const point = {
    time: clamp(time, minTime, maxTime),
    value: clamp(value, VALUE_RANGE[0], VALUE_RANGE[1]),
    curve: 'exponential' as const,
  };
  const followingIndex = points.findIndex((candidate) => candidate.time > point.time);
  const index = followingIndex === -1 ? points.length : followingIndex;
  const nextPoints = [...points];
  nextPoints.splice(index, 0, point);

  return {
    ...state,
    envelope: {
      ...state.envelope,
      points: nextPoints,
      sustain: sustain !== undefined && sustain >= index ? sustain + 1 : sustain,
      release: release !== undefined && release >= index ? release + 1 : release,
    },
  };
}

/** Removes an interior point. Envelopes always retain their two endpoints. */
export function removePoint(state: PointEnvelopeState, index: number): PointEnvelopeState {
  const { points, sustain, release } = state.envelope;
  if (!Number.isInteger(index) || points.length <= 2 || index <= 0 || index >= points.length - 1) {
    return state;
  }

  const nextPoints = points.filter((_point, pointIndex) => pointIndex !== index);
  const nextSustain =
    sustain === index
      ? undefined
      : sustain !== undefined && sustain > index
        ? sustain - 1
        : sustain;
  const nextRelease =
    release === index
      ? Math.min(index, nextPoints.length - 2)
      : release !== undefined && release > index
        ? release - 1
        : release;

  return {
    ...state,
    envelope: {
      ...state.envelope,
      points: nextPoints,
      sustain: nextSustain,
      release: nextRelease,
    },
  };
}

/**
 * Moves one point of a snapshot, clamped to its neighbours' times and to the
 * envelope's value range. Returns a new state; the input is left alone.
 */
export function movePoint(
  state: PointEnvelopeState,
  index: number,
  time: number,
  value: number,
): PointEnvelopeState {
  const { points } = state.envelope;
  if (!Number.isInteger(index) || index < 0 || index >= points.length) return state;

  const point = points[index];
  const minTime = points[index - 1]?.time ?? 0;
  const maxTime = points[index + 1]?.time ?? Infinity;
  const isEndpoint = index === 0 || index === points.length - 1;
  const nextTime = isEndpoint ? point.time : clamp(time, minTime, maxTime);
  const nextValue = clamp(value, VALUE_RANGE[0], VALUE_RANGE[1]);
  if (point.time === nextTime && point.value === nextValue) return state;

  const nextPoints = [...points];
  nextPoints[index] = { ...point, time: nextTime, value: nextValue };

  return {
    ...state,
    envelope: {
      ...state.envelope,
      points: nextPoints,
    },
  };
}
