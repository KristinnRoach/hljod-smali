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

interface SaveButtonProps {
  samples: readonly AudioBuffer[];
  /** The instrument currently loaded, when it came from the library. */
  instrument?: InstrumentIdentity | null;
  isOpen?: boolean;
  disabled?: boolean;
  class?: string;
  onSavedCallback?: (instrument: InstrumentIdentity) => unknown;
}

// TODO: replace with dumb ui compenent e.g. BaseButton

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
  let saveBtnWrapperRef: HTMLInputElement | undefined;

  createEffect(() => {
    if (props.isOpen === true || props.isOpen === false) {
      if (saveBtnWrapperRef !== undefined) {
        if (props.isOpen) saveBtnWrapperRef.classList.add('--sidebar-open');
        else saveBtnWrapperRef.classList.remove('--sidebar-open');
      }
    }
  }, [props.isOpen]);

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
      <save-button
        class={`${props.class ? props.class : ''} save-button ${showPrompt() ? 'open' : ''}`}
        disabled={props.disabled || saving()}
        onclick={() => void openPrompt()}
        title={
          overwriteId() !== undefined
            ? `Save changes to ${props.instrument?.name}`
            : 'Save instrument'
        }
      ></save-button>
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
