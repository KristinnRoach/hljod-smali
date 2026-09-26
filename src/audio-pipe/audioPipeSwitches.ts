import { createSignal } from 'solid-js';
import type { NonDeviceOutput } from '@/io/OutputDeviceSelect';

// ponytail: hidden until the AudioPipe plugin is downloadable; drop `show` then.
const STORAGE_KEY = 'audiopipe';

const read = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
};

const [audioPipeShown, setShown] = createSignal(read());
let output: NonDeviceOutput | undefined;

export { audioPipeShown };

/** Called by createAudioPipeOutput so `enableAudioPipe` can reach the live output. */
export function bindAudioPipeOutput(next: NonDeviceOutput | undefined): void {
  output = next;
}

/** Shows or hides "Ableton (AudioPipe)" in the output list. Persists per browser.
 *  Hiding also disconnects. */
export function showAudioPipe(on: boolean): string {
  try {
    if (on) localStorage.setItem(STORAGE_KEY, '1');
    else localStorage.removeItem(STORAGE_KEY);
  } catch {}
  setShown(on);
  return `AudioPipe ${on ? 'shown' : 'hidden'}.`;
}

/** Connects or disconnects the AudioPipe output. Enabling also shows it. */
export async function enableAudioPipe(on: boolean): Promise<string> {
  if (!on) {
    output?.deactivate();
    return 'AudioPipe disconnected.';
  }
  if (!output) throw new Error('The sampler is still loading.');
  showAudioPipe(true);
  await output.activate();
  return 'AudioPipe connected.';
}

// Console: `showAudiopipe()` / `enableAudiopipe()`, pass false to undo.
Object.assign(window, {
  showAudiopipe: (on = true) => showAudioPipe(on),
  enableAudiopipe: (on = true) => enableAudioPipe(on),
});
