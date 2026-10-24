import { createSignal, onCleanup } from 'solid-js';

type PinchEvent = Event & { scale: number; clientX: number; clientY: number };

export type WaveformRange = { start: number; end: number };

/** Max Zoom: Fewest samples left on screen at full zoom. */
const MIN_VISIBLE_SAMPLES = 384; // ca 8ms at 48kHz - consider using actual samplerate

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

interface WaveformZoomOptions {
  /** Explicit drawing viewport; event targets and listener containers never define coordinates. */
  viewport: () => SVGSVGElement | undefined;
  onChange?: (next: WaveformRange, previous: WaveformRange) => void;
  sampleCount?: () => number | undefined;
}

/** Listen on a container, but measure and hit-test only the explicit waveform viewport. */
export function createWaveformZoom(options: WaveformZoomOptions) {
  const [range, setRange] = createSignal({ start: 0, end: 1 });

  const update = (next: WaveformRange) => {
    const previous = range();
    if (next.start === previous.start && next.end === previous.end) return;
    setRange(next);
    options.onChange?.(next, previous);
  };

  const attach = (element: HTMLElement) => {
    let gestureActive = false;
    let previousScale = 1;
    let gestureSvg: SVGSVGElement | null = null;
    let pan: { pointerId: number; x: number; width: number; range: WaveformRange } | null = null;

    const endPan = () => {
      const pointerId = pan?.pointerId;
      pan = null;
      if (pointerId !== undefined && element.hasPointerCapture(pointerId)) {
        element.releasePointerCapture(pointerId);
      }
    };

    const viewportAt = (clientX: number, clientY: number) => {
      const svg = options.viewport();
      if (!svg || !Number.isFinite(clientX) || !Number.isFinite(clientY)) return null;
      const bounds = svg.getBoundingClientRect();
      return bounds.width > 0 &&
        bounds.height > 0 &&
        clientX >= bounds.left &&
        clientX <= bounds.right &&
        clientY >= bounds.top &&
        clientY <= bounds.bottom
        ? svg
        : null;
    };

    const zoom = (svg: SVGSVGElement, clientX: number, factor: number) => {
      if (!Number.isFinite(factor) || factor <= 0) return;
      const bounds = svg.getBoundingClientRect();
      if (!bounds.width) return;
      const anchor = Math.max(0, Math.min(1, (clientX - bounds.left) / bounds.width));
      update(zoomWaveformRange(range(), anchor, factor, waveformMinSpan(options.sampleCount?.())));
    };

    const pointerDown = (event: PointerEvent) => {
      if (!event.isPrimary) {
        endPan();
        return;
      }
      if (event.button !== 0 || gestureActive || range().end - range().start >= 1) return;
      if (event.target instanceof Element && event.target.closest('[data-point]')) return;
      const svg = viewportAt(event.clientX, event.clientY);
      if (!svg) return;
      pan = {
        pointerId: event.pointerId,
        x: event.clientX,
        width: svg.getBoundingClientRect().width,
        range: range(),
      };
    };
    const pointerMove = (event: PointerEvent) => {
      if (!pan || event.pointerId !== pan.pointerId) return;
      if (!(event.buttons & 1)) {
        endPan();
        return;
      }
      // Leave clicks on their original target; capture only once a drag starts.
      if (!element.hasPointerCapture(event.pointerId)) {
        if (Math.abs(event.clientX - pan.x) < 4) return;
        element.setPointerCapture(event.pointerId);
      }
      const span = pan.range.end - pan.range.start;
      const shift = ((event.clientX - pan.x) / pan.width) * span;
      const start = Math.max(0, Math.min(1 - span, pan.range.start - shift));
      update({ start, end: start + span });
    };
    const pointerEnd = (event: PointerEvent) => {
      if (event.pointerId === pan?.pointerId) endPan();
    };
    const lostPointerCapture = (event: PointerEvent) => {
      if (event.target === element) pointerEnd(event);
    };

    const wheel = (event: WheelEvent) => {
      const svg = viewportAt(event.clientX, event.clientY);
      if (!svg) return;
      if (!event.ctrlKey) {
        const current = range();
        const span = current.end - current.start;
        if (span >= 1 || !event.deltaX) return;
        event.preventDefault();
        if (gestureActive) return;
        endPan();
        const width = svg.getBoundingClientRect().width;
        const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? width : 1;
        const start = Math.max(
          0,
          Math.min(1 - span, current.start + ((event.deltaX * unit) / width) * span),
        );
        update({ start, end: start + span });
        return;
      }
      event.preventDefault();
      if (gestureActive) return;
      endPan();
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? svg.clientHeight : 1;
      zoom(svg, event.clientX, Math.exp(event.deltaY * unit * 0.01));
    };
    const gestureStart = (event: Event) => {
      const pinch = event as PinchEvent;
      gestureSvg = viewportAt(pinch.clientX, pinch.clientY);
      if (!gestureSvg) return;
      endPan();
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

    element.addEventListener('pointerdown', pointerDown);
    element.addEventListener('pointermove', pointerMove);
    element.addEventListener('pointerup', pointerEnd);
    element.addEventListener('pointercancel', pointerEnd);
    element.addEventListener('lostpointercapture', lostPointerCapture);
    element.addEventListener('wheel', wheel, { passive: false });
    element.addEventListener('gesturestart', gestureStart, { passive: false });
    element.addEventListener('gesturechange', gestureChange, { passive: false });
    element.addEventListener('gestureend', gestureEnd, { passive: false });
    onCleanup(() => {
      endPan();
      element.removeEventListener('pointerdown', pointerDown);
      element.removeEventListener('pointermove', pointerMove);
      element.removeEventListener('pointerup', pointerEnd);
      element.removeEventListener('pointercancel', pointerEnd);
      element.removeEventListener('lostpointercapture', lostPointerCapture);
      element.removeEventListener('wheel', wheel);
      element.removeEventListener('gesturestart', gestureStart);
      element.removeEventListener('gesturechange', gestureChange);
      element.removeEventListener('gestureend', gestureEnd);
    });
  };

  return {
    range,
    attach,
    reset: () => update({ start: 0, end: 1 }),
    /** New buffers start in full view without remapping their playback points. */
    resetViewport: () => setRange({ start: 0, end: 1 }),
  };
}
