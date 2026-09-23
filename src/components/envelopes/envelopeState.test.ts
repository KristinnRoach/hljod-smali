import { expect, test } from 'vite-plus/test';
import type { EnvelopeMode } from '@kidlib/web-audio';

import { addPoint, movePoint, removePoint, type PointEnvelopeState } from './envelopeState';

const baseState = (mode: EnvelopeMode = { type: 'once' }): PointEnvelopeState => ({
  enabled: true,
  timeScale: 1,
  envelope: {
    points: [
      { time: 0, value: 0, curve: 'exponential' },
      { time: 0.5, value: 1, curve: 'exponential' },
      { time: 1, value: 0, curve: 'exponential' },
    ],
    mode,
    sustain: 1,
    release: 1,
  },
});

test('a dragged point is clamped to its neighbours and the value range', () => {
  const state = baseState();
  const moved = movePoint(state, 1, 5, 3);

  expect(moved.envelope.points[1]).toEqual({ time: 1, value: 1, curve: 'exponential' });
  // Untouched points and the input snapshot both survive.
  expect(moved.envelope.points[0]).toEqual(state.envelope.points[0]);
  expect(moved.envelope.points[0]).toBe(state.envelope.points[0]);
  expect(moved.envelope.points[2]).toBe(state.envelope.points[2]);
  expect(state.envelope.points[1].time).toBe(0.5);
});

test('moving to the current or clamped position is a no-op', () => {
  const state = baseState();
  const atBoundary = movePoint(state, 1, 5, 3);

  expect(movePoint(state, 1, 0.5, 1)).toBe(state);
  expect(movePoint(atBoundary, 1, 5, 3)).toBe(atBoundary);
});

test('endpoint points keep their time while their value can move', () => {
  const state = baseState();

  const first = movePoint(state, 0, 5, 0.75);
  const last = movePoint(state, 2, -5, 0.25);

  expect(first.envelope.points[0]).toEqual({ time: 0, value: 0.75, curve: 'exponential' });
  expect(last.envelope.points[2]).toEqual({ time: 1, value: 0.25, curve: 'exponential' });
});

test('an edit returns a complete snapshot', () => {
  const next = movePoint(baseState(), 1, 0.25, 0.4);

  // Everything the package validates travels with the edit.
  expect(next).toMatchObject({ enabled: true, timeScale: 1 });
  expect(next.envelope.points[1]).toEqual({ time: 0.25, value: 0.4, curve: 'exponential' });
  expect(next.envelope.mode).toEqual({ type: 'once' });
  expect(next.envelope.release).toBe(1);
});

test('a point is inserted in time order and referenced indexes follow it', () => {
  const state = baseState({ type: 'sustain' });

  const next = addPoint(state, 0.25, 0.4);

  expect(next.envelope.points[1]).toEqual({ time: 0.25, value: 0.4, curve: 'exponential' });
  expect(next.envelope.points.map((point) => point.time)).toEqual([0, 0.25, 0.5, 1]);
  expect(next.envelope.sustain).toBe(2);
  expect(next.envelope.release).toBe(2);
  expect(state.envelope.points).toHaveLength(3);
});

test('removing a marked point moves sustain and release to its replacement', () => {
  const state = addPoint(baseState({ type: 'sustain' }), 0.25, 0.4);

  // The inserted point is index 1; sustain and release both moved to 2.
  const next = removePoint(state, 2);

  expect(next.envelope.points.map((point) => point.time)).toEqual([0, 0.25, 1]);
  expect(next.envelope.sustain).toBe(1);
  expect(next.envelope.release).toBe(1);
});

test('a loop mode survives point edits untouched', () => {
  const state = baseState({ type: 'loop' });

  expect(addPoint(state, 0.25, 0.4).envelope.mode).toEqual({ type: 'loop' });
  expect(removePoint(addPoint(state, 0.25, 0.4), 1).envelope.mode).toEqual({ type: 'loop' });
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
  expect(movePoint(state, -1, 0.25, 0.4)).toBe(state);
  expect(movePoint(state, 3, 0.25, 0.4)).toBe(state);
  expect(movePoint(state, 1.5, 0.25, 0.4)).toBe(state);
});
