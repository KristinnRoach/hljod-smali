import { type Component } from 'solid-js';
import type { SamplePlayer } from '@kidlib/web-audio';
import iconButton from './iconButton.module.css';
import { showToast } from './Toast';

const UploadIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    stroke-width="2"
    fill="none"
    stroke="currentColor"
  >
    <path d="M 12 0.75 L 12 16.084 M 24 15.334 L 24 20.444 C 24 21.856 22.857 23 21.444 23 L 2.667 23 C 1.254 23 0 21.856 0 20.444 L 0 15.334 M 5.339 7.14 L 12 0.75 L 18.661 7.14" />
  </svg>
);

/** Loads an audio file from disk into the sampler. */
export const LoadButton: Component<{ player: SamplePlayer | null; class?: string }> = (props) => {
  const loadFile = async (event: Event & { currentTarget: HTMLInputElement }) => {
    const file = event.currentTarget.files?.[0];
    const player = props.player;
    if (!file || !player) return;

    try {
      await player.loadSample(await file.arrayBuffer());
    } catch (error) {
      console.error('Failed to load sample:', error);
      showToast(`Could not load “${file.name}”`, { kind: 'error' });
    }

    // Let the same file be picked again after a failed or replaced load.
    event.currentTarget.value = '';
  };

  return (
    <label
      title="Upload Sample"
      class={`${iconButton.button} ${props.player ? '' : iconButton.disabled} ${props.class || ''}`}
    >
      <input
        type="file"
        accept="audio/*"
        disabled={!props.player}
        onChange={loadFile}
        style={{ display: 'none' }}
      />
      <UploadIcon />
    </label>
  );
};
