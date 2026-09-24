import { createEffect, createSignal, type Component } from 'solid-js';
import type { SamplePlayer, SupportedWaveform } from '@kidlib/web-audio';
import ParamKnob from './ParamKnob';
import ModulationWaveformSelect from './ModulationWaveformSelect';

/** Distortion and amplitude modulation. */
const DirtControls: Component<{ player: SamplePlayer | null }> = (props) => {
  const [amWaveform, setAmWaveform] = createSignal<SupportedWaveform>('square');

  createEffect(() => {
    props.player?.setModulationWaveform('AM', amWaveform());
  });

  return (
    <fieldset class="control-group misc-group">
      <legend class="expandable-legend">Dirt</legend>
      <div class="expandable-content">
        <ParamKnob param="distortion" player={props.player} />
        <div
          class="am-modulation-composite"
          style="display: inline-flex; flex-direction: column; align-items: center; gap: 2px;"
        >
          <ParamKnob param="amMod" label="AM" player={props.player} />
          <span style="display: flex; flex-direction: row; align-items: space-between; gap: 4px;">
            <ModulationWaveformSelect value={amWaveform()} onChange={setAmWaveform} />
            <input
              style="text-align: center;"
              type="number"
              inputmode="numeric"
              pattern="[0-9]*"
              min="-4"
              max="3"
              value="1"
              on:change={(e) => props.player?.setAMModOctaveOffset(Number(e.target.value))}
            />
          </span>
        </div>
      </div>
    </fieldset>
  );
};

export default DirtControls;
