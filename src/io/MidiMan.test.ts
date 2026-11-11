import { expect, test, vi } from 'vite-plus/test';
import type { NoteEvent } from '@kidlib/web-audio/io';
import { createLayeredInput, type InputTarget } from './inputTarget';

const midi = vi.hoisted(() => ({
  init: vi.fn(async () => true),
  onNoteOn: vi.fn((_handler: (event: NoteEvent) => void) => vi.fn()),
  onNoteOff: vi.fn((_handler: (event: NoteEvent) => void) => vi.fn()),
  registerSustainPedalTarget: vi.fn(
    (_target: { setSustainPedal: (pressed: boolean) => void }, _channel: number | 'all') => vi.fn(),
  ),
}));
vi.mock('@kidlib/web-audio/io', () => ({ inputController: midi }));

import {
  enableSamplePlayerMidi,
  disableSamplePlayerMidi,
  setSamplePlayerMidiInputChannel,
} from './MidiMan';

test('MIDI routes notes, velocity and sustain to every layer, respecting the channel', async () => {
  vi.stubGlobal('document', {
    querySelectorAll: () => [],
    querySelector: () => null,
    body: { classList: { remove: vi.fn() } },
  });
  const player = (): InputTarget => ({
    play: vi.fn(),
    release: vi.fn(),
    releaseAll: vi.fn(),
    setLoopEnabled: vi.fn(),
    setHoldEnabled: vi.fn(),
    setSustainPedal: vi.fn(),
  });
  const primary = player();
  const layer = player();
  const target = createLayeredInput(() => [primary, layer]);
  try {
    expect(await enableSamplePlayerMidi({ getSamplePlayer: () => target, inputChannel: 2 })).toBe(
      true,
    );
    const noteOn = midi.onNoteOn.mock.calls[0][0];
    const noteOff = midi.onNoteOff.mock.calls[0][0];
    const sustain = midi.registerSustainPedalTarget.mock.calls[0];
    expect(sustain[1]).toBe(2);
    noteOn({ type: 'noteon', note: 60, velocity: 90, channel: 1, raw: { timestamp: 123 } });
    expect(primary.play).not.toHaveBeenCalled();
    noteOn({ type: 'noteon', note: 60, velocity: 90, channel: 2, raw: { timestamp: 123 } });
    sustain[0].setSustainPedal(true);
    noteOff({ type: 'noteoff', note: 60, velocity: 0, channel: 2, raw: { timestamp: 456 } });
    for (const current of [primary, layer]) {
      expect(current.play).toHaveBeenCalledWith(60, 90);
      expect(current.release).toHaveBeenCalledWith(60);
      expect(current.setSustainPedal).toHaveBeenLastCalledWith(true);
    }
    setSamplePlayerMidiInputChannel(3);
    for (const current of [primary, layer]) {
      expect(current.releaseAll).toHaveBeenCalledOnce();
      expect(current.setSustainPedal).toHaveBeenLastCalledWith(false);
    }
  } finally {
    disableSamplePlayerMidi();
    vi.unstubAllGlobals();
  }
});
