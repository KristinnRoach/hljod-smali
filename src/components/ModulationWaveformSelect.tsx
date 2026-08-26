import { For } from 'solid-js';
import { SUPPORTED_WAVEFORMS, type SupportedWaveform } from '@kidlib/web-audio';
import WaveformIcon from './WaveformIcon';

type ModulationWaveformSelectProps = {
  value: SupportedWaveform;
  onChange: (value: SupportedWaveform) => void;
};

const LABELS: Partial<Record<SupportedWaveform, string>> = {
  sine: 'Sine',
  square: 'Square',
  sawtooth: 'Saw',
  triangle: 'Triangle',
  pulse: 'Pulse',
  'bandlimited-sawtooth': 'BL-Saw',
  supersaw: 'Super',
  'warm-pad': 'Warm',
  metallic: 'Metallic',
  formant: 'Formant',
  'white-noise': 'White',
  'pink-noise': 'Pink',
  'brown-noise': 'Brown',
  'colored-noise': 'Colored',
  'random-harmonic': 'Random',
  'custom-function': 'Custom',
};

const ModulationWaveformSelect = (props: ModulationWaveformSelectProps) => (
  <div class="modulation-waveform-select">
    <WaveformIcon waveform={props.value} />
    <select
      aria-label="AM modulation waveform"
      title="Select Modulation Waveform"
      class="ac-select sampler-select sampler-select-with-icon"
      value={props.value}
      onchange={(event) => props.onChange(event.currentTarget.value as SupportedWaveform)}
    >
      <For each={SUPPORTED_WAVEFORMS}>
        {(waveform) => (
          <option value={waveform}>
            <WaveformIcon waveform={waveform} />
            {LABELS[waveform] ?? waveform}
          </option>
        )}
      </For>
    </select>
  </div>
);

export default ModulationWaveformSelect;
