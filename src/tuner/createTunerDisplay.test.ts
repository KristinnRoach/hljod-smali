import { createRoot, createSignal } from 'solid-js';
import { afterEach, expect, test, vi } from 'vite-plus/test';

import { createTunerDisplay } from './createTunerDisplay';

// Node normally resolves Solid's non-reactive server build.
vi.mock('solid-js', () => vi.importActual('solid-js/dist/solid.js'));

afterEach(() => vi.useRealTimers());

function setup() {
  vi.useFakeTimers();
  return createRoot((dispose) => {
    const [frequency, setFrequency] = createSignal<number | null>(440);
    return { ...createTunerDisplay(frequency), setFrequency, dispose };
  });
}

test('holds the last pitch for 150ms before fading', () => {
  const display = setup();
  display.setFrequency(null);
  vi.advanceTimersByTime(149);
  expect(display.visible()).toBe(true);
  expect(display.reading()?.note).toBe('A');
  vi.advanceTimersByTime(1);
  expect(display.visible()).toBe(false);
  expect(display.reading()?.note).toBe('A');
  display.dispose();
});

test('a recovered pitch cancels the pending fade', () => {
  const display = setup();
  display.setFrequency(null);
  vi.advanceTimersByTime(100);
  display.setFrequency(442);
  vi.advanceTimersByTime(200);
  expect(display.visible()).toBe(true);
  display.setFrequency(null);
  vi.advanceTimersByTime(150);
  expect(display.visible()).toBe(false);
  display.setFrequency(440);
  expect(display.visible()).toBe(true);
  display.dispose();
});

test('only note or octave changes replace the crossfade labels', () => {
  const display = setup();
  const original = display.note();
  display.setFrequency(442);
  expect(display.note()).toBe(original);
  expect(display.previousNote()).toBeNull();
  display.setFrequency(880);
  expect(display.note()?.octave).toBe(5);
  expect(display.previousNote()).toBe(original);
  const previous = display.previousNote();
  display.setFrequency(882);
  expect(display.previousNote()).toBe(previous);
  display.dispose();
});

test('unmount clears the pending hold timer', () => {
  const display = setup();
  display.setFrequency(null);
  display.dispose();
  expect(vi.getTimerCount()).toBe(0);
});
