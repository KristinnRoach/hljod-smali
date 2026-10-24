import { expect, test, vi } from 'vite-plus/test';

vi.mock('@kidlib/web-audio', () => ({
  samplerParams: Object.fromEntries(
    ['trimStart', 'trimEnd', 'loopStart', 'loopEnd'].map((key) => [key, { min: 0, max: 1 }]),
  ),
}));
vi.mock('@/audio-pipe/audioPipeSwitches', () => ({ enableAudioPipe: vi.fn() }));
vi.mock('@/io/noteInput', () => ({ playNote: vi.fn() }));
vi.mock('@/sampler/samplePlayer', () => ({ getSamplePlayer: vi.fn() }));
vi.mock('@/sampler/samplerParamState', () => ({
  samplerParamValues: vi.fn(() => ({
    trimStart: 0.8,
    trimEnd: 0.2,
    loopStart: 0.8,
    loopEnd: 0.2,
  })),
  setSamplerParamValue: vi.fn(),
}));
vi.mock('@/sequence/sequenceTransport', () => ({
  EXAMPLE_MIDI_URL: '/example.mid',
  playMidiFile: vi.fn(),
  stopSequence: vi.fn(),
}));

const store = new Map<string, string>();
type ToolInput = { name: string; on: boolean } | { param: string; value: number };
const tools = new Map<string, { execute: (input: ToolInput) => string }>();
Object.assign(globalThis, {
  window: globalThis,
  localStorage: {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
  },
  document: {
    modelContext: {
      registerTool: (tool: { name: string; execute: (input: ToolInput) => string }) => {
        tools.set(tool.name, tool);
        return Promise.resolve();
      },
    },
  },
});

test('list_feature_flags returns current flag values', () => {
  registerWebmcpTools(() => ({}));
  const setFlag = tools.get('set_feature_flag')!;
  const list = tools.get('list_feature_flags')!;
  for (const on of [true, false]) {
    setFlag.execute({ name: 'audiopipe', on });
    expect(JSON.parse(list.execute({ name: 'audiopipe', on }))).toEqual([
      { name: 'audiopipe', label: 'Ableton (AudioPipe) output', on },
    ]);
  }
});

const { featureFlag } = await import('@/lib/featureFlag');
const { registerWebmcpTools } = await import('./registerWebmcpTools');
const { setSamplerParamValue } = await import('@/sampler/samplerParamState');
const audioPipeShown = featureFlag('audiopipe', 'Ableton (AudioPipe) output');

test('set_feature_flag accepts false for AudioPipe', () => {
  registerWebmcpTools(() => ({}));
  const setFlag = tools.get('set_feature_flag')!;

  expect(setFlag.execute({ name: 'audiopipe', on: true })).toBe('Ableton (AudioPipe) output on.');
  expect(setFlag.execute({ name: 'audiopipe', on: false })).toBe('Ableton (AudioPipe) output off.');
  expect(audioPipeShown()).toBe(false);
  expect(store.get('flag:audiopipe')).toBe('0');
});

test('sample points accept crossed ranges while retaining descriptor limits', () => {
  registerWebmcpTools(() => ({}));
  const setParam = tools.get('set_sampler_param')!;

  for (const param of ['trimStart', 'trimEnd', 'loopStart', 'loopEnd']) {
    expect(() => setParam.execute({ param, value: 0.5 })).not.toThrow();
    expect(setSamplerParamValue).toHaveBeenCalledWith(param, 0.5);
    for (const value of [-0.1, 1.1, NaN, Infinity]) {
      expect(() => setParam.execute({ param, value })).toThrow(`${param} must be in 0..1.`);
    }
  }
});
