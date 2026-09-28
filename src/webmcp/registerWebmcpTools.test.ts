import { expect, test, vi } from 'vite-plus/test';

vi.mock('@kidlib/web-audio', () => ({ samplerParams: {} }));
vi.mock('@/audio-pipe/audioPipeSwitches', () => ({ enableAudioPipe: vi.fn() }));
vi.mock('@/io/noteInput', () => ({ playNote: vi.fn() }));
vi.mock('@/sampler/samplePlayer', () => ({ getSamplePlayer: vi.fn() }));
vi.mock('@/sampler/samplerParamState', () => ({
  samplerParamValues: vi.fn(),
  setSamplerParamValue: vi.fn(),
}));
vi.mock('@/sequence/sequenceTransport', () => ({
  EXAMPLE_MIDI_URL: '/example.mid',
  playMidiFile: vi.fn(),
  stopSequence: vi.fn(),
}));

const store = new Map<string, string>();
const tools = new Map<string, { execute: (input: { name: string; on: boolean }) => string }>();
Object.assign(globalThis, {
  window: globalThis,
  localStorage: {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
  },
  document: {
    modelContext: {
      registerTool: (tool: {
        name: string;
        execute: (input: { name: string; on: boolean }) => string;
      }) => {
        tools.set(tool.name, tool);
        return Promise.resolve();
      },
    },
  },
});

const { featureFlag } = await import('@/lib/featureFlag');
const { registerWebmcpTools } = await import('./registerWebmcpTools');
const audioPipeShown = featureFlag('audiopipe', 'Ableton (AudioPipe) output');

test('set_feature_flag accepts false for AudioPipe', () => {
  registerWebmcpTools(() => ({}));
  const setFlag = tools.get('set_feature_flag')!;

  expect(setFlag.execute({ name: 'audiopipe', on: true })).toBe('Ableton (AudioPipe) output on.');
  expect(setFlag.execute({ name: 'audiopipe', on: false })).toBe('Ableton (AudioPipe) output off.');
  expect(audioPipeShown()).toBe(false);
  expect(store.get('flag:audiopipe')).toBe('0');
});
