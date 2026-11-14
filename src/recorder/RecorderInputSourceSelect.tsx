import { For } from 'solid-js';
// eslint-disable-next-line no-unused-vars -- used as a `use:` directive below
import tooltip from '@/ui/tooltip';
import type { RecorderInputSource } from './recorderSettings';

type RecorderInputSourceSelectProps = {
  class?: string;
  value: RecorderInputSource;
  onChange: (value: RecorderInputSource) => void;
};

const OPTIONS: { value: RecorderInputSource; label: string }[] = [
  { value: 'audio-input', label: 'Device' },
  { value: 'share', label: 'Share' },
  { value: 'resample', label: 'ReSample' },
];

const RecorderInputSourceSelect = (props: RecorderInputSourceSelectProps) => (
  <select
    class={props.class}
    aria-label="Audio input source"
    use:tooltip={['bottom', 'Choose source']}
    value={props.value}
    onchange={(event) => props.onChange(event.currentTarget.value as RecorderInputSource)}
  >
    <For each={OPTIONS}>{(option) => <option value={option.value}>{option.label}</option>}</For>
  </select>
);

export default RecorderInputSourceSelect;
