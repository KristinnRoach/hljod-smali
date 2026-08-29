import { expect, test } from 'vite-plus/test';

import { addPoint, movePoint, removePoint, type PointEnvelopeState } from './envelopeState';

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

test('a point is inserted in time order and referenced indexes follow it', () => {
  const state = baseState();
  state.shape.sustainIndex = 1;

  const next = addPoint(state, 0.25, 0.4);

  expect(next.shape.points[1]).toEqual({ time: 0.25, value: 0.4, curve: 'exponential' });
  expect(next.shape.points.map((point) => point.time)).toEqual([0, 0.25, 0.5, 1]);
  expect(next.shape.sustainIndex).toBe(2);
  expect(next.shape.releaseIndex).toBe(2);
  expect(state.shape.points).toHaveLength(3);
});

test('removing a point repairs sustain and release references', () => {
  const state = addPoint(baseState(), 0.25, 0.4);
  state.shape.sustainIndex = 1;
  state.shape.releaseIndex = 1;

  const next = removePoint(state, 1);

  expect(next.shape.points.map((point) => point.time)).toEqual([0, 0.5, 1]);
  expect(next.shape.sustainIndex).toBeNull();
  expect(next.shape.releaseIndex).toBe(1);
});

test('the two endpoint points cannot be removed', () => {
  const state = baseState();

  expect(removePoint(state, 0)).toBe(state);
  expect(removePoint(state, 2)).toBe(state);
});

test('invalid point indexes are ignored', () => {
  const state = baseState();

  expect(removePoint(state, Number.NaN)).toBe(state);
  expect(removePoint(state, 1.5)).toBe(state);
});
