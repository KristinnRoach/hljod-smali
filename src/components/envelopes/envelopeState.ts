import type { EnvelopeState, PointEnvelopeShape } from '@kidlib/web-audio';

export type PointEnvelopeState = EnvelopeState & { shape: PointEnvelopeShape };

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

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
