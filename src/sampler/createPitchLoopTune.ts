import {
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  untrack,
  type Accessor,
} from 'solid-js';
import type { SamplePlayer } from '@kidlib/web-audio';
import { samplerParamValues, restoreSamplerParamValues } from './samplerParamState';

/** Draft UI policy: tuning selects Duration's floor; the player still receives loop points. */
export function createPitchLoopTune(player: Accessor<SamplePlayer | null>) {
  const [periods, setPeriods] = createSignal<number[]>([]);
  const [index, setIndex] = createSignal(0);
  const [sampleDuration, setSampleDuration] = createSignal(0);

  createEffect(() => {
    const current = player();
    // Longest first so turning Tune up raises the pitch. Defaults are C1–C5.
    setPeriods(current?.getLoopPitchPeriods().reverse() ?? []);
    setSampleDuration(current?.sampleDuration ?? 0);
    if (!current) return;
    onCleanup(current.onMessage('sample:loaded', () => setSampleDuration(current.sampleDuration)));
  });

  const period = createMemo(() => periods()[index()] ?? 0);
  const minimum = createMemo(() =>
    sampleDuration() > 0 ? Math.min(1, period() / sampleDuration()) : 0,
  );
  let previousMinimum = 0;
  createEffect(() => {
    const next = minimum();
    const { loopDuration, loopStart } = samplerParamValues();
    // Follow tuning while parked at the floor, or lift a duration below the new floor.
    const followsFloor = Math.abs(loopDuration - previousMinimum) < 1e-12;
    const changed = next !== previousMinimum;
    previousMinimum = next;
    if (loopDuration < next || (changed && followsFloor)) {
      const start = Math.min(loopStart, 1 - next);
      untrack(() => restoreSamplerParamValues({ loopStart: start, loopEnd: start + next }));
    }
  });

  return { periods, index, setIndex, period, minimum };
}
