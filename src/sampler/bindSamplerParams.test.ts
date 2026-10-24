import { expect, test, vi } from 'vite-plus/test';
import { createRoot, createSignal } from 'solid-js';
import { samplerParams, type SamplePlayer } from '@kidlib/web-audio';
import { bindSamplerParams } from './bindSamplerParams';
import { setSamplerParamValue } from './samplerParamState';

// Exercise client reactivity without rendering controls or starting Web Audio.
vi.mock('solid-js', () => vi.importActual('solid-js/dist/solid.js'));
vi.mock('./samplerParamState', async () => {
  const { createSignal } = await import('solid-js');
  const values: Record<string, number> = {};
  const setters: Record<string, (value: number) => void> = {};
  for (const key of Object.keys(samplerParams)) {
    const [get, set] = createSignal(0);
    Object.defineProperty(values, key, { get });
    setters[key] = set;
  }
  return {
    samplerParamValues: () => values,
    setSamplerParamValue: (key: string, value: number) => setters[key]!(value),
  };
});
vi.mock('@kidlib/web-audio', () => ({
  samplerParams: Object.fromEntries(
    ['volume', 'loopStart', 'loopEnd', 'loopDuration', 'distortion', 'drive', 'clipping'].map(
      (key) => [key, { defaultValue: key === 'loopEnd' ? 1 : 0, apply: vi.fn() }],
    ),
  ),
}));

test('binds state without knobs, follows player replacement, and stops on disposal', () => {
  const createPlayer = () =>
    ({ sampleDuration: 1, setLoopPoints: vi.fn() }) as unknown as SamplePlayer;
  const first = createPlayer();
  const second = createPlayer();
  const [player, setPlayer] = createSignal<SamplePlayer | null>(null);
  let dispose!: () => void;
  createRoot((stop) => {
    dispose = stop;
    bindSamplerParams(player);
  });
  try {
    expect(samplerParams.volume.apply).not.toHaveBeenCalled();
    setPlayer(first);
    expect(samplerParams.volume.apply).toHaveBeenLastCalledWith(first, 0);
    vi.mocked(samplerParams.volume.apply).mockClear();

    setSamplerParamValue('loopStart', 0.6);
    setSamplerParamValue('loopEnd', 0.4);
    setSamplerParamValue('loopDuration', -0.2);
    expect(first.setLoopPoints).toHaveBeenLastCalledWith(0.6, expect.closeTo(0.4));
    expect(samplerParams.loopStart.apply).not.toHaveBeenCalled();
    expect(samplerParams.loopEnd.apply).not.toHaveBeenCalled();
    expect(samplerParams.loopDuration.apply).not.toHaveBeenCalled();
    expect(samplerParams.volume.apply).not.toHaveBeenCalled();

    setSamplerParamValue('drive', 0.5);
    setSamplerParamValue('clipping', 0.5);
    expect(samplerParams.drive.apply).not.toHaveBeenCalled();
    expect(samplerParams.clipping.apply).not.toHaveBeenCalled();

    setPlayer(second);
    expect(second.setLoopPoints).toHaveBeenLastCalledWith(0.6, expect.closeTo(0.4));
    setPlayer(null);
    vi.mocked(samplerParams.volume.apply).mockClear();
    setSamplerParamValue('volume', 0.3);
    expect(samplerParams.volume.apply).not.toHaveBeenCalled();
    setPlayer(second);
    expect(samplerParams.volume.apply).toHaveBeenLastCalledWith(second, 0.3);
  } finally {
    dispose();
  }
  vi.mocked(samplerParams.volume.apply).mockClear();
  setSamplerParamValue('volume', 0.4);
  expect(samplerParams.volume.apply).not.toHaveBeenCalled();
});
