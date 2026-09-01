import { For } from 'solid-js';
import type { RecorderInputSource } from '@/utils/recorderSettings';

type RecorderInputSourceSelectProps = {
  value: RecorderInputSource;
  onChange: (value: RecorderInputSource) => void;
};

const OPTIONS: { value: RecorderInputSource; label: string }[] = [
  { value: 'audio-input', label: 'Device' },
  { value: 'browser', label: 'Browser' },
  { value: 'resample', label: 'ReSample' },
];

const RecorderInputSourceSelect = (props: RecorderInputSourceSelectProps) => (
  <select
    aria-label="Audio input source"
    title="Select Audio Input Source"
    class="ac-select sampler-select"
    value={props.value}
    onchange={(event) => props.onChange(event.currentTarget.value as RecorderInputSource)}
  >
    <For each={OPTIONS}>{(option) => <option value={option.value}>{option.label}</option>}</For>
  </select>
);

export default RecorderInputSourceSelect;
