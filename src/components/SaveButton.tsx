// components/SaveButton.tsx
import { Component, createSignal, createEffect, onCleanup, onMount } from 'solid-js';
import {
  type InstrumentIdentity,
  nextInstrumentName,
  SampleCapExceeded,
  saveInstrument,
} from '../instruments/instrumentLibrary';
import { snapshotSamplerParamValues } from '../utils/samplerParamState';
import { clickOutside } from '../directives/clickOutside';
import { showToast } from './Toast';

const SaveIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="20"
    height="20"
    fill="currentColor"
    stroke="currentColor"
  >
    <path d="m23.65 4.4-4.2-4.2a.68.68 0 0 0-.48-.2H.675A.675.675 0 0 0 0 .675v22.5A.675.675 0 0 0 .675 24h22.5a.675.675 0 0 0 .675-.675V4.875a.675.675 0 0 0-.2-.475zM3.16 2.85a.487.487 0 0 1 .487-.487h13.24a.487.487 0 0 1 .487.487v6.44a.487.487 0 0 1-.487.487H3.647a.487.487 0 0 1-.487-.487V2.85zm17.53 17.52a.6.6 0 0 1-.6.6H3.765a.6.6 0 0 1-.6-.6v-7.88a.6.6 0 0 1 .6-.6h16.325a.6.6 0 0 1 .6.6v7.94z" />
    <path d="M14.29 3.21h2.02v5.73h-2.02zM4.89 14.38H19.51v.675H4.89zM4.89 17.74H19.51v.675H4.89z" />
  </svg>
);

interface SaveButtonProps {
  samples: readonly AudioBuffer[];
  /** The instrument currently loaded, when it came from the library. */
  instrument?: InstrumentIdentity | null;
  disabled?: boolean;
  class?: string;
  onSavedCallback?: (instrument: InstrumentIdentity) => unknown;
}

const SaveButton: Component<SaveButtonProps> = (props) => {
  // Only a saved instrument can be overwritten; the built-in one always saves
  // as new.
  const overwriteId = () => {
    const ref = props.instrument?.ref;
    return ref?.kind === 'saved' ? ref.id : undefined;
  };

  const [saving, setSaving] = createSignal(false);
  const [showPrompt, setShowPrompt] = createSignal(false);
  const [name, setName] = createSignal('');
  let inputRef: HTMLInputElement | undefined;

  const openPrompt = async () => {
    const samples = props.samples;
    const instrument = props.instrument;
    if (samples.length === 0) return;

    try {
      // Only a saved instrument's own name is a sensible prefill. The built-in
      // one would seed every save with "Default" and collide with its own list entry.
      const instrumentName =
        instrument?.ref.kind === 'saved' ? instrument.name : await nextInstrumentName();
      if (props.samples !== samples || props.instrument !== instrument) return;

      setName(instrumentName);
      setShowPrompt(true);
    } catch (error) {
      console.error('Failed to open save prompt:', error);
      showToast('Could not prepare an instrument name. Please try again.', {
        kind: 'error',
      });
    }
  };

  const cancelPrompt = () => {
    setShowPrompt(false);
    setName('');
  };

  const handleSave = async (saveAsNew = false, requestedName = name()) => {
    const samples = props.samples;
    const instrument = props.instrument;
    if (samples.length === 0 || saving()) return;

    const instrumentName = requestedName.trim();
    if (instrumentName.length === 0) {
      alert('Please enter a name.');
      return;
    }

    setSaving(true);
    try {
      const id = await saveInstrument({
        id: saveAsNew ? undefined : overwriteId(),
        name: instrumentName,
        samples,
        params: snapshotSamplerParamValues(),
      });

      showToast(`Saved “${instrumentName}”`, { kind: 'success' });
      if (props.samples === samples && props.instrument === instrument) {
        setShowPrompt(false);
        setName('');
        props.onSavedCallback?.({ ref: { kind: 'saved', id }, name: instrumentName });
      }
    } catch (error) {
      console.error('Save failed:', error);
      showToast(
        error instanceof SampleCapExceeded
          ? error.message
          : 'Could not save instrument. Please try again.',
        { kind: 'error', duration: 5000 },
      );
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      void handleSave();
    } else if (e.key === 'Escape') {
      cancelPrompt();
    }
  };

  const handleSaveShortcut = (e: KeyboardEvent) => {
    if (e.key.toLowerCase() !== 's' || (!e.metaKey && !e.ctrlKey) || e.altKey) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    if (props.samples.length === 0 || props.disabled || saving()) return;

    if (e.shiftKey) {
      void openPrompt();
    } else if (showPrompt()) {
      void handleSave();
    } else if (props.instrument?.ref.kind === 'saved') {
      void handleSave(false, props.instrument.name);
    } else {
      void openPrompt();
    }
  };

  onMount(() => document.addEventListener('keydown', handleSaveShortcut, true));
  onCleanup(() => document.removeEventListener('keydown', handleSaveShortcut, true));

  createEffect(() => {
    if (showPrompt() && inputRef) {
      inputRef.focus();
    }
  });

  return (
    <>
      <button
        type="button"
        class={props.class || ''}
        disabled={props.disabled || saving()}
        onClick={() => void openPrompt()}
        title={
          overwriteId() !== undefined
            ? `Save changes to ${props.instrument?.name}`
            : 'Save instrument'
        }
      >
        <SaveIcon />
      </button>
      {showPrompt() && (
        <div class="save-popup" use:clickOutside={cancelPrompt}>
          <span class="save-popup-header">Save Instrument</span>

          <input
            title={`Instrument Name`}
            ref={inputRef}
            type="text"
            placeholder={`Instrument Name`}
            value={name()}
            onInput={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div class="save-popup-buttons">
            <button onClick={() => void handleSave()} disabled={saving()}>
              {saving() ? 'Saving...' : overwriteId() !== undefined ? 'Update' : 'Save'}
            </button>
            {overwriteId() !== undefined && (
              <button onClick={() => void handleSave(true)} disabled={saving()}>
                Save as new
              </button>
            )}
            <button onClick={cancelPrompt}>Cancel</button>
          </div>
        </div>
      )}
    </>
  );
};

export default SaveButton;
