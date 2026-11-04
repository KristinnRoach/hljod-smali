// src/App.tsx
import {
  Component,
  onMount,
  createSignal,
  createEffect,
  createMemo,
  onCleanup,
  Show,
} from 'solid-js';

import {
  createSamplePlayer,
  createGlobalAudioContext,
  getCurrentOutputDeviceId,
  setAudioOutputDevice,
  keymaps,
  DEFAULT_KEYMAP_KEY,
  samplerParams,
  SamplePlayer,
  type KeymapKey,
  type SamplerParams,
  type SupportedWaveform,
} from '@kidlib/web-audio';
import ParamKnob from '@/sampler/ParamKnob';
import { bindSamplerParams } from '@/sampler/bindSamplerParams';
import Toolbar from '@/toolbar/Toolbar';

import { handleExpandCollapseClick } from '@/lib/expandCollapse';
import { showToast, ToastViewport } from '@/ui/Toast';
import { useLayout } from '@/lib/layout';
import { useFileDrop } from '@/lib/useFileDrop';
import { useMidi } from '@/io/useMidi';
import { stopSequence } from '@/sequence/sequenceTransport';
import SequenceControls, { sequenceShown } from '@/sequence/SequenceControls';
import PitchyTuner from '@/tuner/PitchyTuner';
import {
  applyEnvelopes,
  loadEnvelopeDraft,
  persistEnvelopeDraft,
  type EnvelopeStates,
} from '@/envelopes/envelopeDraft';
import { createLevelMonitor } from '@/lib/levelMonitoring';
import { registerWebmcpTools } from '@/webmcp/registerWebmcpTools';
import {
  loadInstrument,
  loadWorkingSample,
  saveWorkingSample,
  loadBuiltinSample,
  type InstrumentIdentity,
  type InstrumentRef,
  type InstrumentSummary,
} from '@/library/instrumentLibrary';
import {
  defaultSamplerParamValues,
  samplerParamValues,
  restoreSamplerParamValues,
  setSamplerParamValue,
  snapshotSamplerParamValues,
  scaleSamplerParamRange,
  zoomScaledParams,
} from '@/sampler/samplerParamState';

import Sidebar from '@/ui/Sidebar';
import Accordion from '@/ui/Accordion';
import InstrumentListSection from '@/library/InstrumentListSection';
import RowCollapseIcons from '@/ui/RowCollapseIcons';
import AudioPipePanel from '@/audio-pipe/AudioPipePanel';
import { createAudioPipe } from '@/audio-pipe/createAudioPipe';
import { enableAudioPipe } from '@/audio-pipe/audioPipeSwitches';
import { SamplerToggle, SamplerIconToggle } from '@/sampler/SamplerToggles';
import EnvelopeControls from '@/envelopes/EnvelopeControls';
import PointEnvelopeEditor from '@/envelopes/PointEnvelopeEditor';
import { createEnvelopeEditor } from '@/envelopes/createEnvelopeEditor';
import AudioWaveform from '@/ui/AudioWaveform';
import Plot from '@/ui/Plot';
import { createWaveformZoom } from '@/ui/createWaveformZoom';
import KeymapSelect from '@/io/KeymapSelect';
import PianoKeyboard from '@/io/PianoKeyboard';
import RootNoteSelect, { ROOT_NOTES, type RootNote } from '@/io/RootNoteSelect';
import SamplerStatus from '@/sampler/SamplerStatus';
import { useComputerKeyboard } from '@/io/useComputerKeyboard';
import SampleControls from '@/sampler/SampleControls';
import ModulationWaveformSelect from '@/sampler/ModulationWaveformSelect';
import { TrimRange, LoopRange } from '@/sampler/SampleRanges';
import { connectPlayback } from '@/sampler/playbackState';
import SamplePlayheads from '@/sampler/SamplePlayheads';
import {
  samplePlayer,
  setSamplePlayer,
  getSamplePlayer,
  setLoopEnabled,
} from '@/sampler/samplePlayer';

