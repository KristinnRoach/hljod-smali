// components/OutputDeviceSelect.tsx
import { Component, For, Show, createMemo, createSignal, onCleanup, onMount } from 'solid-js';
import {
  canSetOutputDevice,
  getAudioOutputDevices,
  getCurrentOutputDeviceId,
  setAudioOutputDevice,
} from '@kidlib/web-audio';

/** An output that is not an OS audio device, so setSinkId cannot reach it
 *  (e.g. streaming to a DAW plugin). While active it replaces the device path;
 *  the chosen device stays set underneath and resumes when it deactivates. */
export interface NonDeviceOutput {
  label: string;
  /** Reactive. The owner flips it back on its own if the output drops. */
  active: () => boolean;
  /** Rejects on failure; the owner reports the error. */
  activate: () => Promise<void>;
  deactivate: () => void;
}

interface OutputDeviceSelectProps {
  class?: string;
  nonDeviceOutput?: NonDeviceOutput;
}

const NON_DEVICE = '__non-device__';

const STORAGE_KEY = 'audio:output-device';

const loadStoredDeviceId = (): string => {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? '';
  } catch {
    // Storage disabled (private mode, blocked cookies) -- routing still works.
    return '';
  }
};

const storeDeviceId = (deviceId: string): void => {
  try {
    if (deviceId) localStorage.setItem(STORAGE_KEY, deviceId);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Live routing stays correct when storage is unavailable.
  }
};

// Chrome withholds labels (and real ids) until mic permission is granted, so an
// unlabeled list means "not allowed to tell you yet", not "no such device".
const isPermissionGated = (devices: MediaDeviceInfo[]) =>
  devices.length > 0 && devices.every((d) => !d.label);

// Entries with no id are the placeholders of a gated list; they are not
// selectable devices and must not reach the dropdown.
const selectableDevices = (devices: MediaDeviceInfo[]) =>
  devices.filter((d) => d.deviceId && d.deviceId !== 'default');

/** Routes the app's audio output to a chosen device (e.g. BlackHole -> DAW).
 *  The choice persists across reloads. Hidden entirely on browsers without
 *  AudioContext.setSinkId (Safari). */
const OutputDeviceSelect: Component<OutputDeviceSelectProps> = (props) => {
  const [devices, setDevices] = createSignal<MediaDeviceInfo[]>([]);
  const [selected, setSelected] = createSignal('');

  // Both writers of `selected` also write storage, and neither runs until
  // setSinkId has resolved -- so what the dropdown shows is what the audio
  // context is actually routed to.
  const select = async (deviceId: string) => {
    try {
      await setAudioOutputDevice(deviceId);
      setSelected(deviceId);
      storeDeviceId(deviceId);
    } catch (err) {
      console.error('Failed to set output device', err);
      // The sink did not move. Ask the context where audio actually is rather
      // than guessing, and forget a preference we cannot honour.
      const actual = getCurrentOutputDeviceId();
      setSelected(actual);
      storeDeviceId(actual);
    }
  };

  // Reconciles the dropdown, the stored id and the sink against the device list
  // we just read. Runs after every refresh, so unplugging the selected device
  // falls back to system default and plugging it back in restores it.
  const syncSelection = async (list: MediaDeviceInfo[]) => {
    const wanted = selected() || loadStoredDeviceId();
    if (!wanted) return;

    if (selectableDevices(list).some((d) => d.deviceId === wanted)) {
      if (getCurrentOutputDeviceId() !== wanted) await select(wanted);
      return;
    }

    if (isPermissionGated(list)) return;
    setSelected('');
    storeDeviceId('');
    await setAudioOutputDevice('').catch((err) =>
      console.error('Failed to restore default output device', err),
    );
  };

  const refresh = async () => {
    const list = await getAudioOutputDevices();
    setDevices(list);
    await syncSelection(list);
    return list;
  };

  // Chrome only exposes the full labeled output list once mic permission is
  // granted, so request it on user interaction if the list looks gated. This is
  // also where a stored device that was hidden at load gets restored.
  const refreshWithPermission = async () => {
    if (!isPermissionGated(await refresh())) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      await refresh();
    } catch {
      // permission denied — keep the unlabeled list
    }
  };

  onMount(() => {
    if (!canSetOutputDevice()) return;
    const handleDeviceChange = () =>
      void refresh().catch((err) => console.error('Failed to list output devices', err));

    handleDeviceChange();
    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
    onCleanup(() => navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange));
  });

  // `selected` is always the device; the non-device output only overrides what is shown.
  const shown = () => (props.nonDeviceOutput?.active() ? NON_DEVICE : selected());

  const onChange = async (el: HTMLSelectElement) => {
    const output = props.nonDeviceOutput;
    if (el.value === NON_DEVICE) {
      await output?.activate().catch(() => {});
      // Solid won't rewrite an unchanged value, so undo the DOM choice if activation failed.
      el.value = shown();
      return;
    }
    if (output?.active()) output.deactivate();
    await select(el.value);
  };

  const selectedLabel = createMemo(() => {
    if (shown() === NON_DEVICE) return props.nonDeviceOutput!.label;
    if (!selected()) return 'System Default Output';
    return devices().find((d) => d.deviceId === selected())?.label || 'Audio output device';
  });

  return (
    <Show when={canSetOutputDevice()}>
      <div class={props.class}>
        <select
          aria-label="Audio output device"
          title={selectedLabel()}
          class="icon-select"
          value={shown()}
          onfocus={() => void refreshWithPermission()}
          onchange={(e) => void onChange(e.currentTarget)}
        >
          <option value="" selected={!shown()}>
            System Default Output
          </option>
          <For each={selectableDevices(devices())}>
            {(d, i) => (
              <option value={d.deviceId} selected={shown() === d.deviceId}>
                {d.label || `Output ${i() + 1}`}
              </option>
            )}
          </For>
          <Show when={props.nonDeviceOutput}>
            {(output) => (
              <option value={NON_DEVICE} selected={shown() === NON_DEVICE}>
                {output().label}
              </option>
            )}
          </Show>
        </select>
        <div class="icon-select-icon">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M11 5 6 9H3v6h3l5 4z" />
            <path d="M15.5 8.5a5 5 0 0 1 0 7" />
            <path d="M18.5 5.5a9 9 0 0 1 0 13" />
          </svg>
        </div>
      </div>
    </Show>
  );
};

export default OutputDeviceSelect;
