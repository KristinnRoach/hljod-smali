import { voices, type VoicePlayback } from './playbackState';
import type { AudioWaveformHighlight } from '@/ui/AudioWaveform';

const BAND_WIDTH = 0.02;

/** A fixed-width playhead in viewport coordinates. */
export const voicePlayheadBand = (
  voice: VoicePlayback,
  visibleSpan: number,
): AudioWaveformHighlight | undefined => {
  if (voice.position === undefined) return;

  const half = (BAND_WIDTH * visibleSpan) / 2;
  return { start: voice.position - half, end: voice.position + half };
};

export const playheadBands = (visibleSpan: number): AudioWaveformHighlight[] =>
  Object.values(voices).flatMap((voice) => {
    const band = voicePlayheadBand(voice, visibleSpan);
    return band ? [band] : [];
  });
