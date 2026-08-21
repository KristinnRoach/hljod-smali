// components/InstrumentListSection.tsx
import { Component, createSignal, For, onCleanup, onMount } from 'solid-js';
import {
  deleteInstrument,
  listInstruments,
  subscribe,
  type InstrumentSummary,
} from '../instruments/instrumentLibrary';

interface InstrumentListSectionProps {
  // ponytail: shift-click/shift-enter stacks the samples onto the current set
  // instead of replacing it.
  onInstrumentSelect: (instrument: InstrumentSummary, stack: boolean) => void;
  onInstrumentDeleted?: (id: number) => void;
}

const InstrumentListSection: Component<InstrumentListSectionProps> = (props) => {
  const [instruments, setInstruments] = createSignal<InstrumentSummary[]>([]);
  const [loading, setLoading] = createSignal(false);
  // Overlapping loads: only the newest one gets to write, and only it clears
  // the flag -- an older one finishing must not un-spin the spinner.
  let latestLoad = 0;

  const loadInstruments = async () => {
    const loadId = ++latestLoad;
    setLoading(true);
    try {
      const loaded = await listInstruments();
      if (loadId === latestLoad) setInstruments(loaded);
    } catch (error) {
      console.error('Failed to load instruments:', error);
    } finally {
      if (loadId === latestLoad) setLoading(false);
    }
  };

  onMount(() => {
    void loadInstruments();
    onCleanup(subscribe(() => void loadInstruments()));
  });

  const handleDelete = async (instrument: InstrumentSummary, event: Event) => {
    event.stopPropagation();
    if (instrument.ref.kind !== 'saved') return;
    const { id } = instrument.ref;
    try {
      await deleteInstrument(id);
      props.onInstrumentDeleted?.(id);
    } catch (error) {
      console.error('Failed to delete instrument:', error);
    }
  };

  const handleKeyDown = (instrument: InstrumentSummary, event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      props.onInstrumentSelect(instrument, event.shiftKey);
    }
  };

  return (
    <div>
      {loading() ? (
        <div>Loading...</div>
      ) : (
        <For each={instruments()}>
          {(instrument) => (
            <div class="instrument-item">
              <button
                type="button"
                class="instrument-select-button"
                onclick={(e) => props.onInstrumentSelect(instrument, e.shiftKey)}
                onkeydown={(e) => handleKeyDown(instrument, e)}
              >
                <span class="instrument-info">
                  <span class="instrument-name">{instrument.name}</span>
                  <span class="instrument-date">
                    {instrument.createdAt?.toLocaleDateString() ?? 'Built in'}
                  </span>
                </span>
              </button>
              {instrument.ref.kind === 'saved' && (
                <button
                  type="button"
                  class="delete-button"
                  onclick={(e) => handleDelete(instrument, e)}
                  title={`Delete ${instrument.name}`}
                  aria-label={`Delete ${instrument.name}`}
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

export default InstrumentListSection;
