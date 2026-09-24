import { createSignal, onCleanup, onMount, type Accessor } from 'solid-js';

/**
 * Accepts files dropped anywhere on the page. Returns whether a file drag is
 * currently over the window, for an overlay.
 */
export const useFileDrop = (onFiles: (files: File[]) => void): Accessor<boolean> => {
  const [dragging, setDragging] = createSignal(false);

  const isFileDrag = (event: DragEvent) => !!event.dataTransfer?.types.includes('Files');

  const handleDragOver = (event: DragEvent) => {
    if (!isFileDrag(event)) return;
    // Without this the browser navigates to the file on drop.
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'copy';
    setDragging(true);
  };

  const handleDragLeave = (event: DragEvent) => {
    // dragleave fires for every element crossed; only a null relatedTarget
    // means the pointer actually left the window.
    if (event.relatedTarget === null) setDragging(false);
  };

  const handleDrop = (event: DragEvent) => {
    if (!isFileDrag(event)) return;
    event.preventDefault();
    setDragging(false);
    onFiles([...(event.dataTransfer?.files ?? [])]);
  };

  onMount(() => {
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);
  });

  onCleanup(() => {
    window.removeEventListener('dragover', handleDragOver);
    window.removeEventListener('dragleave', handleDragLeave);
    window.removeEventListener('drop', handleDrop);
  });

  return dragging;
};
