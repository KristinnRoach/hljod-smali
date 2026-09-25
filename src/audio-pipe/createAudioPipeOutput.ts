import { createEffect, createSignal, onCleanup } from 'solid-js';
import { showToast } from '@/ui/Toast';
import type { NonDeviceOutput } from '@/io/OutputDeviceSelect';
import { AudioPipeClient, type AudioPipeState } from './AudioPipeClient';

/** Owns one AudioPipeClient per source node and exposes it as an output choice.
 *  Call inside a component; the client is disposed with its owner. */
export function createAudioPipeOutput(source: () => AudioNode | undefined) {
  const [state, setState] = createSignal<AudioPipeState>({ status: 'idle' });
  let client: AudioPipeClient | undefined;

  createEffect(() => {
    const node = source();
    if (!node) return;
    const current = new AudioPipeClient(node.context as AudioContext, node, (next) => {
      if (next.status === 'error' && next.message) showToast(next.message, { kind: 'error' });
      setState(next);
    });
    client = current;
    // dev-only handle so e2e can connect to a chosen receiver port and read state
    if (import.meta.env.DEV)
      (window as any).getAudioPipe = () => ({ client: current, state: state() });
    onCleanup(() => {
      current.dispose();
      if (client === current) client = undefined;
    });
  });

  const output: NonDeviceOutput = {
    label: 'Ableton (AudioPipe)',
    active: () => state().status === 'connecting' || state().status === 'connected',
    activate: () => client?.connect() ?? Promise.reject(new Error('No audio source yet.')),
    deactivate: () => client?.disconnect(),
  };

  return { state, output };
}
