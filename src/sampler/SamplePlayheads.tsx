import { createEffect, onCleanup, onMount, type Component } from 'solid-js';

import { voices } from './playbackState';
import styles from './SamplePlayheads.module.css';

export const noteAppearance = (midiNote: number) => ({
  y: 80 - (Math.max(0, Math.min(127, midiNote)) / 127) * 60,
  color: `hsl(${(midiNote % 12) * 30} 80% 65%)`,
});

const DOT_RADIUS = 4;
const DEFAULT_TRANSITION_MS = 100;
const TRAIL_DECAY_MS = 45;
const TRAIL_CLEAR_MS = 260;
const MAX_CONNECT_SPAN = 0.35;
const FALLBACK_COLOR = 'rgb(240, 150, 40)';

/** Frame-rate-independent alpha for destination-out canvas fading. */
export const trailFadeAlpha = (dtMs: number, decayMs = TRAIL_DECAY_MS): number =>
  dtMs <= 0 ? 0 : 1 - Math.exp(-dtMs / decayMs);

/** True when two normalized viewport positions should be bridged with a continuous stroke. */
export const shouldConnectPositions = (prevX: number | undefined, nextX: number): boolean =>
  prevX !== undefined && Math.abs(nextX - prevX) <= MAX_CONNECT_SPAN;

type VoiceVisual = {
  prevX?: number;
  bornAt: number;
  releasedAt?: number;
  releaseStartScale: number;
};

/** Independent of waveform drawing; positions use the current visible sample range. */
const SamplePlayheads: Component<{
  start: number;
  end: number;
  distinguishVoices?: boolean;
}> = (props) => {
  let canvas!: HTMLCanvasElement;
  let width = 0;
  let height = 0;
  let dpr = 1;
  let defaultColor = FALLBACK_COLOR;
  let frame: number | undefined;
  let lastTick = 0;
  let idleSince: number | undefined;
  const visuals = new Map<string, VoiceVisual>();

  const reducedMotion = () =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const clearCanvas = () => {
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  };

  const syncSize = () => {
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));

    const computed = getComputedStyle(canvas);
    defaultColor =
      computed.getPropertyValue('--playhead-color').trim() ||
      computed.getPropertyValue('--audio-waveform-highlight-color').trim() ||
      FALLBACK_COLOR;
  };

  const draw = (now: number) => {
    frame = undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx || width <= 0 || height <= 0) return;

    const dt = lastTick ? Math.min(now - lastTick, 100) : 16.67;
    lastTick = now;

    const entries = Object.entries(voices);
    const activeIds = new Set<string>();
    const noMotion = reducedMotion();

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (noMotion) {
      ctx.clearRect(0, 0, width, height);
    } else {
      const fade = trailFadeAlpha(dt);
      if (fade > 0) {
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = `rgba(0, 0, 0, ${fade})`;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      }
    }

    const span = props.end - props.start;

    for (const [voiceId, voice] of entries) {
      activeIds.add(voiceId);
      if (voice.position === undefined || span <= 0) continue;

      let visual = visuals.get(voiceId);
      if (!visual) {
        visual = { bornAt: now, releaseStartScale: 1 };
        visuals.set(voiceId, visual);
      }

      let scale = 1;
      if (!noMotion) {
        const attackScale = Math.min(1, (now - visual.bornAt) / DEFAULT_TRANSITION_MS);
        if (voice.phase === 'releasing') {
          if (visual.releasedAt === undefined) {
            visual.releasedAt = now;
            visual.releaseStartScale = attackScale;
          }
          const releaseMs =
            voice.releaseDuration !== undefined
              ? voice.releaseDuration * 1000
              : DEFAULT_TRANSITION_MS;
          const releaseProgress =
            releaseMs > 0 ? Math.min(1, (now - visual.releasedAt) / releaseMs) : 1;
          scale = visual.releaseStartScale * (1 - releaseProgress);
        } else {
          scale = attackScale;
        }
      }

      const nx = (voice.position - props.start) / span;
      const cx = nx * width;
      const appearance = props.distinguishVoices ? noteAppearance(voice.midiNote) : undefined;
      const cy = ((appearance ? appearance.y : 50) / 100) * height;
      const color = appearance?.color ?? defaultColor;

      if (scale > 0.01) {
        if (!noMotion && shouldConnectPositions(visual.prevX, nx)) {
          ctx.save();
          ctx.strokeStyle = color;
          ctx.globalAlpha = 0.75 * scale;
          ctx.lineWidth = DOT_RADIUS * 1.5 * scale;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(visual.prevX! * width, cy);
          ctx.lineTo(cx, cy);
          ctx.stroke();
          ctx.restore();
        }

        const radius = DOT_RADIUS * scale;
        ctx.save();
        ctx.fillStyle = color;
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      visual.prevX = nx;
    }

    for (const id of visuals.keys()) {
      if (!activeIds.has(id)) visuals.delete(id);
    }

    if (entries.length > 0) {
      idleSince = undefined;
      frame = requestAnimationFrame(draw);
    } else if (!noMotion) {
      idleSince ??= now;
      if (now - idleSince < TRAIL_CLEAR_MS) {
        frame = requestAnimationFrame(draw);
      } else {
        clearCanvas();
        lastTick = 0;
        idleSince = undefined;
      }
    } else {
      lastTick = 0;
      idleSince = undefined;
    }
  };

  const ensureRunning = () => {
    if (frame === undefined) {
      lastTick = 0;
      frame = requestAnimationFrame(draw);
    }
  };

  // Clear stale trail pixels when the visible zoom window changes.
  createEffect(() => {
    void props.start;
    void props.end;
    for (const visual of visuals.values()) visual.prevX = undefined;
    clearCanvas();
  });

  // Wake the rAF loop whenever at least one voice is active.
  createEffect(() => {
    if (Object.keys(voices).length > 0) {
      idleSince = undefined;
      ensureRunning();
    }
  });

  onMount(() => {
    syncSize();
    const observer = new ResizeObserver(syncSize);
    observer.observe(canvas);
    onCleanup(() => {
      observer.disconnect();
      if (frame !== undefined) cancelAnimationFrame(frame);
    });
  });

  return <canvas ref={canvas} class={styles.playheads} aria-hidden="true" />;
};

export default SamplePlayheads;
