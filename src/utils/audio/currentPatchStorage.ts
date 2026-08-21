import { db } from '../../db/samplelib/sampleIdb';
import { audioBufferToWav, validateWavBuffer } from './bufferUtils';

const CURRENT_PATCH_ID = 'current';

export const loadDefaultSample = async (): Promise<ArrayBuffer> => {
  const res = await fetch(`${import.meta.env.BASE_URL}audio/init_sample.webm`);
  if (!res.ok) {
    throw new Error(`Failed to fetch app default sample: ${res.status} ${res.statusText}`);
  }
  return res.arrayBuffer();
};

export const loadCurrentPatch = async (): Promise<ArrayBuffer[] | undefined> => {
  const stored = await db.workingSamples.get(CURRENT_PATCH_ID);
  if (!stored) return;

  // One bad layer invalidates the set: layer 0 is the authority for duration
  // and loop points, and a hole in the middle would silently shift the rest.
  // The shape check is not paranoia -- the v3 migration writes `layers:
  // [undefined]` for any v2 row that had no `audioData`, and validateWavBuffer
  // reads `.byteLength` straight off its argument.
  const isUsable =
    Array.isArray(stored.layers) &&
    stored.layers.length > 0 &&
    stored.layers.every((layer) => layer instanceof ArrayBuffer && validateWavBuffer(layer));

  if (isUsable) return stored.layers;

  try {
    await db.workingSamples.delete(CURRENT_PATCH_ID);
  } catch (error) {
    console.error('Failed to remove invalid current patch:', error);
  }
};

export const saveCurrentPatch = async (buffers: readonly AudioBuffer[]): Promise<void> => {
  try {
    await db.workingSamples.put({
      id: CURRENT_PATCH_ID,
      layers: buffers.map(audioBufferToWav),
    });
  } catch (error) {
    console.error('Failed to persist current patch:', error);
  }
};
