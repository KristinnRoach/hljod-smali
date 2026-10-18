import { voices } from './playbackState';
import type { AudioWaveformHighlight } from '@/ui/AudioWaveform';

/** Band width as a fraction of the visible range, so it reads the same at any zoom. */
const BAND_WIDTH = 0.015;

/**
 * One band per sounding voice with a known position, in buffer coordinates (0..1).
 * Passed to AudioWaveform `highlights`, which recolors the waveform under each band.
 */
export const playheadBands = (visibleSpan: number): AudioWaveformHighlight[] =>
  Object.values(voices).flatMap((voice) =>
    voice.position === undefined
      ? []
      : [
          {
            start: voice.position - (BAND_WIDTH * visibleSpan) / 2,
            end: voice.position + (BAND_WIDTH * visibleSpan) / 2,
          },
        ],
  );
