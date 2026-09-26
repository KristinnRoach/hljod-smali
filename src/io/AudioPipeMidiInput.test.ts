import { describe, expect, it, vi } from 'vite-plus/test';
import { AudioPipeMidiInput } from './AudioPipeMidiInput';

const target = () => ({ play: vi.fn(), release: vi.fn() });
const note = (on: boolean, pitch = 60, velocity = 100) => ({
  type: 'midi',
  notes: [{ on, note: pitch, velocity, channel: 1, sampleOffset: 12 }],
});

describe('AudioPipe MIDI input', () => {
  it('plays notes with velocity and releases on note-off or zero velocity', () => {
    const player = target();
    const input = new AudioPipeMidiInput(() => player);
    input.receive(note(true));
    expect(player.play).toHaveBeenCalledWith(60, 100);
    input.receive(note(false));
    input.receive(note(true, 62));
    input.receive(note(true, 62, 0));
    expect(player.release.mock.calls).toEqual([[60], [62]]);
  });

  it('releases only bridge notes on reset and disconnect, including a replaced player', () => {
    const first = target();
    let current = first;
    const input = new AudioPipeMidiInput(() => current);
    input.receive(note(true));
    current = target();
    input.receive(note(true, 62));
    input.receive({ type: 'midi', reset: true });
    expect(first.release).toHaveBeenCalledWith(60);
    expect(current.release).toHaveBeenCalledWith(62);
    input.receive(note(true, 64));
    input.receive(null);
    input.receive(null);
    expect(current.release.mock.calls).toEqual([[62], [64]]);
  });

  it('balances overlapping notes of the same pitch on reset', () => {
    const player = target();
    const input = new AudioPipeMidiInput(() => player);
    input.receive(note(true));
    input.receive(note(true));
    input.receive(note(true));
    input.receive(note(false));
    input.receive(null);
    expect(player.play).toHaveBeenCalledTimes(3);
    expect(player.release.mock.calls).toEqual([[60], [60], [60]]);
  });

  it('ignores malformed messages and missing instruments', () => {
    const player = target();
    const input = new AudioPipeMidiInput(() => player);
    for (const message of [
      undefined,
      {},
      { type: 'stats' },
      note(true, 128),
      note(true, 60, -1),
      { type: 'midi', notes: [null] },
    ])
      input.receive(message);
    expect(player.play).not.toHaveBeenCalled();
    new AudioPipeMidiInput(() => null).receive(note(true));
  });
});
