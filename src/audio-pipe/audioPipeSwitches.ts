import type { NonDeviceOutput } from '@/io/OutputDeviceSelect';
import { featureFlag, setFeatureFlag } from '@/lib/featureFlag';

// ponytail: flagged until the AudioPipe plugin is downloadable; drop the flag then.
/** Whether "Ableton (AudioPipe)" is in the output list. Turning it off also disconnects. */
export const audioPipeShown = featureFlag('audiopipe', 'Ableton (AudioPipe) output');

let output: NonDeviceOutput | undefined;

/** Called by createAudioPipeOutput so `enableAudioPipe` can reach the live output. */
export function bindAudioPipeOutput(next: NonDeviceOutput | undefined): void {
  output = next;
}

/** Connects or disconnects the AudioPipe output. Enabling also shows it. */
export async function enableAudioPipe(on: boolean): Promise<string> {
  if (!on) {
    output?.deactivate();
    return 'AudioPipe disconnected.';
  }
  if (!output) throw new Error('The sampler is still loading.');
  setFeatureFlag('audiopipe', true);
  await output.activate();
  return 'AudioPipe connected.';
}

// Console: `enableAudiopipe()`, pass false to disconnect. Show/hide is `setFlag('audiopipe')`.
Object.assign(window, {
  enableAudiopipe: (on = true) => enableAudioPipe(on),
});
