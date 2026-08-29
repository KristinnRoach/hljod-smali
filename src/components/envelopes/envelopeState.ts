import type { EnvelopeState, PointEnvelopeShape } from '@kidlib/web-audio';

export type PointEnvelopeState = EnvelopeState & { shape: PointEnvelopeShape };

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** Adds a point in time order and keeps point-index references attached. */
export function addPoint(
  state: PointEnvelopeState,
  time: number,
  value: number,
): PointEnvelopeState {
  const { points, valueRange, sustainIndex, releaseIndex } = state.shape;
  const minTime = points[0]?.time ?? 0;
  const maxTime = points.at(-1)?.time ?? minTime;
  const point = {
    time: clamp(time, minTime, maxTime),
    value: clamp(value, valueRange[0], valueRange[1]),
    curve: 'exponential' as const,
  };
  const followingIndex = points.findIndex((candidate) => candidate.time > point.time);
  const index = followingIndex === -1 ? points.length : followingIndex;
  const nextPoints = points.map((candidate) => ({ ...candidate }));
  nextPoints.splice(index, 0, point);

  return {
    ...state,
    shape: {
      ...state.shape,
      points: nextPoints,
      sustainIndex:
        sustainIndex !== null && sustainIndex >= index ? sustainIndex + 1 : sustainIndex,
      releaseIndex: releaseIndex >= index ? releaseIndex + 1 : releaseIndex,
    },
  };
}

/** Removes an interior point. Envelopes always retain their two endpoints. */
export function removePoint(state: PointEnvelopeState, index: number): PointEnvelopeState {
  const { points, sustainIndex, releaseIndex } = state.shape;
  if (!Number.isInteger(index) || points.length <= 2 || index <= 0 || index >= points.length - 1) {
    return state;
  }

  const nextPoints = points
    .filter((_point, pointIndex) => pointIndex !== index)
    .map((p) => ({ ...p }));
  const nextSustainIndex =
    sustainIndex === index
      ? null
      : sustainIndex !== null && sustainIndex > index
        ? sustainIndex - 1
        : sustainIndex;
  const nextReleaseIndex =
    releaseIndex === index
      ? Math.min(index, nextPoints.length - 2)
      : releaseIndex > index
        ? releaseIndex - 1
        : releaseIndex;

  return {
    ...state,
    shape: {
      ...state.shape,
      points: nextPoints,
      sustainIndex: nextSustainIndex,
      releaseIndex: nextReleaseIndex,
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
  const { points, valueRange } = state.shape;
  const minTime = points[index - 1]?.time ?? 0;
  const maxTime = points[index + 1]?.time ?? Infinity;

  return {
    ...state,
    shape: {
      ...state.shape,
      points: points.map((point, i) =>
        i === index
          ? {
              ...point,
              time: clamp(time, minTime, maxTime),
              value: clamp(value, valueRange[0], valueRange[1]),
            }
          : { ...point },
      ),
    },
  };
}
