// ponytail: temporary shim for the unreleased envelope state API
// (KristinnRoach/web-audio#22). `vp check` types against the published
// @kidlib/web-audio, which does not have these yet; the dev server runs the
// local dist via LOCAL_WEB_AUDIO=1. Delete this file when the package is bumped.
declare module '@kidlib/web-audio' {
  export type SampleEnvelopeType = Extract<EnvelopeType, 'amp-env' | 'pitch-env' | 'filter-env'>;

  export type PointEnvelopeShape = {
    kind: 'points';
    points: EnvelopePoint[];
    valueRange: [number, number];
    sustainIndex: number | null;
    releaseIndex: number;
  };

  export type EnvelopeState = {
    enabled: boolean;
    timeScale: number;
    playbackRateSync: boolean;
    loop: boolean;
    shape: PointEnvelopeShape;
  };

  interface SamplePlayer {
    getEnvelopeState(type: SampleEnvelopeType): EnvelopeState;
    applyEnvelopeState(type: SampleEnvelopeType, state: EnvelopeState): void;
  }
}

export {};
