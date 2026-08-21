// components/SaveButton.tsx
import { Component, createSignal, createEffect, onCleanup, onMount } from 'solid-js';
import { LayerCapExceeded, nextPatchName, savePatch } from '../patches/patchLibrary';
import { snapshotSamplerParamValues } from '../utils/samplerParamState';
import { clickOutside } from '../directives/clickOutside';
import { showToast } from './Toast';

interface SaveButtonProps {
  layers: readonly AudioBuffer[];
  patch?: { id: number; name: string } | null;
  isOpen?: boolean;
  disabled?: boolean;
  class?: string;
  onSavedCallback?: (patch: { id: number; name: string }) => unknown;
}

// TODO: replace with dumb ui compenent e.g. BaseButton

const SaveButton: Component<SaveButtonProps> = (props) => {
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
    const layers = props.layers;
    const patch = props.patch;
    if (layers.length === 0) return;

    try {
      const patchName = patch?.name ?? (await nextPatchName());
      if (props.layers !== layers || props.patch?.id !== patch?.id) return;

      setName(patchName);
      setShowPrompt(true);
    } catch (error) {
      console.error('Failed to open save prompt:', error);
      showToast('Could not prepare a patch name. Please try again.', {
        kind: 'error',
      });
    }
  };

  const cancelPrompt = () => {
    setShowPrompt(false);
    setName('');
  };

  const handleSave = async (saveAsNew = false, requestedName = name()) => {
    const layers = props.layers;
    const patch = props.patch;
    if (layers.length === 0 || saving()) return;

    const patchName = requestedName.trim();
    if (patchName.length === 0) {
      alert('Please enter a name.');
      return;
    }

    setSaving(true);
    try {
      const id = await savePatch({
        id: patch && !saveAsNew ? patch.id : undefined,
        name: patchName,
        layers,
        params: snapshotSamplerParamValues(),
      });

      showToast(`Saved “${patchName}”`, { kind: 'success' });
      if (props.layers === layers && props.patch?.id === patch?.id) {
        setShowPrompt(false);
        setName('');
        props.onSavedCallback?.({ id, name: patchName });
      }
    } catch (error) {
      console.error('Save failed:', error);
      showToast(
        error instanceof LayerCapExceeded
          ? error.message
          : 'Could not save patch. Please try again.',
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
    if (props.layers.length === 0 || props.disabled || saving()) return;

    if (e.shiftKey) {
      void openPrompt();
    } else if (showPrompt()) {
      void handleSave();
    } else if (props.patch) {
      void handleSave(false, props.patch.name);
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
        title={props.patch ? `Save changes to ${props.patch.name}` : 'Save patch'}
      ></save-button>
      {showPrompt() && (
        <div class="save-popup" use:clickOutside={cancelPrompt}>
          <span class="save-popup-header">Save Patch</span>

          <input
            title={`Patch Name`}
            ref={inputRef}
            type="text"
            placeholder={`Patch Name`}
            value={name()}
            onInput={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div class="save-popup-buttons">
            <button onClick={() => void handleSave()} disabled={saving()}>
              {saving() ? 'Saving...' : props.patch ? 'Update' : 'Save'}
            </button>
            {props.patch && (
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
