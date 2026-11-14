import type { Component } from 'solid-js';
import type { SamplePlayer } from '@kidlib/web-audio';
import InputDeviceSelect from '@/io/InputDeviceSelect';
import { RecordButton } from './RecordButton';
import RecorderInputSourceSelect from './RecorderInputSourceSelect';
import {
  recorderInputDeviceId,
  recorderInputSource,
  setRecorderInputDeviceId,
  setRecorderInputSource,
} from './recorderSettings';

/** Record button and input source selection. */
const RecordControls: Component<{ player: SamplePlayer | null }> = (props) => (
  <fieldset id="record-group" class="control-group record-group">
    <legend class="expandable-legend">Record</legend>
    <div class="expandable-content flex-col">
      <RecordButton player={props.player} />
      <div class="input-source-selection-container">
        <RecorderInputSourceSelect
          value={recorderInputSource()}
          onChange={setRecorderInputSource}
        />
        <InputDeviceSelect
          disabled={recorderInputSource() !== 'audio-input'}
          value={recorderInputDeviceId()}
          onChange={setRecorderInputDeviceId}
        />
      </div>
    </div>
  </fieldset>
);

export default RecordControls;
