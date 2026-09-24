import { createEffect, createSignal, onCleanup, Show } from 'solid-js';
import { AudioPipeClient, type AudioPipeState } from './AudioPipeClient';
import './AudioPipePanel.css';

// This is the only app/framework adapter. The transport takes standard Web Audio nodes.
export default function AudioPipePanel(props: { source?: AudioNode }) {
  const [state, setState] = createSignal<AudioPipeState>({ status: 'idle' });
  let client: AudioPipeClient | undefined;
  createEffect(() => {
    const source = props.source;
    if (!source) return;
    const current = new AudioPipeClient(source.context as AudioContext, source, setState);
    client = current;
    // dev-only handle so e2e can connect to a chosen receiver port and read state
    if (import.meta.env.DEV)
      (window as any).getAudioPipe = () => ({ client: current, state: state() });
    onCleanup(() => {
      current.dispose();
      if (client === current) client = undefined;
    });
  });

  const active = () => state().status === 'connected' || state().status === 'connecting';
  const connect = () => {
    if (active()) client?.disconnect();
    else
      void client?.connect().catch(() => {
        /* The client publishes the actionable error. */
      });
  };

  return (
    <section class="audio-pipe-panel" aria-label="AudioPipe local prototype">
      <strong>AudioPipe</strong>
      <button type="button" disabled={!props.source} onClick={connect}>
        {active() ? 'Use browser output' : 'Send to Ableton'}
      </button>
      <span role="status">
        {state().status === 'connected'
          ? 'Sending to Live · browser muted'
          : state().status === 'connecting'
            ? 'Connecting…'
            : state().status === 'error'
              ? state().message
              : 'Browser output'}
      </span>
      <Show when={state().stats}>
        {(stats) => (
          <small>
            Queue {((stats().queueFrames / stats().sampleRate) * 1000).toFixed(1)} ms
            {' · '}Buffer {stats().targetFrames} frames
            {' · '}Underruns {stats().underruns}
            {' · '}Overruns {stats().overruns}
            {' · '}Gaps {stats().gaps}
            {' · '}Sender drops {state().dropped ?? 0}
            {' · '}
            {stats().callbacks ? 'DAW processing' : 'DAW is not processing — check monitoring'}
          </small>
        )}
      </Show>
    </section>
  );
}
