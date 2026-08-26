// src/types/global.d.ts

import 'solid-js';
import type { KnobElement } from '@kidlib/web-audio/components';

declare global {
  interface WebAudioKeyboardElement extends HTMLElement {
    width: number;
    height: number;
    min: number;
    keys: number;
    setNote: (state: 0 | 1, note: number) => void;
  }
}

declare module 'solid-js' {
  namespace JSX {
    interface Directives {
      clickOutside: (event: PointerEvent) => void;
    }

    interface IntrinsicElements {
      'envelope-switcher': any;

      'record-button': any;

      'knob-element': KnobElement;

      // Leaf keyboard control
      'webaudio-keyboard': HTMLAttributes<WebAudioKeyboardElement>;
    }
  }
}
