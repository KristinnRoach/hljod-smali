import { createEffect, createSignal, onCleanup } from 'solid-js';
import type { NoteTarget } from '@kidlib/web-audio/io';
import { showToast } from '@/ui/Toast';
import { AudioPipeClient, type AudioPipeState } from './AudioPipeClient';
import { AudioPipeMidiInput } from './AudioPipeMidiInput';
import { audioPipeShown, bindAudioPipeClient } from './audioPipeSwitches';

/** Owns the AudioPipe connection and incoming MIDI for this sampler. */
export function createAudioPipe(
  source: () => AudioNode | undefined,
  noteTarget: () => NoteTarget | null | undefined,
) {
  const [state, setState] = createSignal<AudioPipeState>({ status: 'idle' });
  const midi = new AudioPipeMidiInput(noteTarget);
  let client: AudioPipeClient | undefined;

  createEffect(() => {
    const node = source();
    if (!node) return;
    const current = new AudioPipeClient(
      node.context as AudioContext,
      node,
      (next) => {
        if (next.status === 'error' && next.message) showToast(next.message, { kind: 'error' });
        setState(next);
      },
      (message) => midi.receive(message),
    );
    client = current;
    bindAudioPipeClient(current);
    // dev-only handle so e2e can connect to a chosen receiver port and read state
    if (import.meta.env.DEV)
      (window as any).getAudioPipe = () => ({ client: current, state: state() });
    onCleanup(() => {
      current.dispose();
      if (client === current) {
        client = undefined;
        bindAudioPipeClient(undefined);
      }
    });
  });

  createEffect(() => {
    if (!audioPipeShown()) client?.disconnect();
  });

  return {
    state,
    active: () => state().status === 'connecting' || state().status === 'connected',
  };
}
