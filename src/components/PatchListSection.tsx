// components/PatchListSection.tsx
import { Component, createSignal, For, onCleanup, onMount } from 'solid-js';
import { deletePatch, listPatches, subscribe, type PatchSummary } from '../patches/patchLibrary';

interface PatchListSectionProps {
  // ponytail: shift-click/shift-enter = add as layer instead of replacing.
  onPatchSelect: (patch: PatchSummary, asLayer: boolean) => void;
  onPatchDeleted?: (id: number) => void;
}

const PatchListSection: Component<PatchListSectionProps> = (props) => {
  const [patches, setPatches] = createSignal<PatchSummary[]>([]);
  const [loading, setLoading] = createSignal(false);
  let latestLoad = 0;
  let activeLoads = 0;

  const loadPatches = async () => {
    const loadId = ++latestLoad;
    activeLoads += 1;
    setLoading(true);
    try {
      const loaded = await listPatches();
      if (loadId !== latestLoad) return;
      setPatches(loaded);
    } catch (error) {
      console.error('Failed to load patches:', error);
    } finally {
      activeLoads -= 1;
      if (activeLoads === 0) setLoading(false);
    }
  };

  onMount(() => {
    void loadPatches();
    onCleanup(subscribe(() => void loadPatches()));
  });

  const handleDelete = async (patch: PatchSummary, event: Event) => {
    event.stopPropagation();
    if (patch.ref.kind !== 'saved') return;
    const { id } = patch.ref;
    try {
      await deletePatch(id);
      props.onPatchDeleted?.(id);
    } catch (error) {
      console.error('Failed to delete patch:', error);
    }
  };

  const handleKeyDown = (patch: PatchSummary, event: KeyboardEvent) => {
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
            <div class="sample-item">
              <button
                type="button"
                class="sample-select-button"
                onclick={(e) => props.onPatchSelect(patch, e.shiftKey)}
                onkeydown={(e) => handleKeyDown(patch, e)}
              >
                <span class="sample-info">
                  <span class="sample-name">{patch.name}</span>
                  <span class="sample-date">
                    {patch.createdAt?.toLocaleDateString() ?? 'Built in'}
                  </span>
                </span>
              </button>
              {patch.ref.kind === 'saved' && (
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
