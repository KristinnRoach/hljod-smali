import type { EnvelopeType } from '@kidlib/web-audio';
import type { KnobChangeEventDetail, KnobElement } from '@kidlib/web-audio/components';

interface TimeScaleKnobConfig {
  onChange: (data: { envelopeType: EnvelopeType; timeScale: number }) => void;
  envelopeType: EnvelopeType;
  width?: number;
  height?: number;
}

interface TimeScaleKnobControl {
  element: HTMLElement;
  setValue: (value: number) => void;
}

/**
 * Creates a time scale knob for envelope duration scaling
 */
export const TimeScaleKnob = ({
  onChange,
  envelopeType,
  width = 25,
  height = 25,
}: TimeScaleKnobConfig): TimeScaleKnobControl => {
  const container = document.createElement('div');
  container.classList.add('envelope-time-scale-knob');
  container.style = 'display: inline-block; place-content: center;';

  const knobElement = document.createElement('knob-element') as KnobElement;
  knobElement.title = 'Envelope speed';
  Object.entries({
    'min-value': 0.5,
    'max-value': 100,
    'default-value': 1,
    'snap-increment': 0.5,
    width,
    height,
    curve: 2.5,
    color: 'rgb(234, 234, 234)',
  }).forEach(([key, value]) => knobElement.setAttribute(key, value.toString()));
  container.appendChild(knobElement);

  const valueDisplay = document.createElement('div');
  valueDisplay.textContent = `Speed: ${knobElement.getValue()}`;
  valueDisplay.style.cssText = 'font-size: 10px; color: #aaa; margin-top: 4px; width: 10ch;';
  container.appendChild(valueDisplay);

  // knob-element's connectedCallback re-emits its default-value on mount. That
  // is not a user edit, and letting it through overwrites a restored envelope.
  let mountEmitSeen = false;
  knobElement.addEventListener('knob-change', (event) => {
    const timeScale = (event as CustomEvent<KnobChangeEventDetail>).detail.value;
    valueDisplay.textContent = `Speed: ${timeScale}`;
    if (!mountEmitSeen) {
      mountEmitSeen = true;
      return;
    }
    onChange({ envelopeType, timeScale });
  });
  const setValue = (value: number) => {
    knobElement.setAttribute('default-value', String(value));
    valueDisplay.textContent = `Speed: ${value}`;
    if (knobElement.isConnected && knobElement.getValue() !== value) {
      knobElement.setValue(value);
    }
  };

  return { element: container, setValue };
};
