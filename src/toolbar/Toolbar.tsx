import { type Component, createSignal, Show } from 'solid-js';
import styles from './Toolbar.module.css';
import type { SamplePlayer } from '@kidlib/web-audio';
import type { InstrumentIdentity } from '@/library/instrumentLibrary';
import SaveButton from '@/library/SaveButton';
import SampleWaveformFilled from '@/ui/icons/SampleWaveformFilled';
import { ThemeToggle } from '@/ui/ThemeToggle';
import { Toggle } from '@/ui/Toggle';
import InputDeviceSelect from '@/io/InputDeviceSelect';
import OutputDeviceSelect from '@/io/OutputDeviceSelect';
import MidiChannelSelect from '@/io/MidiChannelSelect';
import { audioPipeShown, enableAudioPipe } from '@/audio-pipe/audioPipeSwitches';
import {
  recorderInputDeviceId,
  recorderInputSource,
  setRecorderInputDeviceId,
} from '@/sampler/recorderSettings';

interface ToolbarProps {
  player: SamplePlayer | null;
  samples: readonly AudioBuffer[];
  instrument: InstrumentIdentity | null;
  sampleLoaded: boolean;
  instrumentLoading: boolean;
  sidebarOpen: boolean;
  audioPipeActive: boolean;
  onOpenLibrary: () => void;
  onSaved: (instrument: InstrumentIdentity) => void;
  onSampleRateChange: (sampleRate: number) => Promise<void>;
}

const Toolbar: Component<ToolbarProps> = (props) => {
  const [toolbarOpen, setToolbarOpen] = createSignal(false);

  return (
    <div
      class={`toolbar-wrapper ${styles.wrapper}`}
      classList={{ [styles.sidebarOpen]: props.sidebarOpen }}
    >
      <button
        type="button"
        title="Toggle Toolbar"
        onClick={() => setToolbarOpen(!toolbarOpen())}
        class={styles.toggle}
      >
        <svg width="20" height="20" stroke="10" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 6h18v2H3V6m0 5h18v2H3v-2m0 5h18v2H3v-2Z" />
        </svg>
      </button>

      <div
        class={`expandable-width ${styles.controls}`}
        classList={{ [styles.open]: toolbarOpen() }}
      >
        <button
          type="button"
          title="View saved instruments"
          onClick={props.onOpenLibrary}
          class={styles.button}
        >
          <SampleWaveformFilled
            fill={'white'}
            stroke={'white'}
            stroke-width={6}
            width={30}
            height={30}
          />
        </button>

        <SaveButton
          samples={props.samples}
          player={props.player}
          instrument={props.instrument}
          disabled={!props.sampleLoaded}
          class={styles.button}
          onSavedCallback={props.onSaved}
        />

        <ThemeToggle class={`${styles.button} ${styles.theme}`} defaultTheme="light" />

        <InputDeviceSelect
          class={`${styles.button} input-device-select`}
          disabled={recorderInputSource() !== 'audio-input'}
          value={recorderInputDeviceId()}
          onChange={setRecorderInputDeviceId}
        />

        <OutputDeviceSelect
          class={`${styles.button} output-device-select`}
          disabled={props.audioPipeActive}
          title={
            props.audioPipeActive ? 'DAW output active; turn it off to use this device.' : undefined
          }
        />

        <MidiChannelSelect class={`${styles.button} input-device-select`} />

        <Show when={audioPipeShown()}>
          <Toggle
            class={`${styles.button} ${styles.daw}`}
            style={{ opacity: props.audioPipeActive ? 1 : 0.5 }}
            aria-label="AudioPipe"
            checked={props.audioPipeActive}
            disabled={!props.player}
            onChange={(on) => void enableAudioPipe(on).catch(() => {})}
          >
            DAW
          </Toggle>
        </Show>

        <label class={`${styles.button} ${styles.sampleRate}`}>
          <span class={styles.sampleRateLabel}>kHz</span>

          <select
            aria-label="Sample rate"
            title="Temporary sample-rate control; interrupts playback"
            disabled={!props.player || props.instrumentLoading}
            value={props.player?.context.sampleRate ?? 44_100}
            onChange={(event) => void props.onSampleRateChange(Number(event.currentTarget.value))}
            class={styles.sampleRateSelect}
          >
            <option value="44100">44.1</option>
            <option value="48000">48</option>
          </select>
        </label>
      </div>
    </div>
  );
};

export default Toolbar;
