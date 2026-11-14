import type { Component } from 'solid-js';
import type { SamplePlayer } from '@kidlib/web-audio';
import ParamKnob from './ParamKnob';
import { LoadButton } from './LoadButton';
// eslint-disable-next-line no-unused-vars -- used as a `use:` directive below
import tooltip from '@/ui/tooltip';
import { defaultSamplerParamValues, restoreSamplerParamValues } from './samplerParamState';

/** Getting a sample in: load a file, and reset the knobs. */
const SampleControls: Component<{
  player: SamplePlayer | null;
  sampleLoaded: boolean;
  onFile: (file: File) => void;
}> = (props) => (
  <fieldset id="sample-group" class="control-group sample-group">
    {/* Unnamed for now; see .sample-group > legend. */}
    <legend aria-hidden="true">&nbsp;</legend>
    <div class="expandable-content knob-grid">
      <ParamKnob param="volume" player={props.player} />
      <div class="flex-col">
        <LoadButton onFile={props.onFile} disabled={!props.player} />

        <button
          class="reset-button"
          aria-label="Reset Knobs"
          use:tooltip={['Reset Knobs']}
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
