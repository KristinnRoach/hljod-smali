import { define } from '../../vendor/van-element';

import { EnvelopeSwitcher } from './EnvelopeSwitcher';
import { RecordButton, UploadButton, SaveButton } from './SamplerButtonFactory';

const defineIfNotExists = (name: string, elementFunc: any, options: any) => {
  if (!customElements.get(name)) {
    define(name, elementFunc, options);
  }
};

/** Register the remaining app-local vanilla controls. */
export const defineSampler = () => {
  defineIfNotExists('load-button', UploadButton, false);
  defineIfNotExists('record-button', RecordButton, false);
  defineIfNotExists('save-button', SaveButton, false);

  defineIfNotExists('envelope-switcher', EnvelopeSwitcher, false);
};

export { RecordButton, UploadButton, SaveButton };
