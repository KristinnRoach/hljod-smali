import { createEffect, createSignal, onCleanup, onMount, type Accessor } from 'solid-js';
import {
  createSamplePlayer,
  createGlobalAudioContext,
  getCurrentOutputDeviceId,
  setAudioOutputDevice,
  samplerParams,
  type SamplePlayer,
  type SamplerParams,
  type SupportedWaveform,
} from '@kidlib/web-audio';
import { showToast } from '@/ui/Toast';
import { stopSequence } from '@/sequence/sequenceTransport';
import {
  applyEnvelopes,
  loadEnvelopeDraft,
  persistEnvelopeDraft,
  type EnvelopeStates,
} from '@/envelopes/envelopeDraft';
import { createLevelMonitor } from '@/lib/levelMonitoring';
import {
  loadInstrument,
  loadWorkingSample,
  saveWorkingSample,
  loadBuiltinSample,
  type InstrumentIdentity,
  type InstrumentRef,
  type InstrumentSummary,
} from '@/library/instrumentLibrary';
import { enableAudioPipe } from '@/audio-pipe/audioPipeSwitches';
import {
  defaultSamplerParamValues,
  samplerParamValues,
  restoreSamplerParamValues,
  setSamplerParamValue,
  snapshotSamplerParamValues,
} from './samplerParamState';
import { connectPlayback } from './playbackState';
import { samplePlayer, setSamplePlayer, getSamplePlayer, setLoopEnabled } from './samplePlayer';

type SamplerOptions = {
  /** The keyboard's loop modifier, reapplied to each loaded sample. */
  keyboardLoopEnabled: Accessor<boolean>;
  releasePressedNotes: () => void;
  /** Runs on every `sample:loaded`, before `currentSample` updates. */
  onSampleLoaded: () => void;
};

type SampleSource = {
  sample: Parameters<SamplePlayer['loadAudio']>[0];
  ref: InstrumentRef | null;
};

/**
 * The SamplePlayer's lifecycle: create, load, edit, switch sample rate, dispose.
 * Call once in the app's Solid owner; the player itself is the `samplePlayer` signal.
 */
