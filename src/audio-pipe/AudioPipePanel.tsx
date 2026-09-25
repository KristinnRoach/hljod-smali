import { Show, type Accessor } from 'solid-js';
import type { AudioPipeState } from './AudioPipeClient';
import styles from './AudioPipePanel.module.css';

/** Dev diagnostics for the AudioPipe route. Routing itself is chosen in OutputDeviceSelect. */
export default function AudioPipePanel(props: { state: Accessor<AudioPipeState> }) {
  const state = () => props.state();
  return (
    <section class={styles.panel} aria-label="AudioPipe diagnostics">
      <strong class={styles.title}>AudioPipe:</strong>
      <span role="status" class={state().status === 'error' ? styles.error : styles.status}>
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
          <small class={styles.stats}>
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
