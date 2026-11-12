import { createSignal } from 'solid-js';

export type RecorderInputSource = 'audio-input' | 'share' | 'resample';

export const [recorderInputSource, setRecorderInputSource] =
  createSignal<RecorderInputSource>('audio-input');

export const [recorderInputDeviceId, setRecorderInputDeviceId] = createSignal('');
