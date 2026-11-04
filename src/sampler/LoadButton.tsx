import { type Component } from 'solid-js';
import iconButton from '@/ui/iconButton.module.css';

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

/** Picks an audio file from disk. Loading it is the caller's job. */
export const LoadButton: Component<{
  onFile: (file: File) => void;
  disabled?: boolean;
  class?: string;
}> = (props) => {
  const pickFile = (event: Event & { currentTarget: HTMLInputElement }) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    // Let the same file be picked again after a failed or replaced load.
    input.value = '';
    if (file) props.onFile(file);
  };

  return (
    <label
      title="Upload Sample"
      class={`${iconButton.button} ${props.disabled ? iconButton.disabled : ''} ${props.class || ''}`}
    >
      <input
        type="file"
        accept="audio/*"
        aria-label="Upload Sample"
        disabled={props.disabled}
        onChange={pickFile}
        class={iconButton.input}
      />
      <UploadIcon />
    </label>
  );
};
