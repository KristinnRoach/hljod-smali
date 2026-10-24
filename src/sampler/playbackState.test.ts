import { afterEach, beforeEach, expect, test, vi } from 'vite-plus/test';
import type { SamplePlayer } from '@kidlib/web-audio';

import { connectPlayback, loopRange, voices } from './playbackState';

let now = 0;
let nextFrame: FrameRequestCallback | undefined;
const requestFrame = vi.fn((callback: FrameRequestCallback) => {
  nextFrame = callback;
  return 1;
});
const cancelFrame = vi.fn();
const flushFrame = (now = 0) => {
  const callback = nextFrame;
  nextFrame = undefined;
  callback?.(now);
};

beforeEach(() => {
  nextFrame = undefined;
  requestFrame.mockClear();
  cancelFrame.mockClear();
  now = 0;
  vi.spyOn(performance, 'now').mockImplementation(() => now);
  vi.stubGlobal('requestAnimationFrame', requestFrame);
  vi.stubGlobal('cancelAnimationFrame', cancelFrame);
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const fakePlayer = () => {
  const handlers = new Map<string, (msg: any) => void>();
  const player = {
    sampleDuration: 2,
    onMessage: (type: string, handler: (msg: any) => void) => {
      handlers.set(type, handler);
      return () => handlers.delete(type);
    },
  } as unknown as SamplePlayer;
  const emit = (type: string, msg: object) => handlers.get(type)?.(msg);
  return { player, emit };
};

test('loopRange follows the newest sounding voice and clears when it stops', () => {
  const { player, emit } = fakePlayer();
  const disconnect = connectPlayback(player);

  emit('voice:started', { voiceId: 'a', midiNote: 60 });
  emit('loop:range', { voiceId: 'a', loopStart: 0, loopEnd: 1 });
  emit('voice:started', { voiceId: 'b', midiNote: 64 });
  emit('loop:range', { voiceId: 'b', loopStart: 1, loopEnd: 2 });
  expect(loopRange()).toEqual({ start: 0.5, end: 1 });

  emit('voice:position', { voiceId: 'b', position: 0.75 });
  flushFrame();
  expect(voices.b?.position).toBe(0.75);

  // Falls back to a voice still sounding, even though it didn't re-post.
  emit('voice:releasing', { voiceId: 'b' });
  emit('voice:stopped', { voiceId: 'b' });
  expect(loopRange()).toEqual({ start: 0, end: 0.5 });

  // Ranges for voices that never started are ignored.
  emit('loop:range', { voiceId: 'x', loopStart: 0, loopEnd: 2 });
  expect(Object.keys(voices)).toEqual(['a']);

  disconnect();
  expect(loopRange()).toBeNull();
});

test('coalesces positions for all voices into one frame using the latest report', () => {
  const { player, emit } = fakePlayer();
  const disconnect = connectPlayback(player);
  emit('voice:started', { voiceId: 'a', midiNote: 60 });
  emit('voice:started', { voiceId: 'b', midiNote: 64 });
  emit('voice:position', { voiceId: 'a', position: 0.1 });
  emit('voice:position', { voiceId: 'a', position: 0.2 });
  emit('voice:position', { voiceId: 'b', position: 0.7 });
  expect(requestFrame).toHaveBeenCalledTimes(1);
  expect(voices.a?.position).toBeUndefined();
  flushFrame();
  expect(voices.a?.position).toBe(0.2);
  expect(voices.b?.position).toBe(0.7);
  disconnect();
});

test('drops pending positions on stop, retrigger, and disconnect', () => {
  const { player, emit } = fakePlayer();
  const disconnect = connectPlayback(player);
  emit('voice:started', { voiceId: 'a', midiNote: 60 });
  emit('voice:position', { voiceId: 'a', position: 0.9 });
  emit('voice:started', { voiceId: 'a', midiNote: 62 });
  flushFrame();
  expect(voices.a?.position).toBeUndefined();
  emit('voice:position', { voiceId: 'a', position: 0.8 });
  emit('voice:stopped', { voiceId: 'a' });
  flushFrame();
  expect(voices.a).toBeUndefined();
  emit('voice:started', { voiceId: 'a', midiNote: 60 });
  emit('voice:position', { voiceId: 'a', position: 0.7 });
  disconnect();
  expect(cancelFrame).toHaveBeenCalledWith(1);
  flushFrame();
  expect(Object.keys(voices)).toEqual([]);
});

test('interpolates forward and reverse reports, then stops scheduling frames', () => {
  const { player, emit } = fakePlayer();
  const disconnect = connectPlayback(player);
  emit('voice:started', { voiceId: 'a', midiNote: 60 });
  emit('voice:position', { voiceId: 'a', position: 0.2 });
  flushFrame();
  now = 20;
  emit('voice:position', { voiceId: 'a', position: 0.4 });
  flushFrame(30);
  expect(voices.a?.position).toBeCloseTo(0.3);
  flushFrame(40);
  expect(voices.a?.position).toBe(0.4);
  expect(nextFrame).toBeUndefined();
  now = 40;
  emit('voice:position', { voiceId: 'a', position: 0.3 });
  flushFrame(40);
  expect(voices.a?.position).toBe(0.3); // reversal snaps
  now = 60;
  emit('voice:position', { voiceId: 'a', position: 0.1 });
  flushFrame(70);
  expect(voices.a?.position).toBeCloseTo(0.2);
  flushFrame(80);
  expect(voices.a?.position).toBeCloseTo(0.1);
  disconnect();
});

test('snaps across loop wraps and after stale reports', () => {
  const { player, emit } = fakePlayer();
  const disconnect = connectPlayback(player);
  emit('voice:started', { voiceId: 'a', midiNote: 60 });
  emit('loop:range', { voiceId: 'a', loopStart: 0.4, loopEnd: 0.8 });
  emit('voice:position', { voiceId: 'a', position: 0.39 });
  flushFrame();
  now = 20;
  emit('voice:position', { voiceId: 'a', position: 0.21 });
  flushFrame(20);
  expect(voices.a?.position).toBe(0.21);
  now = 200;
  emit('voice:position', { voiceId: 'a', position: 0.22 });
  flushFrame(200);
  expect(voices.a?.position).toBe(0.22);
  expect(nextFrame).toBeUndefined();
  disconnect();
});

test.each([false, true])('interpolates the first report after a wrap (reverse: %s)', (reverse) => {
  const { player, emit } = fakePlayer();
  const disconnect = connectPlayback(player);
  const position = (value: number) => (reverse ? 1 - value : value);
  emit('voice:started', { voiceId: 'a', midiNote: 60 });
  emit('voice:position', { voiceId: 'a', position: position(0.95) });
  flushFrame();
  now = 20;
  emit('voice:position', { voiceId: 'a', position: position(0.05) });
  flushFrame(20);
  expect(voices.a?.position).toBeCloseTo(position(0.05));
  now = 40;
  emit('voice:position', { voiceId: 'a', position: position(0.15) });
  flushFrame(50);
  expect(voices.a?.position).toBeCloseTo(position(0.1));
  flushFrame(60);
  expect(voices.a?.position).toBeCloseTo(position(0.15));
  disconnect();
});

test.each([undefined, 0, 0.35])(
  'captures release duration %s and clears it on retrigger',
  (releaseDuration) => {
    const { player, emit } = fakePlayer();
    const disconnect = connectPlayback(player);
    emit('voice:releasing', { voiceId: 'unknown', releaseDuration });
    expect(voices.unknown).toBeUndefined();
    emit('voice:started', { voiceId: 'a', midiNote: 60 });
    emit('voice:releasing', { voiceId: 'a', releaseDuration });
    expect(voices.a?.phase).toBe('releasing');
    expect(voices.a?.releaseDuration).toBe(releaseDuration);
    emit('voice:started', { voiceId: 'a', midiNote: 60 });
    expect(voices.a?.phase).toBe('playing');
    expect(voices.a?.releaseDuration).toBeUndefined();
    disconnect();
  },
);
