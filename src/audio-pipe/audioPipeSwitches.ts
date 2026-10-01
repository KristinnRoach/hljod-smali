import type { AudioPipeClient } from './AudioPipeClient';
import { featureFlag } from '@/lib/featureFlag';

// The old show/hide switch used this key. The shared flag below is authoritative.
try {
  localStorage.removeItem('audiopipe');
} catch {
  // Storage may be unavailable; the flag still works for this session.
}

// ponytail: flagged until the AudioPipe plugin is downloadable; drop the flag then.
/** Shows the toolbar toggle. Turning it off also disconnects. */
export const audioPipeShown = featureFlag('audiopipe', 'AudioPipe');

let client: AudioPipeClient | undefined;

/** Binds the live client for toolbar and console actions. */
export function bindAudioPipeClient(next: AudioPipeClient | undefined): void {
  client = next;
}

/** Connects or disconnects the AudioPipe output without changing its feature flag. */
export async function enableAudioPipe(on = true): Promise<string> {
  if (!on) {
    client?.disconnect();
    return 'AudioPipe disconnected.';
  }
  if (!client) throw new Error('The sampler is still loading.');
  await client.connect();
  return 'AudioPipe connected.';
}

// Console: `enableAudioPipe()`, pass false to disconnect. Show/hide is `setFeatureFlag('audiopipe', true)`.
Object.assign(window, { enableAudioPipe });
