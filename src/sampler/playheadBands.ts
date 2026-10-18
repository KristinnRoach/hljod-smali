import { voices, type VoicePlayback } from './playbackState';
import type { AudioWaveformHighlight } from '@/ui/AudioWaveform';

const BAND_WIDTH = 0.02;
const MAX_TRAIL_WIDTH = 0.15;
const TRAIL_MS = 80;

/** Estimate a visible trail from recent motion, bounded by the playback range. */
export const voicePlayheadBand = (
  voice: VoicePlayback,
  visibleSpan: number,
  looping = false,
): AudioWaveformHighlight | undefined => {
  if (voice.position === undefined) return;
  const loop = voice.loop;
  if (
    looping &&
    loop &&
    loop.end > loop.start &&
    loop.end - loop.start < 0.08 * visibleSpan &&
    voice.position >= loop.start &&
    voice.position <= loop.end
  )
    return { start: loop.start, end: loop.end };
  const half = (BAND_WIDTH * visibleSpan) / 2;
  const head = { start: voice.position - half, end: voice.position + half };
  const motion = voice.motion;
  if (!motion || motion.elapsed <= 0 || motion.elapsed > 100) return head;
  if (motion.delta * motion.previousDelta < 0) return head;
  const range = voice.loop ?? voice.trim ?? { start: 0, end: 1 };
  // Large discontinuities are ambiguous (wrap, seek, or several loop traversals).
  // Omit their trails instead of painting a streak through the loop interior.
  if (Math.abs(motion.delta) > (range.end - range.start) / 2) return head;
  const bounds =
    voice.loop && voice.position >= voice.loop.start && voice.position <= voice.loop.end
      ? voice.loop
      : (voice.trim ?? { start: 0, end: 1 });
  const available =
    motion.delta > 0 ? Math.max(0, head.start - bounds.start) : Math.max(0, bounds.end - head.end);
  const length = Math.min(
    Math.abs(motion.delta) * (TRAIL_MS / motion.elapsed),
    MAX_TRAIL_WIDTH * visibleSpan,
    available,
  );
  if (!length) return head;
  return motion.delta > 0
    ? { start: head.start - length, end: head.end, fadeIn: length / (length + 2 * half) }
    : { start: head.start, end: head.end + length, fadeOut: (2 * half) / (length + 2 * half) };
};

export const playheadBands = (visibleSpan: number, looping = false): AudioWaveformHighlight[] =>
  Object.values(voices).flatMap((voice) => {
    const band = voicePlayheadBand(voice, visibleSpan, looping);
    return band ? [band] : [];
  });
