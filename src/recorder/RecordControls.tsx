import type { Component } from 'solid-js';
import type { SamplePlayer } from '@kidlib/web-audio';
import { Recorder } from './Recorder';

/** Record button, threshold and input source selection. */
const RecordControls: Component<{ player: SamplePlayer | null }> = (props) => (
  <fieldset id="record-group" class="control-group record-group">
    <legend class="expandable-legend">Record</legend>
    <div class="expandable-content flex-col">
      <Recorder player={props.player} />
    </div>
  </fieldset>
);

export default RecordControls;