const App: Component = () => {
  bindSamplerParams(samplePlayer);
  const plotDimensions = { width: 575, height: 200 };
  let waveformViewport: SVGSVGElement | undefined;
  const waveformZoom = createWaveformZoom({
    viewport: () => waveformViewport,
    onChange: (next, previous) => scaleSamplerParamRange(zoomScaledParams(), previous, next),
    sampleCount: () => currentSample()?.length,
  });
  const envelope = createEnvelopeEditor(samplePlayer);
  const layout = useLayout();
  const audioPipe = createAudioPipe(() => samplePlayer()?.output, getSamplePlayer);

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
  const [sidebarOpen, setSidebarOpen] = createSignal(false);
  const [sidebarSection, setSidebarSection] = createSignal<'menu' | 'instruments'>('instruments');
  const [keymapKey, setKeymapKey] = createSignal<KeymapKey>(DEFAULT_KEYMAP_KEY);
  const [keyboardOctaveOffset, setKeyboardOctaveOffset] = createSignal(0);
  // Root note is a view of the transpose param: whichever control changed last wins.
  const rootNote = createMemo(
    () => ROOT_NOTES[((Math.round(samplerParamValues().transpose) % 12) + 12) % 12],
  );
  const setRootNote = (note: RootNote) => {
    const i = ROOT_NOTES.indexOf(note);
    setSamplerParamValue('transpose', i === 0 ? 0 : i - 12);
  };
  const [amWaveform, setAmWaveform] = createSignal<SupportedWaveform>('square');

  const keymap = createMemo(() => keymaps[keymapKey()]);

  const computerKeyboard = useComputerKeyboard({
    player: samplePlayer,
    keymap,
    octaveOffset: keyboardOctaveOffset,
    setOctaveOffset: setKeyboardOctaveOffset,
  });

  createEffect(() => {
    samplePlayer()?.setModulationWaveform('AM', amWaveform());
  });

  // `drive` and `clipping` write the same worklet params as the `distortion`
  // macro, and applyParams walks descriptor order, so they land after it and
  // zero it out. The reactive binding excludes them too. Remove once web-audio gives the
  // macro and its components a defined precedence.
  const applyParams = (player: SamplePlayer, params: SamplerParams) => {
    const { drive: _drive, clipping: _clipping, ...macroSafe } = params;
    player.applyParams(macroSafe);
    restoreSamplerParamValues(macroSafe);
  };

  /** Loads an audio file -- dropped or picked -- as the current sample. */
  const loadSampleFile = async (file: File) => {
    const player = samplePlayer();
    if (!player) {
      showToast('Sampler is still loading', { kind: 'error' });
      return;
    }
    // loadAudio() throws if one is already running.
    if (instrumentLoading()) return;

    setInstrumentLoading(true);
    const prevRef = loadedRef();
    try {
      const buffer = await file.arrayBuffer();
      // Teardown can land in that await, and loadAudio has no guard of its own.
      if (!player.initialized) return;
      // Set before the load: `sample:loaded` fires inside it and persists
      // whatever is here alongside the sample. Rolled back if the load throws.
      setLoadedRef(null);
      // Uploads are usually already processed; skip auto-tune and friends until
      // there is a preprocessing menu and an explicit Autotune control.
      await player.loadAudio(buffer, { skipPreProcessing: true });
    } catch (error) {
      setLoadedRef(prevRef);
      console.error('Failed to load sample:', error);
      showToast(`Could not load “${file.name}”`, { kind: 'error' });
    } finally {
      setInstrumentLoading(false);
    }
  };

  const handleInstrumentSelect = async (summary: InstrumentSummary) => {
    const player = samplePlayer();
    if (!player) return;

    // loadAudio() throws if one is already running.
    if (instrumentLoading()) return;

    setInstrumentLoading(true);
    const prevRef = loadedRef();
    try {
      const instrument = await loadInstrument(summary.ref);
      // Teardown can land in any of these awaits. dispose() clears
      // `initialized` and nulls the voice pool, and loadAudio has no guard of
      // its own, so ask the player rather than trusting the capture.
      if (!player.initialized) return;

      // Set before the load: `sample:loaded` fires inside it and persists
      // whatever is here alongside the sample. Rolled back if the load throws.
      setLoadedRef(instrument.ref);
      await player.loadAudio(instrument.sample, { skipPreProcessing: true });
      if (!player.initialized) return;

      applyParams(player, { ...defaultSamplerParamValues, ...instrument.params });
      applyEnvelopes(player, instrument.envelopes ?? {});

      // Summary only -- keeping the loaded instrument would pin its sample in
      // memory for as long as it stays selected.
      setActiveInstrument({ ref: instrument.ref, name: instrument.name });
      setSidebarOpen(false);
    } catch (error) {
      setLoadedRef(prevRef);
      console.error('Failed to load instrument:', error);
      showToast(`Could not load “${summary.name}”`, { kind: 'error' });
    } finally {
      setInstrumentLoading(false);
    }
  };

  // Crop re-applies the identity that `sample:loaded` just cleared, because
  // that event means both "new sample" and "same sample, edited". A delete
  // landing inside this await restores a dead ref and the next save fails. Fix
  // by giving crop its own signal, not by versioning this restore.
  const handleCrop = async () => {
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
  const handleCommitPitch = async () => {
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

  const handleSaved = (saved: InstrumentIdentity) => {
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

  // Drop an audio file anywhere on the page to load it.
  const draggingFiles = useFileDrop((files) => {
    if (files.length > 1) showToast('Drop one sample at a time', { kind: 'error' });
    else if (files[0]) void loadSampleFile(files[0]);
  });
  useMidi(getSamplePlayer);

  // Disposal invalidates any initialization still awaiting samples or worklets.
  let samplerGeneration = 0;
  let player: SamplePlayer | undefined;
  let unsubscribeSampleLoaded: (() => void) | undefined;
  let unsubscribeEnvelopeChanged: (() => void) | undefined;
  let unsubscribeLoopEnabled: (() => void) | undefined;
  let disconnectPlayback: (() => void) | undefined;
  let disposeLevelMonitor: (() => void) | undefined;

  const disposeSampler = () => {
    samplerGeneration++;
    unsubscribeSampleLoaded?.();
    unsubscribeEnvelopeChanged?.();
    unsubscribeLoopEnabled?.();
    disconnectPlayback?.();
    disposeLevelMonitor?.();
    unsubscribeSampleLoaded = undefined;
    unsubscribeEnvelopeChanged = undefined;
    unsubscribeLoopEnabled = undefined;
    disconnectPlayback = undefined;
    disposeLevelMonitor = undefined;
    setLoopEnabled(false);
    if (player) {
      player.dispose();
      player = undefined;
      setSamplePlayer(null);
    }
  };

  const handleSampleLoaded = (samplePlayer: SamplePlayer) => {
    const audiobuffer = samplePlayer.audiobuffer;
    if (!audiobuffer?.length) {
      console.error('sample:loaded fired without usable audiobuffer');
      return;
    }

    waveformZoom.resetViewport();
    setCurrentSample(audiobuffer);
    setSampleLoaded(true);
    setActiveInstrument(null);
    // Reapply loop state after loading, including when the player value is unchanged.
    samplePlayer.setLoopEnabled(computerKeyboard.loopEnabled());
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

      const createdPlayer = await createSamplePlayer({ audio: sample, polyphony: 16 });
      if (generation !== samplerGeneration) {
        createdPlayer.dispose();
        return;
      }

      player = createdPlayer;
      setSamplePlayer(createdPlayer);

      // window.levelMonitor.start() meters voices through master out
      disposeLevelMonitor = createLevelMonitor(createdPlayer);

      setAudioInitialized(true);
      setSamplerError(null);
      unsubscribeSampleLoaded = createdPlayer.onMessage('sample:loaded', () =>
        handleSampleLoaded(createdPlayer),
      );
      unsubscribeEnvelopeChanged = createdPlayer.onMessage('envelope:changed', () =>
        persistEnvelopeDraft(createdPlayer),
      );
      setLoopEnabled(createdPlayer.loopEnabled);
      unsubscribeLoopEnabled = createdPlayer.onMessage('loop:enabled', (msg) =>
        setLoopEnabled(msg.enabled),
      );
      disconnectPlayback = connectPlayback(createdPlayer);
      createdPlayer.enablePositionTracking(true);

      // createSamplePlayer resolves after its sample has loaded, before the
      // listener above existed.
      handleSampleLoaded(createdPlayer);
      applyParams(createdPlayer, reloadDraft);
      applyEnvelopes(createdPlayer, reloadEnvelopeDraft);
      if (restoredSample) {
        createdPlayer.setModulationWaveform('AM', amWaveform());
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

  const updateSampleRate = async (sampleRate: number) => {
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
      computerKeyboard.releasePressedNotes();
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
    const unregisterWebmcpTools = registerWebmcpTools(() => {
      const player = samplePlayer();
      return {
        ready: sampleLoaded() && !instrumentLoading() && !samplerError(),
        loading: instrumentLoading(),
        error: samplerError(),
        audioContextState: player?.context.state ?? null,
        sampleDurationSeconds: player?.sampleDuration ?? null,
        activeInstrument: activeInstrument(),
        params: snapshotSamplerParamValues(),
      };
    });

    void initializeSampler();

    onCleanup(() => {
      unregisterWebmcpTools();
      disposeSampler();
    });
  });

  return (
    <>
      <ToastViewport />
      <div class="drop-overlay" classList={{ __active: draggingFiles() }} aria-hidden="true">
        Drop audio files to load
      </div>
      <div class="content-wrapper">
        <Sidebar
          isOpen={sidebarOpen()}
          onClose={() => setSidebarOpen(false)}
          title="Instrument Library"
        >
          <Accordion
            sections={[
              {
                id: 'instruments',
                title: '',
                content: (
                  <InstrumentListSection
                    onInstrumentSelect={handleInstrumentSelect}
                    loadedRef={loadedRef()}
                    onInstrumentDeleted={(id) => {
                      const ref = activeInstrument()?.ref;
                      if (ref?.kind === 'saved' && ref.id === id) setActiveInstrument(null);
                    }}
                  />
                ),
              },
            ]}
            openSectionId={sidebarSection()}
            onSectionChange={setSidebarSection}
          />
        </Sidebar>

        <div class="sampler-w-toolbar">
          <Toolbar
            player={samplePlayer()}
            sample={currentSample()}
            instrument={activeInstrument()}
            sampleLoaded={sampleLoaded()}
            instrumentLoading={instrumentLoading()}
            sidebarOpen={sidebarOpen()}
            audioPipeActive={audioPipe.active()}
            onOpenLibrary={() => {
              setSidebarSection('instruments');
              setSidebarOpen(true);
            }}
            onSaved={handleSaved}
            onSampleRateChange={updateSampleRate}
          />

          <div
            class={`control-grid layout-${layout()}`}
            id="sampler-container"
            onClick={(event) => handleExpandCollapseClick(event.currentTarget, event.target)}
          >
            <fieldset class="control-group env-group">
              <legend class="expandable-legend">Envelopes</legend>
              <div class="expandable-content">
                <EnvelopeControls
                  envId={envelope.envId()}
                  envIds={envelope.envIds()}
                  state={envelope.state()}
                  sampleDuration={envelope.sampleDuration()}
                  durationRatio={envelope.durationRatio()}
                  onIdChange={envelope.setEnvId}
                  onUpdate={envelope.update}
                  onDurationRatioChange={envelope.setDurationRatio}
                  onReset={envelope.reset}
                />
                <div class="waveform-plot">
                  <Plot dimensions={plotDimensions} ref={waveformZoom.attach}>
                    <AudioWaveform
                      dimensions={plotDimensions}
                      ref={(element) => (waveformViewport = element)}
                      buffer={currentSample()}
                      start={waveformZoom.range().start}
                      end={waveformZoom.range().end}
                    >
                      <TrimRange />
                      <LoopRange />
                    </AudioWaveform>
                    <Show when={envelope.enabledState()}>
                      {(state) => (
                        <PointEnvelopeEditor
                          dimensions={plotDimensions}
                          state={state()}
                          onChange={envelope.commit}
                          axis={envelope.axis()}
                          resetToken={envelope.resetToken()}
                        />
                      )}
                    </Show>
                    <SamplePlayheads
                      start={waveformZoom.range().start}
                      end={waveformZoom.range().end}
                      distinguishVoices
                    />
                  </Plot>
                  <Show when={waveformZoom.range().end - waveformZoom.range().start < 1}>
                    <button
                      type="button"
                      class="waveform-zoom-reset"
                      aria-label="Reset waveform zoom"
                      onClick={waveformZoom.reset}
                    >
                      <span class="zoom-icon">⌕</span> ↺
                    </button>
                  </Show>
                </div>
              </div>
            </fieldset>

            <SampleControls
              player={samplePlayer()}
              sampleLoaded={sampleLoaded()}
              onFile={loadSampleFile}
            />

            <fieldset id="space-group" class="control-group space-group">
              <legend class="expandable-legend">Space</legend>
              <div class="expandable-content knob-grid">
                <ParamKnob param="dryWet" player={samplePlayer()} />
                <ParamKnob param="reverbSend" label="Reverb" player={samplePlayer()} />
                <ParamKnob param="reverbSize" label="Size" player={samplePlayer()} />
                <ParamKnob param="delaySend" label="Delay" player={samplePlayer()} />
                <ParamKnob param="delayTime" label="Time" player={samplePlayer()} />
                <ParamKnob param="delayFeedback" label="Feedback" player={samplePlayer()} />
              </div>
            </fieldset>

            <fieldset class="control-group filter-group">
              <legend class="expandable-legend">Filters</legend>
              <div class="expandable-content knob-grid">
                <ParamKnob param="highpassFilter" player={samplePlayer()} />
                <ParamKnob param="lowpassFilter" player={samplePlayer()} />
              </div>
            </fieldset>

            <fieldset class="control-group tune-group">
              <legend class="expandable-legend">Tune</legend>
              <div class="expandable-content flex-col">
                <div class="flex-row">
                  <ParamKnob param="transpose" step={1} fineStep={0.01} player={samplePlayer()} />
                  <ParamKnob param="fineTune" player={samplePlayer()} />
                </div>
                <button class="crop-button" onClick={handleCommitPitch}>
                  Commit
                </button>
                {/* Keyed: a sample-rate change replaces the player and its context. */}
                <Show when={samplePlayer()} keyed>
                  {(player) => <PitchyTuner source={player.output} layout="row" width="90%" />}
                </Show>
              </div>
            </fieldset>

            <fieldset class="control-group misc-group">
              <legend class="expandable-legend">Dirt</legend>
              <div class="expandable-content knob-grid">
                <ParamKnob param="distortion" player={samplePlayer()} />
                <div
                  class="am-modulation-composite"
                  style="display: inline-flex; flex-direction: column; align-items: center; gap: 2px;"
                >
                  <ParamKnob param="amMod" label="AM" player={samplePlayer()} />
                  <span style="display: flex; flex-direction: row; align-items: space-between; gap: 4px;">
                    <ModulationWaveformSelect value={amWaveform()} onChange={setAmWaveform} />
                    <input
                      style="text-align: center;"
                      type="number"
                      inputmode="numeric"
                      pattern="[0-9]*"
                      min="-4"
                      max="3"
                      value="1"
                      on:change={(e) =>
                        samplePlayer()?.setAMModOctaveOffset(Number(e.target.value))
                      }
                    />
                  </span>
                </div>
              </div>
            </fieldset>

            <fieldset class="control-group loop-group">
              <legend class="expandable-legend">Loop</legend>
              <div class="expandable-content knob-grid">
                <div class="flex-col">
                  <div class="flex-row">
                    <ParamKnob
                      param="loopStart"
                      showZoomToggle
                      label="Start"
                      player={samplePlayer()}
                      // minAllowed={() => samplerParamValues().trimStart}
                      // maxAllowed={() => samplerParamValues().loopEnd}
                      detentAt={() => samplerParamValues().loopEnd}
                    />
                    {/* <ParamKnob
                      param="loopEnd"
                      showZoomToggle
                      label="End"
                      player={samplePlayer()}
                      // minAllowed={() => samplerParamValues().loopStart}
                      // maxAllowed={() => samplerParamValues().trimEnd}
                      detentAt={() => samplerParamValues().loopStart}
                    /> */}
                    <ParamKnob
                      param="loopDuration"
                      label="Duration"
                      player={samplePlayer()}
                      detentAt={() => 0.0}
                    />
                  </div>
                  <ParamKnob
                    param="loopLengthGlide"
                    label="Glide"
                    layout="row"
                    size={30}
                    player={samplePlayer()}
                  />
                </div>
                <ParamKnob param="keytrackLoop" label="KeyTrack" player={samplePlayer()} />
                <div class="flex-col">
                  <ParamKnob param="loopDurationDrift" label="Drift" player={samplePlayer()} />
                  <SamplerToggle param="panDrift" class="flex-row-center" player={samplePlayer()} />
                </div>
              </div>
            </fieldset>

            <fieldset class="control-group trim-group">
              <legend class="expandable-legend">Trim</legend>
              <div class="expandable-content flex-col">
                <div class="flex-row">
                  <ParamKnob param="trimStart" showZoomToggle player={samplePlayer()} />
                  <ParamKnob param="trimEnd" showZoomToggle player={samplePlayer()} />
                </div>
                <button class="crop-button" onClick={handleCrop}>
                  Crop
                </button>
              </div>
            </fieldset>

            <fieldset class="control-group feedback-group">
              <legend class="expandable-legend">Feedback</legend>
              <div class="expandable-content knob-grid">
                <ParamKnob param="feedback" label="Amount" player={samplePlayer()} />
                <ParamKnob param="feedbackPitch" label="Pitch" player={samplePlayer()} />
                <ParamKnob param="feedbackLpf" label="Lowpass" player={samplePlayer()} />
                {/* <ParamKnob param="feedbackDecay" label="Decay" player={samplePlayer()} /> */}

                <SamplerToggle
                  param="feedbackMode"
                  class="flex-col-center"
                  player={samplePlayer()}
                />
              </div>
            </fieldset>

            <div class="lfo-container">
              <fieldset class="control-group amp-lfo-group">
                <legend class="expandable-legend">Amp LFO</legend>
                <div class="expandable-content knob-grid">
                  <div class="flex-col">
                    <ParamKnob param="gainLFORate" label="Rate" player={samplePlayer()} />
                    <SamplerToggle param="gainLFOSync" player={samplePlayer()} />
                  </div>
                  <ParamKnob param="gainLFODepth" label="Depth" player={samplePlayer()} />
                </div>
              </fieldset>

              <fieldset class="control-group pitch-lfo-group">
                <legend class="expandable-legend">Pitch LFO</legend>
                <div class="expandable-content knob-grid">
                  <div class="flex-col">
                    <ParamKnob param="pitchLFORate" label="Rate" player={samplePlayer()} />
                    <SamplerToggle param="pitchLFOSync" player={samplePlayer()} />
                  </div>
                  <ParamKnob param="pitchLFODepth" label="Depth" player={samplePlayer()} />
                </div>
              </fieldset>
            </div>

            <fieldset class="control-group toggle-group">
              <legend class="expandable-legend">Toggles</legend>
              <div class="expandable-content">
                <SamplerToggle
                  param="timestretch"
                  player={samplePlayer()}
                  class="sampler-toggle-container"
                />
                <SamplerIconToggle param="playbackDirection" player={samplePlayer()} />
                <SamplerIconToggle param="loopLock" player={samplePlayer()} />
                <SamplerIconToggle param="holdLock" player={samplePlayer()} />
                <SamplerIconToggle param="pingPong" player={samplePlayer()} />
                <SamplerIconToggle param="pitch" player={samplePlayer()} />
                <SamplerStatus
                  audioInitialized={audioInitialized()}
                  sampleLoaded={sampleLoaded()}
                  error={samplerError()}
                />
              </div>
            </fieldset>

            <fieldset class="control-group keyboard-group">
              <legend class="expandable-legend">Keyboard</legend>
              <div class="expandable-content knob-grid">
                <PianoKeyboard
                  player={samplePlayer()}
                  keymap={keymap()}
                  octaveOffset={keyboardOctaveOffset()}
                  rootNote={rootNote()}
                  pressedNotes={computerKeyboard.pressedNotes()}
                  height={80}
                />
                <div class="keyboard-controls">
                  <div class="flex-row">
                    <RootNoteSelect value={rootNote()} onChange={setRootNote} />
                    <KeymapSelect value={keymapKey()} onChange={setKeymapKey} />
                  </div>

                  <ParamKnob param="glide" player={samplePlayer()} />
                </div>
              </div>
            </fieldset>

            <RowCollapseIcons />
          </div>
        </div>

        {/* Unmounting stops any recording or playback, via SequenceControls' onCleanup. */}
        <Show when={sequenceShown()}>
          <SequenceControls />
        </Show>
      </div>
      <AudioPipePanel state={audioPipe.state} />
    </>
  );
};

export default App;
