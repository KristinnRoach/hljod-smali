import { expect, test } from 'vite-plus/test';

import { movePoint, type PointEnvelopeState } from './envelopeState';

const baseState = (): PointEnvelopeState => ({
  enabled: true,
  timeScale: 1,
  playbackRateSync: false,
  loop: false,
  shape: {
    kind: 'points',
    points: [
      { time: 0, value: 0, curve: 'exponential' },
      { time: 0.5, value: 1, curve: 'exponential' },
      { time: 1, value: 0, curve: 'exponential' },
    ],
    valueRange: [0, 1],
    sustainIndex: null,
    releaseIndex: 1,
  },
});

test('a dragged point is clamped to its neighbours and the value range', () => {
  const state = baseState();
  const moved = movePoint(state, 1, 5, 3);

  expect(moved.shape.points[1]).toEqual({ time: 1, value: 1, curve: 'exponential' });
  // Untouched points and the input snapshot both survive.
  expect(moved.shape.points[0]).toEqual(state.shape.points[0]);
  expect(state.shape.points[1].time).toBe(0.5);
});

test('an edit returns a complete snapshot', () => {
  const next = movePoint(baseState(), 1, 0.25, 0.4);

  // Everything the package validates travels with the edit.
  expect(next).toMatchObject({ enabled: true, timeScale: 1, loop: false });
  expect(next.shape.points[1]).toEqual({ time: 0.25, value: 0.4, curve: 'exponential' });
  expect(next.shape.valueRange).toEqual([0, 1]);
  expect(next.shape.releaseIndex).toBe(1);
});
