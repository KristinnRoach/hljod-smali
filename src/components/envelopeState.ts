import type { EnvelopeState, SampleEnvelopeType, SamplePlayer } from '@kidlib/web-audio';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/**
 * Moves one point of a snapshot, clamped to its neighbours' times and to the
 * envelope's value range. Returns a new state; the input is left alone.
 */
export function movePoint(
  state: EnvelopeState,
  index: number,
  time: number,
  value: number,
): EnvelopeState {
  const { points, valueRange } = state.shape;
  const minTime = points[index - 1]?.time ?? 0;
  // ponytail: last point is free to move right, so the editor's time axis grows with it.
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

/** Moves a point and pushes the result as one complete snapshot. */
export function commitPointMove(
  player: SamplePlayer,
  type: SampleEnvelopeType,
  state: EnvelopeState,
  index: number,
  time: number,
  value: number,
): EnvelopeState {
  const next = movePoint(state, index, time, value);
  player.applyEnvelopeState(type, next);
  return next;
}
