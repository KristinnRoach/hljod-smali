import type { EnvelopeConfig } from '@kidlib/web-audio';

export type PointEnvelopeState = EnvelopeConfig;

// The package dropped per-envelope value ranges; point values are the normalized
// shape and the target places them on the param's own range.
export const VALUE_RANGE: readonly [number, number] = [0, 1];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

// Seconds kept between neighbouring points: the package rejects a shape whose
// point times are not strictly increasing.
const MIN_POINT_GAP = 1e-3;

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
  if (points.some((existing) => Math.abs(existing.time - point.time) < MIN_POINT_GAP)) return state;
  const followingIndex = points.findIndex((candidate) => candidate.time > point.time);
  const index = followingIndex === -1 ? points.length : followingIndex;
  const nextPoints = [...points];
  nextPoints.splice(index, 0, point);

  return {
    ...state,
    envelope: {
      ...state.envelope,
      points: nextPoints,
      sustain: sustain >= index ? sustain + 1 : sustain,
      release: release >= index ? release + 1 : release,
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
  // Removing the marked point moves the marker to the point that took its place.
  const shift = (marker: number) =>
    marker === index
      ? Math.min(index, nextPoints.length - 2)
      : marker > index
        ? marker - 1
        : marker;

  return {
    ...state,
    envelope: {
      ...state.envelope,
      points: nextPoints,
      sustain: shift(sustain),
      release: shift(release),
    },
  };
}

/**
 * Moves one point of a snapshot, clamped to just inside its neighbours' times
 * and to the envelope's value range. Returns a new state; the input is left alone.
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
  const minTime = (points[index - 1]?.time ?? -Infinity) + MIN_POINT_GAP;
  const maxTime = (points[index + 1]?.time ?? Infinity) - MIN_POINT_GAP;
  const isEndpoint = index === 0 || index === points.length - 1;
  const nextTime = isEndpoint || minTime > maxTime ? point.time : clamp(time, minTime, maxTime);
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
