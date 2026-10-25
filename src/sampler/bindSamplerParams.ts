import { createEffect, type Accessor } from 'solid-js';
import { samplerParams, type SamplePlayer, type SamplerParamKey } from '@kidlib/web-audio';
import { samplerParamValues } from './samplerParamState';

/** Call once in the sampler's Solid owner; effects follow player replacement and disposal. */
export function bindSamplerParams(player: Accessor<SamplePlayer | null>): void {
  for (const key of Object.keys(samplerParams) as SamplerParamKey[]) {
    // Duration derives End; drive/clipping would overwrite the distortion macro.
    if (key === 'loopDuration' || key === 'drive' || key === 'clipping') continue;
    // Loop points are applied together below.
    if (key === 'loopStart' || key === 'loopEnd') continue;
    createEffect(() => {
      const value = samplerParamValues()[key];
      const currentPlayer = player();
      if (currentPlayer) samplerParams[key].apply(currentPlayer, value);
    });
  }

  createEffect(() => {
    const { loopStart, loopEnd } = samplerParamValues();
    const currentPlayer = player();
    if (!currentPlayer) return;
    const duration = currentPlayer.sampleDuration;
    currentPlayer.setLoopPoints(loopStart * duration, loopEnd * duration);
  });
}
