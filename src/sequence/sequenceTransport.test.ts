import { expect, test, vi } from 'vite-plus/test';

const playSequence = vi.hoisted(() => vi.fn(() => vi.fn()));
vi.mock('@/sampler/samplePlayer', () => ({ getSamplePlayer: () => ({}) }));
vi.mock('./sequence', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./sequence')>()),
  playSequence,
}));

const midi = new Uint8Array([
  0x4d, 0x54, 0x68, 0x64, 0, 0, 0, 6, 0, 0, 0, 1, 0, 0x60, 0x4d, 0x54, 0x72, 0x6b, 0, 0, 0, 8, 0,
  0x90, 0x3c, 0x64, 0x60, 0x80, 0x3c, 0,
]).buffer;

function pendingFile() {
  let resolve!: (data: ArrayBuffer) => void;
  const file = { arrayBuffer: () => new Promise<ArrayBuffer>((done) => (resolve = done)) } as Blob;
  return { file, resolve: () => resolve(midi) };
}

test('the console shares playMidiFile, which defaults to the example and stops with null', async () => {
  const consoleWindow = {};
  vi.stubGlobal('window', consoleWindow);
  vi.resetModules();
  const { playMidiFile, EXAMPLE_MIDI_URL, sequenceMode } = await import('./sequenceTransport');
  const fetchMidi = vi.fn(async () => ({ ok: true, arrayBuffer: async () => midi }));
  vi.stubGlobal('fetch', fetchMidi);
  try {
    expect(consoleWindow).toEqual({ playMidiFile });
    await playMidiFile();
    expect(fetchMidi).toHaveBeenCalledWith(EXAMPLE_MIDI_URL);
    expect(sequenceMode()).toBe('playing');
    expect(await playMidiFile(null)).toBe('Stopped.');
    expect(sequenceMode()).toBe('idle');
  } finally {
    vi.unstubAllGlobals();
  }
});

test('Stop cancels a pending MIDI load', async () => {
  vi.stubGlobal('window', {});
  const { playMidiFile, stopSequence } = await import('./sequenceTransport');
  playSequence.mockClear();

  const pending = pendingFile();
  const result = playMidiFile(pending.file);
  stopSequence();
  pending.resolve();

  expect(await result).toBe('MIDI load cancelled.');
  expect(playSequence).not.toHaveBeenCalled();
});

test('a newer MIDI load supersedes a pending one', async () => {
  vi.stubGlobal('window', {});
  const { playMidiFile, stopSequence } = await import('./sequenceTransport');
  playSequence.mockClear();

  const first = pendingFile();
  const second = pendingFile();
  const firstResult = playMidiFile(first.file);
  const secondResult = playMidiFile(second.file);
  second.resolve();
  await secondResult;
  first.resolve();

  expect(await firstResult).toBe('MIDI load cancelled.');
  expect(playSequence).toHaveBeenCalledOnce();
  stopSequence();
});

test('a superseded URL failure returns cancellation', async () => {
  vi.stubGlobal('window', {});
  const { playMidiFile, stopSequence } = await import('./sequenceTransport');
  let reject!: (error: Error) => void;
  vi.stubGlobal('fetch', () => new Promise<Response>((_resolve, fail) => (reject = fail)));

  const result = playMidiFile('/missing.mid');
  stopSequence();
  reject(new Error('Network failure'));

  await expect(result).resolves.toBe('MIDI load cancelled.');
  vi.unstubAllGlobals();
});

test('the current URL failure retains its error', async () => {
  vi.stubGlobal('window', {});
  const { playMidiFile } = await import('./sequenceTransport');
  const failure = new Error('Network failure');
  vi.stubGlobal('fetch', () => Promise.reject(failure));

  await expect(playMidiFile('/missing.mid')).rejects.toBe(failure);
  vi.unstubAllGlobals();
});

test.each([
  ['no positive-velocity notes', 23, 0x80],
  ['zero duration', 26, 0],
])('does not start playback for a MIDI file with %s', async (_case, offset, value) => {
  vi.stubGlobal('window', {});
  const { playMidiFile, sequenceMode } = await import('./sequenceTransport');
  playSequence.mockClear();
  const data = new Uint8Array(midi.slice(0));
  data[offset] = value;

  await expect(playMidiFile(new Blob([data]))).rejects.toThrow('The MIDI file has no notes.');
  expect(playSequence).not.toHaveBeenCalled();
  expect(sequenceMode()).toBe('idle');
});
