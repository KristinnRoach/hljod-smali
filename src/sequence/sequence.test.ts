import { expect, test, vi } from 'vite-plus/test';

import { playNote, releaseNote } from '@/io/noteInput';
import { playSequence, recordSequence } from './sequence';

test('recordSequence hears every source, orders by source time and closes held notes', () => {
  const target = { play: () => {}, release: () => {} };
  const stop = recordSequence();
  releaseNote(target, 64, 900); // released before the first note-on: not part of it
  playNote(target, 60, 100, 1000);
  playNote(target, 62, 90, 1300);
  releaseNote(target, 60, 1200); // arrives after a later-stamped event
  vi.spyOn(performance, 'now').mockReturnValue(2000);
  const sequence = stop();
  vi.restoreAllMocks();

  expect(sequence).toEqual({
    length: 1,
    events: [
      { time: 0, note: 60, velocity: 100 },
      { time: 0.2, note: 60, velocity: 0 },
      { time: 0.3, note: 62, velocity: 90 },
      { time: 1, note: 62, velocity: 0 },
    ],
  });
});

test('playSequence schedules ahead on the audio clock and wraps the loop', () => {
  vi.useFakeTimers();
  const calls: string[] = [];
  const player = {
    context: { currentTime: 0 },
    play: (note: number, _v?: number, _g?: number, secondsFromNow = 0) => {
      calls.push(`play ${note} +${secondsFromNow.toFixed(2)}`);
      return note;
    },
    release: (note: number, secondsFromNow = 0) => {
      calls.push(`release ${note} +${secondsFromNow.toFixed(2)}`);
      return player as never;
    },
    releaseAll: () => player as never,
  };
  const at = (seconds: number) => {
    player.context.currentTime = seconds;
    vi.advanceTimersByTime(25);
  };

  const stop = playSequence(player, {
    events: [
      { time: 0, note: 60, velocity: 100 },
      { time: 0.5, note: 60, velocity: 0 },
    ],
    length: 1,
  });
  at(0.3); // nothing inside the lookahead yet
  at(0.45);
  at(0.95);
  stop();
  vi.useRealTimers();

  expect(calls).toEqual(['play 60 +0.00', 'release 60 +0.05', 'play 60 +0.05']);
});

test('playSequence drops note-ons missed during a stall but still sends their note-offs', () => {
  vi.useFakeTimers();
  const calls: string[] = [];
  const player = {
    context: { currentTime: 0 },
    play: (note: number, _v?: number, _g?: number, secondsFromNow = 0) => {
      calls.push(`play ${note} +${secondsFromNow.toFixed(2)}`);
      return note;
    },
    release: (note: number, secondsFromNow = 0) => {
      calls.push(`release ${note} +${secondsFromNow.toFixed(2)}`);
      return player as never;
    },
    releaseAll: () => player as never,
  };
  const at = (seconds: number) => {
    player.context.currentTime = seconds;
    vi.advanceTimersByTime(25);
  };

  const stop = playSequence(player, {
    events: [
      { time: 0, note: 60, velocity: 100 },
      { time: 0.5, note: 60, velocity: 0 },
    ],
    length: 1,
  });
  at(2.2); // stalled through the first release, the note at 1 and the note at 2
  at(2.95);
  stop();
  vi.useRealTimers();

  expect(calls).toEqual([
    'play 60 +0.00',
    'release 60 +0.00',
    'release 60 +0.00',
    'release 60 +0.00',
    'play 60 +0.05',
  ]);
});
