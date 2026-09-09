import { createSignal } from 'solid-js';
import { render } from 'solid-js/web';

import type { EnvelopeType } from '@kidlib/web-audio';

import SolidKnob from '../../knobs/SolidKnob';
// Borrowed from ParamKnob rather than duplicated: this file goes away with the
// legacy envelope UI, so it is not worth its own stylesheet.
import knobStyles from '../../knobs/ParamKnob.module.css';

interface TimeScaleKnobConfig {
  onChange: (data: { envelopeType: EnvelopeType; timeScale: number }) => void;
  envelopeType: EnvelopeType;
}

interface TimeScaleKnobControl {
  element: HTMLElement;
  setValue: (value: number) => void;
  dispose: () => void;
}

/**
 * Creates a time scale knob for envelope duration scaling
 */
export const TimeScaleKnob = ({
  onChange,
  envelopeType,
}: TimeScaleKnobConfig): TimeScaleKnobControl => {
  const container = document.createElement('div');
  container.classList.add('envelope-time-scale-knob');
  container.style = 'display: inline-block; place-content: center;';

  const [timeScale, setTimeScale] = createSignal(1);

  const dispose = render(
    () => (
      <>
        <SolidKnob
          class={knobStyles.knobControl}
          label="Envelope speed"
          value={timeScale()}
          min={0.5}
          max={100}
          defaultValue={1}
          size={25}
          step={0.5}
          curve={2.5}
          onChange={(value) => {
            setTimeScale(value);
            onChange({ envelopeType, timeScale: value });
          }}
        />
        <div style={{ 'font-size': '10px', color: '#aaa', 'margin-top': '4px', width: '10ch' }}>
          Speed: {timeScale()}
        </div>
      </>
    ),
    container,
  );

  return { element: container, setValue: setTimeScale, dispose };
};
