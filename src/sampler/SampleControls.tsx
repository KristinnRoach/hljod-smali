import type { Component } from 'solid-js';
import type { SamplePlayer } from '@kidlib/web-audio';
import InputDeviceSelect from '@/io/InputDeviceSelect';
import ParamKnob from './ParamKnob';
import { RecordButton } from './RecordButton';
import { LoadButton } from './LoadButton';
import RecorderInputSourceSelect from './RecorderInputSourceSelect';
import {
  recorderInputDeviceId,
  recorderInputSource,
  setRecorderInputDeviceId,
  setRecorderInputSource,
} from './recorderSettings';
import { defaultSamplerParamValues, restoreSamplerParamValues } from './samplerParamState';

/** Getting a sample in: record, load files, and reset the knobs. */
const SampleControls: Component<{
  player: SamplePlayer | null;
  sampleLoaded: boolean;
  onFiles: (files: File[]) => void;
}> = (props) => (
  <fieldset id="sample-group" class="control-group sample-group">
    <legend class="expandable-legend">Sample</legend>
    <div class="expandable-content">
      <ParamKnob param="volume" player={props.player} />
      <div class="flex-col">
        <RecordButton player={props.player} />
        <div class="input-source-selection-container">
          <RecorderInputSourceSelect
            value={recorderInputSource()}
            onChange={setRecorderInputSource}
          />
          <InputDeviceSelect
            class="input-device-select"
            disabled={recorderInputSource() !== 'audio-input'}
            value={recorderInputDeviceId()}
            onChange={setRecorderInputDeviceId}
          />
        </div>
      </div>
      <div class="flex-col">
        <LoadButton onFiles={props.onFiles} disabled={!props.player} />

        <button
          class="reset-button"
          title="Reset knobs"
          disabled={!props.sampleLoaded}
          onclick={() => restoreSamplerParamValues(defaultSamplerParamValues)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="none">
            <path d="M139.141 232.184c78.736 0 127.946-85.236 88.579-153.424-39.369-68.187-137.789-68.187-177.158 0A102.125 102.125 0 0 0 43.71 93.1m62.258-5.371c-14.966 5.594-35.547 10.026-48.737 19.272-2.137 1.497-26.015 16.195-26.049 13.991C27.503 98.21 13.21 75.873 13.21 52.583" />
          </svg>
        </button>
      </div>
    </div>
  </fieldset>
);

export default SampleControls;
