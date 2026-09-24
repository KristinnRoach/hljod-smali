import { onCleanup, onMount } from 'solid-js';
import type { SamplePlayer } from '@kidlib/web-audio';
import { getMidiSupportInfo } from '@kidlib/web-audio/io';
import { showToast } from '@/ui/Toast';
import './midi-learn.css';
import { enableSamplePlayerMidi, disableSamplePlayerMidi } from './MidiMan';
import { loadMidiInputChannel } from './MidiChannelSelect';

const showMidiFailed = () =>
  showToast('MIDI initialization failed - Check if MIDI devices are connected', {
    kind: 'error',
    duration: 4000,
  });

/** Enables MIDI for the component's lifetime and reports its state as toasts. */
export const useMidi = (getSamplePlayer: () => SamplePlayer | null) => {
  const handleMidiLearn = ((e: CustomEvent<{ message: string }>) => {
    if (e.detail?.message) showToast(e.detail.message);
  }) as EventListener;

  onMount(() => {
    enableSamplePlayerMidi({
      getSamplePlayer,
      inputChannel: loadMidiInputChannel(),
      midiLearnEnabled: true,
      knobMappings: [
        { cc: 15, selector: '[data-param="highpassFilter"]', name: 'HPF' },
        { cc: 73, selector: '[data-param="lowpassFilter"]', name: 'LPF' },
      ],
    })
      .then((success) => {
        if (success) {
          showToast('MIDI enabled - Press Cmd+Shift+M to access MIDI Learn');
          return;
        }
        const { supported, message } = getMidiSupportInfo();
        if (!supported) {
          showToast(`MIDI not available - ${message}`, { duration: 5000 });
        } else {
          showMidiFailed();
        }
        console.warn('MIDI initialization failed');
      })
      .catch((error) => {
        console.error('MIDI initialization failed:', error);
        showMidiFailed();
      });

    document.addEventListener('midi:learn', handleMidiLearn);
    document.addEventListener('midi:mapping', handleMidiLearn);
  });

  onCleanup(() => {
    document.removeEventListener('midi:learn', handleMidiLearn);
    document.removeEventListener('midi:mapping', handleMidiLearn);
    disableSamplePlayerMidi();
  });
};
