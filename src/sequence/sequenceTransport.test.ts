import { expect, test, vi } from 'vite-plus/test';

const playSequence = vi.hoisted(() => vi.fn(() => vi.fn()));
vi.mock('@/sampler/samplePlayer', () => ({ getSamplePlayer: () => ({}) }));
vi.mock('@/lib/featureFlag', () => ({ setFeatureFlag: vi.fn() }));
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
