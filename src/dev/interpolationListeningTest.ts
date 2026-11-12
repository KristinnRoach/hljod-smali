// Throwaway: A/B source interpolation by ear. Not for main.
// Alt+1 linear, Alt+2 hermite, Alt+3 sinc, Alt+0 blind (random, hidden), Alt+/ reveal.
import { getSamplePlayer } from '@/sampler/samplePlayer';

type Mode = 'linear' | 'hermite' | 'sinc';
const modes: Record<string, Mode> = { Digit1: 'linear', Digit2: 'hermite', Digit3: 'sinc' };
let current: Mode = 'hermite';

const apply = (mode: Mode) => {
  current = mode;
  (getSamplePlayer() as any)?.setInterpolation(mode);
};

window.addEventListener(
  'keydown',
  (e) => {
    if (!e.altKey) return;
    const pick =
      modes[e.code] ??
      (e.code === 'Digit0' ? Object.values(modes)[Math.floor(Math.random() * 3)] : undefined);
    if (pick) {
      apply(pick);
      console.log(e.code === 'Digit0' ? 'interpolation: blind pick set' : `interpolation: ${pick}`);
    } else if (e.code === 'Slash') {
      console.log(`interpolation was: ${current}`);
    } else return;
    // keep the note keymap from also firing
    e.preventDefault();
    e.stopImmediatePropagation();
  },
  { capture: true },
);

(window as any).setInterpolation = apply;