export function createSampler(options: SamplerOptions) {
  // The loaded sample (=== player.audiobuffer).
  const [currentSample, setCurrentSample] = createSignal<AudioBuffer>();
  // The library instrument currently loaded, if the sample still came from it.
  const [activeInstrument, setActiveInstrument] = createSignal<InstrumentIdentity | null>(null);
  // Display only: which instrument the sample came from. Kept apart from
  // `activeInstrument` because that one is SaveButton's overwrite target, and a
  // sample restored on reload must not offer to overwrite anything.
  const [loadedRef, setLoadedRef] = createSignal<InstrumentRef | null>(null);
  const [instrumentLoading, setInstrumentLoading] = createSignal(false);
  const [audioInitialized, setAudioInitialized] = createSignal(false);
  const [sampleLoaded, setSampleLoaded] = createSignal(false);
  const [samplerError, setSamplerError] = createSignal<string | null>(null);
  const [amWaveform, setAmWaveform] = createSignal<SupportedWaveform>('square');

  createEffect(() => {
    samplePlayer()?.setModulationWaveform('AM', amWaveform());
  });

  const applyParams = (player: SamplePlayer, params: SamplerParams) => {
    player.applyParams(params);
    restoreSamplerParamValues(params);
  };

  /**
   * One load at a time. `getSource` resolves the audio and the ref persisted
   * alongside it; `onLoaded` runs once the player holds the sample.
   */
  const loadSample = async <T extends SampleSource>(
    name: string,
    getSource: () => Promise<T>,
    onLoaded?: (player: SamplePlayer, source: T) => void,
  ): Promise<boolean> => {
    const player = samplePlayer();
    if (!player) return false;
    // loadAudio() throws if one is already running.
    if (instrumentLoading()) return false;

    setInstrumentLoading(true);
    const prevRef = loadedRef();
    try {
      const source = await getSource();
      // Teardown can land in that await; bail before touching loadedRef.
      if (player.disposed) return false;
      // Set before the load: `sample:loaded` fires inside it and persists
      // whatever is here alongside the sample. Rolled back if the load throws.
      setLoadedRef(source.ref);
      await player.loadAudio(source.sample, { skipPreProcessing: false });
      onLoaded?.(player, source);
      return true;
    } catch (error) {
      // A teardown mid-load rejects loadAudio; the next player owns loadedRef.
      if (player.disposed) return false;
      setLoadedRef(prevRef);
      console.error(`Failed to load “${name}”:`, error);
      showToast(`Could not load “${name}”`, { kind: 'error' });
      return false;
    } finally {
      setInstrumentLoading(false);
    }
  };

  /** Loads an audio file -- dropped or picked -- as the current sample. */
  const loadFile = async (file: File) => {
    if (!samplePlayer()) {
      showToast('Sampler is still loading', { kind: 'error' });
      return;
    }
    await loadSample(file.name, async () => ({ sample: await file.arrayBuffer(), ref: null }));
  };

  /** Resolves true once the instrument is loaded. */
  const loadLibraryInstrument = (summary: InstrumentSummary) =>
    loadSample(
      summary.name,
      () => loadInstrument(summary.ref),
      (player, instrument) => {
        applyParams(player, { ...defaultSamplerParamValues, ...instrument.params });
        applyEnvelopes(player, instrument.envelopes ?? {});

        // Summary only -- keeping the loaded instrument would pin its sample in
        // memory for as long as it stays selected.
        setActiveInstrument({ ref: instrument.ref, name: instrument.name });
      },
    );

  // Crop re-applies the identity that `sample:loaded` just cleared, because
  // that event means both "new sample" and "same sample, edited". A delete
  // landing inside this await restores a dead ref and the next save fails. Fix
  // by giving crop its own signal, not by versioning this restore.
  const crop = async () => {
    const player = samplePlayer();
    if (!player) return;

    try {
      const instrument = activeInstrument();
      const croppedBuffer = await player.cropSample();
      if (!croppedBuffer) return;

      setActiveInstrument(instrument);
      // Trim points are normalized: the crop is the new full range.
      setSamplerParamValue('trimStart', 0);
      setSamplerParamValue('trimEnd', 1);
    } catch (error) {
      console.error('Failed to crop sample:', error);
      showToast('Failed to crop sample', { kind: 'error' });
    }
  };

  // Same `sample:loaded` reset as crop. Re-pitching scales the buffer evenly,
  // so the normalized trim/loop points still mark the same audio.
  const commitPitch = async () => {
    const player = samplePlayer();
    if (!player) return;

    try {
      const instrument = activeInstrument();
      const { trimStart, trimEnd, loopStart, loopEnd } = samplerParamValues();
      const pitched = await player.commitPitch();
      if (!pitched) return;

      setActiveInstrument(instrument);
      restoreSamplerParamValues({
        trimStart,
        trimEnd,
        loopStart,
        loopEnd,
        transpose: player.transposedBySemitones,
        fineTune: player.fineTuneCents,
      });
    } catch (error) {
      console.error('Failed to commit pitch:', error);
      showToast('Failed to commit pitch', { kind: 'error' });
    }
  };

  const markSaved = (saved: InstrumentIdentity) => {
    setActiveInstrument(saved);
    setLoadedRef(saved.ref);
    // The sample is unchanged, so no `sample:loaded` fires to carry the new ref
    // to the working row. Write it through.
    const sample = samplePlayer()?.audiobuffer;
    if (sample) {
      void saveWorkingSample(sample, saved.ref).catch((error) =>
        console.error('Failed to persist working sample:', error),
      );
    }
  };

  const markDeleted = (id: number) => {
    const ref = activeInstrument()?.ref;
    if (ref?.kind === 'saved' && ref.id === id) setActiveInstrument(null);
  };

  // Disposal invalidates any initialization still awaiting samples or worklets.
  let samplerGeneration = 0;
  // Unsubscribes and teardowns for the current player.
  let disposers: (() => void)[] = [];

  const disposeSampler = () => {
    samplerGeneration++;
    const pending = disposers;
    disposers = [];
    pending.forEach((dispose) => dispose());
    setLoopEnabled(false);
    const player = getSamplePlayer();
    if (player) {
      player.dispose();
      setSamplePlayer(null);
    }
  };

  const handleSampleLoaded = (player: SamplePlayer) => {
    const audiobuffer = player.audiobuffer;
    if (!audiobuffer?.length) {
      console.error('sample:loaded fired without usable audiobuffer');
      return;
    }

    options.onSampleLoaded();
    setCurrentSample(audiobuffer);
    setSampleLoaded(true);
    setActiveInstrument(null);
    // Reapply loop state after loading, including when the player value is unchanged.
    player.setLoopEnabled(options.keyboardLoopEnabled());
    void saveWorkingSample(audiobuffer, loadedRef()).catch((error) =>
      console.error('Failed to persist working sample:', error),
    );

    // SamplePlayer resets its loop/trim points to the full buffer on load,
    // so reset the normalized controls to match instead of keeping the
    // previous sample's fractions.
    restoreSamplerParamValues({
      trimStart: samplerParams.trimStart.defaultValue,
      trimEnd: samplerParams.trimEnd.defaultValue,
      loopStart: samplerParams.loopStart.defaultValue,
      loopEnd: samplerParams.loopEnd.defaultValue,
    });
  };

  const initializeSampler = async (
    restoredSample?: AudioBuffer,
    reloadDraft = snapshotSamplerParamValues(),
    reloadEnvelopeDraft: EnvelopeStates = loadEnvelopeDraft(),
  ) => {
    const generation = ++samplerGeneration;

    // Held across the whole of init so sample loads and rate switches wait
    // for the new player.
    setInstrumentLoading(true);
    try {
      const working = restoredSample ? undefined : await loadWorkingSample();
      // No stored row means the built-in instrument is what gets loaded.
      const sample = restoredSample ?? working?.sample ?? (await loadBuiltinSample());
      if (generation !== samplerGeneration) return;
      if (!restoredSample) setLoadedRef(working ? working.ref : { kind: 'builtin' });

      const player = await createSamplePlayer({ audio: sample, polyphony: 16 });
      if (generation !== samplerGeneration) {
        player.dispose();
        return;
      }

      setSamplePlayer(player);

      // window.levelMonitor.start() meters voices through master out
      disposers.push(createLevelMonitor(player));

      setAudioInitialized(true);
      setSamplerError(null);
      setLoopEnabled(player.loopEnabled);
      disposers.push(
        player.onMessage('sample:loaded', () => handleSampleLoaded(player)),
        player.onMessage('envelope:changed', () => persistEnvelopeDraft(player)),
        player.onMessage('loop:enabled', (msg) => setLoopEnabled(msg.enabled)),
        connectPlayback(player),
      );
      player.enablePositionTracking(true);

      // createSamplePlayer resolves after its sample has loaded, before the
      // listener above existed.
      handleSampleLoaded(player);
      applyParams(player, reloadDraft);
      applyEnvelopes(player, reloadEnvelopeDraft);
      if (restoredSample) {
        player.setModulationWaveform('AM', amWaveform());
      }
    } catch (error: any) {
      if (generation !== samplerGeneration) return;
      const errText = typeof error?.message === 'string' ? error.message : String(error);
      console.error('Sampler initialization error:', error);
      setSamplerError(errText.includes('AudioWorklet') ? 'AudioWorklet not supported' : errText);
    } finally {
      if (generation === samplerGeneration) setInstrumentLoading(false);
    }
  };

  /** Rebuilds the player on a new AudioContext, carrying sample, params and envelopes over. */
  const setSampleRate = async (sampleRate: number) => {
    if (sampleRate !== 44_100 && sampleRate !== 48_000) return;
    const previous = getSamplePlayer();
    if (!previous || instrumentLoading() || previous.context.sampleRate === sampleRate) return;

    setInstrumentLoading(true);
    const identity = activeInstrument();
    const outputDevice = getCurrentOutputDeviceId(previous.context);
    let generation = samplerGeneration;
    const params = snapshotSamplerParamValues();
    const envelopes = Object.fromEntries(
      previous.envelopeIds.map((id) => [id, previous.getEnvelope(id)]),
    );
    // Loading resamples this to the new context's rate.
    const sample = previous.audiobuffer ?? undefined;
    try {
      stopSequence();
      options.releasePressedNotes();
      await enableAudioPipe(false);
      if (generation !== samplerGeneration) return;
      // Claim the generation disposeSampler bumps to, so a throw in its teardown
      // still reaches the toast and the loading reset.
      generation = samplerGeneration + 1;
      disposeSampler();
      setAudioInitialized(false);
      setSampleLoaded(false);
      await previous.context.close();
      if (generation !== samplerGeneration) return;
      const context = createGlobalAudioContext({ sampleRate });
      // A missing device must not cost the sampler; fall back to default output.
      if (outputDevice) {
        await setAudioOutputDevice(outputDevice, context).catch((error) =>
          console.warn('Could not restore output device:', error),
        );
      }
      if (generation !== samplerGeneration) return;
      generation++;
      await initializeSampler(sample, params, envelopes);
      if (generation !== samplerGeneration) return;
      setActiveInstrument(identity);
    } catch (error) {
      if (generation !== samplerGeneration) return;
      const message = error instanceof Error ? error.message : String(error);
      setSamplerError(message);
      showToast(message, { kind: 'error' });
    } finally {
      if (generation === samplerGeneration) setInstrumentLoading(false);
    }
  };

  onMount(() => {
    void initializeSampler();
    onCleanup(disposeSampler);
  });

  return {
    currentSample,
    activeInstrument,
    loadedRef,
    instrumentLoading,
    audioInitialized,
    sampleLoaded,
    samplerError,
    amWaveform,
    setAmWaveform,
    loadFile,
    loadLibraryInstrument,
    crop,
    commitPitch,
    setSampleRate,
    markSaved,
    markDeleted,
  };
}
