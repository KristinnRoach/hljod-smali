// src/types/global.d.ts

import 'solid-js';
import type { TooltipValue } from '../directives/tooltip';

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
      tooltip: TooltipValue;
    }

    interface IntrinsicElements {
      'envelope-switcher': any;

      // Leaf keyboard control
      'webaudio-keyboard': HTMLAttributes<WebAudioKeyboardElement>;
    }
  }
}
