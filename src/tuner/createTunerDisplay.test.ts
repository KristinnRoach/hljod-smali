import { createRoot, createSignal } from 'solid-js';
import { afterEach, expect, test, vi } from 'vite-plus/test';

import { createTunerDisplay } from './createTunerDisplay';

// Node normally resolves Solid's non-reactive server build.
vi.mock('solid-js', () => vi.importActual('solid-js/dist/solid.js'));

afterEach(() => vi.useRealTimers());

function setup(initialFrequency: number | null = 440) {
  vi.useFakeTimers();
  return createRoot((dispose) => {
    const [frequency, setFrequency] = createSignal<number | null>(initialFrequency);
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

test('starts hidden and shows a newly detected pitch', () => {
  const display = setup(null);
  expect(display.visible()).toBe(false);
  expect(display.reading()).toBeNull();
  display.setFrequency(440);
  expect(display.visible()).toBe(true);
  expect(display.reading()?.note).toBe('A');
  expect(vi.getTimerCount()).toBe(0);
  display.dispose();
});

test('unmount clears the pending hold timer', () => {
  const display = setup();
  display.setFrequency(null);
  display.dispose();
  expect(vi.getTimerCount()).toBe(0);
});
