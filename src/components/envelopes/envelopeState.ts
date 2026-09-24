import type { EnvelopeConfig, SampleEnvelopeId } from '@kidlib/web-audio';

export type ValueRange = readonly [number, number];

/** How the editor's value axis behaves for one envelope. */
export type EnvelopeAxis = {
  /** Value span of the axis; point values are clamped to it. */
  readonly range: ValueRange;
  /** Values a point snaps to when dropped close enough, and drawn as guide lines. */
  readonly snapTo: readonly number[];
};

// Point values are the normalized shape; the package places them on the param's
// own range. Pitch is bipolar: -1..1 is an octave down..up, 0 is unison.
export const envelopeAxis = (id: SampleEnvelopeId): EnvelopeAxis =>
  id === 'pitch' ? { range: [-1, 1], snapTo: [0] } : { range: [0, 1], snapTo: [] };

/** The nearest target within `tolerance` of `value`, or `value` itself. */
export function snapValue(value: number, targets: readonly number[], tolerance: number): number {
  let snapped = value;
  let distance = tolerance;
  for (const target of targets) {
    const d = Math.abs(target - value);
    if (d <= distance) {
      snapped = target;
      distance = d;
    }
  }
  return snapped;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

// Seconds kept between neighbouring points: the package rejects a shape whose
// point times are not strictly increasing.
const MIN_POINT_GAP = 1e-3;

/** Adds a point in time order and keeps point-index references attached. */
export function addPoint(
  state: EnvelopeConfig,
  time: number,
  value: number,
  [minValue, maxValue]: ValueRange = [0, 1],
): EnvelopeConfig {
  const { points, sustainPoint, releasePoint } = state.shape;
  const minTime = points[0]?.time ?? 0;
  const maxTime = points.at(-1)?.time ?? minTime;
  const point = {
    time: clamp(time, minTime, maxTime),
    value: clamp(value, minValue, maxValue),
    curve: 'exponential' as const,
  };
  if (points.some((existing) => Math.abs(existing.time - point.time) < MIN_POINT_GAP)) return state;
  const followingIndex = points.findIndex((candidate) => candidate.time > point.time);
  const index = followingIndex === -1 ? points.length : followingIndex;
  const nextPoints = [...points];
  nextPoints.splice(index, 0, point);

  return {
    ...state,
    shape: {
      ...state.shape,
      points: nextPoints,
      sustainPoint: sustainPoint >= index ? sustainPoint + 1 : sustainPoint,
      releasePoint: releasePoint >= index ? releasePoint + 1 : releasePoint,
    },
  };
}

/** Removes an interior point. Envelopes always retain their two endpoints. */
export function removePoint(state: EnvelopeConfig, index: number): EnvelopeConfig {
  const { points, sustainPoint, releasePoint } = state.shape;
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
    shape: {
      ...state.shape,
      points: nextPoints,
      sustainPoint: shift(sustainPoint),
      releasePoint: shift(releasePoint),
    },
  };
}

/**
 * Moves one point of a snapshot, clamped to just inside its neighbours' times
 * and to the envelope's value range. Returns a new state; the input is left alone.
 */
export function movePoint(
  state: EnvelopeConfig,
  index: number,
  time: number,
  value: number,
  [minValue, maxValue]: ValueRange = [0, 1],
): EnvelopeConfig {
  const { points } = state.shape;
  if (!Number.isInteger(index) || index < 0 || index >= points.length) return state;

  const point = points[index];
  const minTime = (points[index - 1]?.time ?? -Infinity) + MIN_POINT_GAP;
  const maxTime = (points[index + 1]?.time ?? Infinity) - MIN_POINT_GAP;
  const isEndpoint = index === 0 || index === points.length - 1;
  const nextTime = isEndpoint || minTime > maxTime ? point.time : clamp(time, minTime, maxTime);
  const nextValue = clamp(value, minValue, maxValue);
  if (point.time === nextTime && point.value === nextValue) return state;

  const nextPoints = [...points];
  nextPoints[index] = { ...point, time: nextTime, value: nextValue };

  return {
    ...state,
    shape: {
      ...state.shape,
      points: nextPoints,
    },
  };
}
