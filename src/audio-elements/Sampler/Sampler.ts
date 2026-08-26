import { define } from '../../vendor/van-element';

import { EnvelopeSwitcher } from './EnvelopeSwitcher';

/** Register the remaining app-local vanilla controls. */
export const defineSampler = () => {
  if (!customElements.get('envelope-switcher')) {
    define('envelope-switcher', EnvelopeSwitcher, false);
  }
};
