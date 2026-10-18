import { expect, test } from 'vite-plus/test';
import type { SamplePlayer } from '@kidlib/web-audio';

import { connectPlayback, loopRange, voices } from './playbackState';

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
