import { createSignal, onCleanup } from 'solid-js';

type PinchEvent = Event & { scale: number; clientX: number };

export type WaveformRange = { start: number; end: number };

/** Fewest samples left on screen at full zoom. */
const MIN_VISIBLE_SAMPLES = 32;

/** Smallest normalized span that keeps MIN_VISIBLE_SAMPLES visible; 100× without a buffer. */
export const waveformMinSpan = (sampleCount?: number) =>
  sampleCount ? Math.min(1, MIN_VISIBLE_SAMPLES / sampleCount) : 1 / 100;

/** Scale a range around a relative viewport position, no narrower than minSpan. */
export function zoomWaveformRange(
  current: WaveformRange,
  anchor: number,
  factor: number,
  minSpan = waveformMinSpan(),
) {
  if (!Number.isFinite(anchor) || !Number.isFinite(factor) || factor <= 0) return current;
  anchor = Math.max(0, Math.min(1, anchor));
  const span = current.end - current.start;
  const nextSpan = Math.max(minSpan, Math.min(1, span * factor));
  const position = current.start + anchor * span;
  const start = Math.max(0, Math.min(1 - nextSpan, position - anchor * nextSpan));
  return { start, end: start + nextSpan };
}

/** Attach to a container; pinch over its SVG content changes a normalized range. */
export function createWaveformZoom(
  onChange?: (next: WaveformRange, previous: WaveformRange) => void,
  sampleCount?: () => number | undefined,
) {
  const [range, setRange] = createSignal({ start: 0, end: 1 });

  const update = (next: WaveformRange) => {
    const previous = range();
    if (next.start === previous.start && next.end === previous.end) return;
    setRange(next);
    onChange?.(next, previous);
  };

  const attach = (element: HTMLElement) => {
    let gestureActive = false;
    let previousScale = 1;
    let gestureSvg: SVGSVGElement | null = null;

    const svgFromEvent = (event: Event) =>
      event.target instanceof Element ? event.target.closest('svg') : null;

    const zoom = (svg: SVGSVGElement, clientX: number, factor: number) => {
      if (!Number.isFinite(factor) || factor <= 0) return;
      const bounds = svg.getBoundingClientRect();
      if (!bounds.width) return;
      const anchor = Math.max(0, Math.min(1, (clientX - bounds.left) / bounds.width));
      update(zoomWaveformRange(range(), anchor, factor, waveformMinSpan(sampleCount?.())));
    };

    const wheel = (event: WheelEvent) => {
      const svg = svgFromEvent(event);
      if (!event.ctrlKey || !svg) return;
      event.preventDefault();
      if (gestureActive) return;
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? svg.clientHeight : 1;
      zoom(svg, event.clientX, Math.exp(event.deltaY * unit * 0.01));
    };
    const gestureStart = (event: Event) => {
      gestureSvg = svgFromEvent(event);
      if (!gestureSvg) return;
      event.preventDefault();
      gestureActive = true;
      previousScale = 1;
    };
    const gestureChange = (event: Event) => {
      if (!gestureActive || !gestureSvg) return;
      event.preventDefault();
      const pinch = event as PinchEvent;
      if (!Number.isFinite(pinch.scale) || pinch.scale <= 0) return;
      zoom(gestureSvg, pinch.clientX, previousScale / pinch.scale);
      previousScale = pinch.scale;
    };
    const gestureEnd = (event: Event) => {
      if (gestureActive) event.preventDefault();
      gestureActive = false;
      gestureSvg = null;
    };

    element.addEventListener('wheel', wheel, { passive: false });
    element.addEventListener('gesturestart', gestureStart, { passive: false });
    element.addEventListener('gesturechange', gestureChange, { passive: false });
    element.addEventListener('gestureend', gestureEnd, { passive: false });
    onCleanup(() => {
      element.removeEventListener('wheel', wheel);
      element.removeEventListener('gesturestart', gestureStart);
      element.removeEventListener('gesturechange', gestureChange);
      element.removeEventListener('gestureend', gestureEnd);
    });
  };

  return { range, attach, reset: () => update({ start: 0, end: 1 }) };
}
