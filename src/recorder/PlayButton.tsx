import { createEffect, createSignal, onCleanup, type Component } from 'solid-js';
import type { SamplePlayer } from '@kidlib/web-audio';
import type { SampleRecorder } from './createSampleRecorder';
import styles from './PlayButton.module.css';

/** Plays the last take as recorded, before sampler processing. Self-contained so it can be dropped. */
export const PlayButton: Component<{ recorder: SampleRecorder; player: SamplePlayer | null }> = (
  props,
) => {
  const [source, setSource] = createSignal<AudioBufferSourceNode | null>(null);
  // Bumped by every play and stop. A play still awaiting resume() bails if superseded,
  // so disposal or a second click never leaves an untracked node playing.
  let request = 0;
  const stop = () => {
    request++;
    source()?.stop();
    setSource(null);
  };

  const play = async () => {
    const context = props.player?.context;
    const take = props.recorder.take();
    if (!context || !take) return;
    const id = ++request;
    await context.resume();
    if (id !== request) return;
    const node = new AudioBufferSourceNode(context, { buffer: take });
    node.connect(context.destination);
    node.onended = () => {
      node.disconnect();
      if (source() === node) setSource(null);
    };
    node.start();
    setSource(node);
  };

  // Recording ends the preview, and so does a new player, which clears the take.
  createEffect(() => {
    if (props.recorder.state() !== 'IDLE' || !props.recorder.take()) stop();
  });
  onCleanup(stop);

  return (
    <button
      type="button"
      class={styles.button}
      data-playing={source() !== null}
      aria-label={source() ? 'Stop take' : 'Play take'}
      title="Preview the last take"
      disabled={!props.recorder.take() || props.recorder.state() !== 'IDLE'}
      onClick={() => (source() ? stop() : void play())}
    >
      <i />
    </button>
  );
};
