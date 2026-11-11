import { createEffect, onCleanup, untrack } from 'solid-js';
import { createSamplePlayer, type SamplePlayer } from '@kidlib/web-audio';
import { featureFlag } from '@/lib/featureFlag';
import { loadInstrument, type InstrumentSummary } from '@/library/instrumentLibrary';
import { applyEnvelopes } from '@/envelopes/envelopeDraft';
import { showToast } from '@/ui/Toast';
import { defaultSamplerParamValues } from './samplerParamState';
import { sampleLayers as layers, setSampleLayers as setLayers } from './samplePlayer';

// shortcut: prototype layers have no editable UI or persistence; remove the flag when layering ships.
export const sampleLayersEnabled = featureFlag('sampleLayers', 'Sample layers experiment');

export function createSampleLayers(primary: () => SamplePlayer | null) {
  let generation = 0;
  const clear = () => {
    generation++;
    layers().forEach((player) => player.dispose());
    setLayers([]);
  };

  // A context replacement or disabling the experiment also cancels pending adds.
  createEffect(() => {
    primary();
    sampleLayersEnabled();
    untrack(clear);
  });
  onCleanup(clear);

  const add = async (summary: InstrumentSummary) => {
    const main = primary();
    if (!sampleLayersEnabled() || !main || main.disposed) return;
    const mine = generation;
    let player: SamplePlayer | undefined;
    try {
      const instrument = await loadInstrument(summary.ref);
      if (mine !== generation || main.disposed) return;
      player = await createSamplePlayer({ context: main.context, polyphony: 16 });
      if (mine !== generation || main.disposed) return;
      await player.loadAudio(instrument.sample, { skipPreProcessing: true });
      if (mine !== generation || main.disposed) return;
      player.applyParams({ ...defaultSamplerParamValues, ...instrument.params });
      applyEnvelopes(player, instrument.envelopes ?? {});
      setLayers((current) => [...current, player!]);
      player = undefined;
    } catch (error) {
      if (mine !== generation || main.disposed) return;
      console.error('Failed to add sample layer:', error);
      showToast(`Could not layer “${summary.name}”`, { kind: 'error' });
    } finally {
      player?.dispose();
    }
  };

  return { layers, add, clear };
}
