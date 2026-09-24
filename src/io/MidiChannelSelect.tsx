import { createSignal, type Component } from 'solid-js';
import { setSamplePlayerMidiInputChannel, type MidiInputChannel } from './MidiMan';

const MIDI_INPUT_CHANNEL_STORAGE_KEY = 'midi-input-channel';

export const loadMidiInputChannel = (): MidiInputChannel => {
  try {
    const value = localStorage.getItem(MIDI_INPUT_CHANNEL_STORAGE_KEY);
    const channel = Number(value);
    return Number.isInteger(channel) && channel >= 1 && channel <= 16 ? channel : 'all';
  } catch {
    return 'all';
  }
};

/** Picks which MIDI channel plays notes. Routes and persists on change. */
const MidiChannelSelect: Component<{ class?: string }> = (props) => {
  const [channel, setChannel] = createSignal<MidiInputChannel>(loadMidiInputChannel());

  return (
    <div class={props.class}>
      <select
        aria-label="MIDI note channel"
        title="MIDI note channel"
        class="icon-select"
        value={channel()}
        onchange={(event) => {
          const next =
            event.currentTarget.value === 'all' ? 'all' : Number(event.currentTarget.value);
          setChannel(next);
          setSamplePlayerMidiInputChannel(next);
          try {
            localStorage.setItem(MIDI_INPUT_CHANNEL_STORAGE_KEY, String(next));
          } catch {
            // Persistence is optional; routing still updates.
          }
        }}
      >
        <option value="all">Notes: All channels</option>
        {Array.from({ length: 16 }, (_, index) => (
          <option value={index + 1}>Notes: Channel {index + 1}</option>
        ))}
      </select>
      <div class="icon-select-icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          viewBox="0 5 24 14"
          width="20"
          height="20"
          fill="currentColor"
          stroke="none"
          stroke-width="1"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M 21.775 5 L 24 5 L 24 18.998 L 21.775 18.998 L 21.775 5 Z M 13.213 5 L 19.719 5 C 20.379 5 20.764 5.891 20.764 6.948 L 20.764 17.262 C 20.764 18.575 20.414 18.998 19.652 18.998 L 13.213 18.998 L 13.213 10.106 L 15.438 10.106 L 15.438 15.577 L 18.573 15.577 L 18.573 8.159 L 13.213 8.159 L 13.213 5 Z M 9.978 5 L 12.168 5 L 12.168 18.998 L 9.978 18.998 L 9.978 5 Z M 0 5 L 7.854 5 C 8.514 5 8.899 5.891 8.899 6.948 L 8.899 19 L 6.708 19 L 6.708 8.524 L 5.427 8.524 L 5.427 18.997 L 3.438 18.997 L 3.438 8.525 L 2.191 8.525 L 2.191 18.998 L 0 18.998 L 0 5 Z" />
        </svg>
      </div>
    </div>
  );
};

export default MidiChannelSelect;
