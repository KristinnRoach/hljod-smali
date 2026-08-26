import { define } from '../../vendor/van-element';

import { EnvelopeSwitcher } from './EnvelopeSwitcher';
import { RecordButton } from './SamplerButtonFactory';

const defineIfNotExists = (name: string, elementFunc: any, options: any) => {
  if (!customElements.get(name)) {
    define(name, elementFunc, options);
  }
};

/** Register the remaining app-local vanilla controls. */
export const defineSampler = () => {
  defineIfNotExists('record-button', RecordButton, false);

  defineIfNotExists('envelope-switcher', EnvelopeSwitcher, false);
};

export { RecordButton };
