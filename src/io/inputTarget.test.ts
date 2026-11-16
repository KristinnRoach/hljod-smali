import { expect, test, vi } from 'vite-plus/test';
import { createLayeredInput, type InputTarget } from './inputTarget';
import { onNote, playNote, releaseNote } from './noteInput';

const player = (): InputTarget => ({
  play: vi.fn(),
  release: vi.fn(),
  releaseAll: vi.fn(),
  setLoopEnabled: vi.fn(),
  setHoldEnabled: vi.fn(),
  setSustainPedal: vi.fn(),
});

test('layered input plays both players but records each input only once', () => {
  const primary = player();
  const layer = player();
  const target = createLayeredInput(() => [primary, layer]);
  const recorded = vi.fn();
  const unsubscribe = onNote(recorded);
  try {
    playNote(target, 60, 87, 123);
    releaseNote(target, 60, 456);
    for (const current of [primary, layer]) {
      expect(current.play).toHaveBeenCalledWith(60, 87);
      expect(current.release).toHaveBeenCalledWith(60);
    }
    expect(recorded.mock.calls).toEqual([
      [{ note: 60, velocity: 87, time: 123 }],
      [{ note: 60, velocity: 0, time: 456 }],
    ]);
  } finally {
    unsubscribe();
  }
});

test('note-off reaches its original players when the collection changes', () => {
  const original = player();
  const added = player();
  let collection = [original];
  const target = createLayeredInput(() => collection);
  target.play(60);
  collection = [added];
  target.play(62);
  target.play(60, 0);
  expect(original.release).toHaveBeenCalledWith(60);
  expect(added.release).not.toHaveBeenCalled();
  target.releaseAll();
  expect(added.releaseAll).toHaveBeenCalledOnce();
});

test('new layers inherit modifiers without resetting sustain on every note', () => {
  const primary = player();
  const added = player();
  const collection = [primary];
  const target = createLayeredInput(() => collection);
  target.setLoopEnabled(true);
  target.setHoldEnabled(true);
  target.setSustainPedal(true);
  collection.push(added);
  target.play(60);
  expect(added.setLoopEnabled).toHaveBeenLastCalledWith(true);
  expect(added.setHoldEnabled).toHaveBeenLastCalledWith(true);
  expect(added.setSustainPedal).toHaveBeenLastCalledWith(true);
  const loopCalls = vi.mocked(primary.setLoopEnabled).mock.calls.length;
  target.play(62);
  expect(primary.setLoopEnabled).toHaveBeenCalledTimes(loopCalls);
  target.setSustainPedal(false);
  expect(added.setSustainPedal).toHaveBeenLastCalledWith(false);
  target.setHoldEnabled(false);
  target.setLoopEnabled(false);
  expect(added.setHoldEnabled).toHaveBeenLastCalledWith(false);
  expect(added.setLoopEnabled).toHaveBeenLastCalledWith(false);
});

test('overlapping MIDI and keyboard notes at the same pitch each get a release', () => {
  const primary = player();
  const layer = player();
  const target = createLayeredInput(() => [primary, layer]);
  target.play(60, 100);
  target.play(60, 80);
  target.release(60);
  target.release(60);
  expect(primary.release).toHaveBeenCalledTimes(2);
  expect(layer.release).toHaveBeenCalledTimes(2);
});
