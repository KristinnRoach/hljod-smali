import { expect, test } from 'vite-plus/test';
import { createRoot } from 'solid-js';

import { createWaveformZoom, waveformMinSpan, zoomWaveformRange } from './createWaveformZoom';

test('zoom keeps the buffer position under the pointer fixed', () => {
  const current = { start: 0.2, end: 0.8 };
  const anchor = 0.25;
  const next = zoomWaveformRange(current, anchor, 0.5);

  expect(next.end - next.start).toBeCloseTo(0.3);
  expect(next.start + anchor * (next.end - next.start)).toBeCloseTo(0.35);
  expect(zoomWaveformRange(next, anchor, 2)).toEqual(current);
});

test('zoom is bounded at the sample edges and at 100×', () => {
  expect(zoomWaveformRange({ start: 0.8, end: 1 }, 1, 10)).toEqual({ start: 0, end: 1 });
  const next = zoomWaveformRange({ start: 0, end: 1 }, 0, 0.0001);
  expect(next).toEqual({ start: 0, end: 0.01 });
});

test('zoom stops when the minimum span is visible', () => {
  const minSpan = waveformMinSpan(24_000);
  const next = zoomWaveformRange({ start: 0, end: 1 }, 0, 1e-9, minSpan);
  expect(next.end - next.start).toBe(minSpan);
  expect(waveformMinSpan(10)).toBe(1);
});

test('invalid gesture values leave the range unchanged', () => {
  const current = { start: 0, end: 1 };
  for (const factor of [0, -1, NaN, Infinity]) {
    expect(zoomWaveformRange(current, 0.5, factor)).toBe(current);
  }
  expect(zoomWaveformRange(current, NaN, 0.5)).toBe(current);
});

const viewport = {
  getBoundingClientRect: () => ({
    left: 100,
    right: 300,
    top: 50,
    bottom: 150,
    width: 200,
    height: 100,
  }),
} as SVGSVGElement;

const wheel = (clientX: number, clientY: number, ctrlKey = true) =>
  Object.assign(new Event('wheel', { cancelable: true }), {
    clientX,
    clientY,
    ctrlKey,
    deltaMode: 0,
    deltaY: Math.log(0.5) / 0.01,
  });

test('the explicit viewport anchors zoom even when the listener receives the event', () => {
  createRoot((dispose) => {
    const host = new EventTarget();
    const changes: Array<[number, number]> = [];
    const zoom = createWaveformZoom({
      viewport: () => viewport,
      onChange: (next) => changes.push([next.start, next.end]),
    });
    zoom.attach(host as HTMLElement);
    const event = wheel(150, 100);
    host.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(zoom.range()).toEqual({ start: 0.125, end: 0.625 });
    expect(changes).toEqual([[0.125, 0.625]]);

    dispose();
    host.dispatchEvent(wheel(150, 100));
    expect(changes).toHaveLength(1);
  });
});

test('container padding, ordinary scrolling and an absent viewport cannot change playback', () => {
  createRoot((dispose) => {
    const host = new EventTarget();
    let activeViewport: SVGSVGElement | undefined = viewport;
    const zoom = createWaveformZoom({ viewport: () => activeViewport });
    zoom.attach(host as HTMLElement);
    for (const event of [wheel(90, 100), wheel(150, 40), wheel(150, 100, false)]) {
      host.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(false);
    }
    activeViewport = undefined;
    const event = wheel(150, 100);
    host.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
    expect(zoom.range()).toEqual({ start: 0, end: 1 });
    dispose();
  });
});

test('Safari gestures use the same explicit viewport and suppress duplicate wheel zoom', () => {
  createRoot((dispose) => {
    const host = new EventTarget();
    const zoom = createWaveformZoom({ viewport: () => viewport });
    zoom.attach(host as HTMLElement);
    const gesture = (type: string, scale: number) =>
      Object.assign(new Event(type, { cancelable: true }), { clientX: 150, clientY: 100, scale });
    host.dispatchEvent(gesture('gesturestart', 1));
    host.dispatchEvent(gesture('gesturechange', 2));
    host.dispatchEvent(wheel(150, 100));
    expect(zoom.range()).toEqual({ start: 0.125, end: 0.625 });
    host.dispatchEvent(gesture('gestureend', 2));
    dispose();
  });
});
