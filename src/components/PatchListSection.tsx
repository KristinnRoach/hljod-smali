// components/PatchListSection.tsx
import { Component, createSignal, For, onCleanup, onMount } from 'solid-js';
import { db, SavedPatch } from '../db/samplelib/sampleIdb';
import { loadDefaultSample } from '../utils/audio/currentPatchStorage';
import { defaultSamplerParamValues } from '../utils/samplerParamState';

interface PatchListSectionProps {
  // ponytail: shift-click/shift-enter = add as layer instead of replacing.
  onPatchSelect: (patch: SavedPatch, asLayer: boolean) => void;
}

const PatchListSection: Component<PatchListSectionProps> = (props) => {
  const [patches, setPatches] = createSignal<SavedPatch[]>([]);
  const [loading, setLoading] = createSignal(false);

  const loadPatches = async () => {
    setLoading(true);
    try {
      const [defaultAudioData, savedPatches] = await Promise.all([
        loadDefaultSample(),
        db.samples.orderBy('createdAt').reverse().toArray(),
      ]);
      setPatches([
        { name: 'Default sample', layers: [defaultAudioData], params: defaultSamplerParamValues },
        ...savedPatches,
      ]);
    } catch (error) {
      console.error('Failed to load patches:', error);
    } finally {
      setLoading(false);
    }
  };

  onMount(() => {
    void loadPatches();
    document.addEventListener('patch:saved', loadPatches);
  });
  onCleanup(() => document.removeEventListener('patch:saved', loadPatches));

  const handleDelete = async (patch: SavedPatch, event: Event) => {
    event.stopPropagation();
    try {
      await db.samples.delete(patch.id!);
      void loadPatches();
    } catch (error) {
      console.error('Failed to delete patch:', error);
    }
  };

  const handleKeyDown = (patch: SavedPatch, event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      props.onPatchSelect(patch, event.shiftKey);
    }
  };

  return (
    <div>
      {loading() ? (
        <div>Loading...</div>
      ) : (
        <For each={patches()}>
          {(patch) => (
            <div
              class="sample-item"
              role="button"
              tabindex="0"
              onclick={(e) => props.onPatchSelect(patch, e.shiftKey)}
              onkeydown={(e) => handleKeyDown(patch, e)}
            >
              <div class="sample-info">
                <div class="sample-name">{patch.name}</div>
                <div class="sample-date">{patch.createdAt?.toLocaleDateString() ?? 'Built in'}</div>
              </div>
              {patch.id !== undefined && (
                <button
                  type="button"
                  class="delete-button"
                  onclick={(e) => handleDelete(patch, e)}
                  title={`Delete ${patch.name}`}
                  aria-label={`Delete ${patch.name}`}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </For>
      )}
    </div>
  );
};

export default PatchListSection;
