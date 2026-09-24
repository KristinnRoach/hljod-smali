// src/App.tsx
import { Component, onMount, createSignal, createEffect, createMemo, onCleanup } from 'solid-js';

import {
  createSamplePlayer,
  keymaps,
  DEFAULT_KEYMAP_KEY,
  samplerParams,
  SamplePlayer,
  type KeymapKey,
  type SamplerParams,
  type SupportedWaveform,
} from '@kidlib/web-audio';
import ParamKnob from '@/sampler/ParamKnob';
import SampleWaveformFilled from '@/ui/icons/SampleWaveformFilled';

import { handleExpandCollapseClick } from '@/lib/expandCollapse';
import { showToast, ToastViewport } from '@/ui/Toast';
import { useLayout } from '@/lib/layout';
import { useFileDrop } from '@/lib/useFileDrop';
import { log } from '@/lib/log';
import { useMidi } from '@/io/useMidi';
import MidiChannelSelect from '@/io/MidiChannelSelect';
import { applyEnvelopes, loadEnvelopeDraft, persistEnvelopeDraft } from '@/envelopes/envelopeDraft';
// Dev-only; the DEV guard at its call site lets the bundler drop it in prod.
import { installAudioDebug } from '@/lib/audioDebug';
import {
  loadInstrument,
  loadWorkingSamples,
  saveWorkingSamples,
  loadBuiltinSamples,
  MAX_SAMPLES,
  type InstrumentIdentity,
  type InstrumentRef,
  type InstrumentSummary,
} from '@/library/instrumentLibrary';
import {
  recorderInputDeviceId,
  recorderInputSource,
  setRecorderInputDeviceId,
} from '@/sampler/recorderSettings';
import {
  defaultSamplerParamValues,
  samplerParamValues,
  restoreSamplerParamValues,
  setSamplerParamValue,
  snapshotSamplerParamValues,
} from '@/sampler/samplerParamState';

import { ThemeToggle } from '@/ui/ThemeToggle';
import SaveButton from '@/library/SaveButton';
import Sidebar from '@/ui/Sidebar';
import Accordion from '@/ui/Accordion';
import InstrumentListSection from '@/library/InstrumentListSection';
import RowCollapseIcons from '@/ui/RowCollapseIcons';
import OutputDeviceSelect from '@/io/OutputDeviceSelect';
import AudioPipePanel from '@/audio-pipe/AudioPipePanel';
import InputDeviceSelect from '@/io/InputDeviceSelect';
import { SamplerToggle, SamplerIconToggle } from '@/sampler/SamplerToggles';
import EnvelopeEditor from '@/envelopes/EnvelopeEditor';
import AudioWaveform from '@/sampler/AudioWaveform';
import KeymapSelect from '@/io/KeymapSelect';
import PianoKeyboard from '@/io/PianoKeyboard';
import RootNoteSelect, { type RootNote } from '@/io/RootNoteSelect';
import SamplerStatus from '@/sampler/SamplerStatus';
import { useComputerKeyboard } from '@/io/useComputerKeyboard';
import SampleControls from '@/sampler/SampleControls';
import ModulationWaveformSelect from '@/sampler/ModulationWaveformSelect';
import { samplePlayer, setSamplePlayer, getSamplePlayer } from '@/sampler/samplePlayer';

const App: Component = () => {
  const layout = useLayout();

  // Every loaded sample. `[0]` is the authority sample (=== player.audiobuffer).
  const [currentSamples, setCurrentSamples] = createSignal<AudioBuffer[]>([]);
  // The library instrument currently loaded, if the samples still came from it.
  const [activeInstrument, setActiveInstrument] = createSignal<InstrumentIdentity | null>(null);
  // Display only: which instruments fed the current layers, base first. Kept
  // apart from `activeInstrument` because that one is SaveButton's overwrite
  // target, and a stack must never offer to overwrite the instrument it
  // started from.
  const [loadedRefs, setLoadedRefs] = createSignal<InstrumentRef[]>([]);
  const [instrumentLoading, setInstrumentLoading] = createSignal(false);
  const [audioInitialized, setAudioInitialized] = createSignal(false);
  const [sampleLoaded, setSampleLoaded] = createSignal(false);
  const [samplerError, setSamplerError] = createSignal<string | null>(null);
  const [toolbarOpen, setToolbarOpen] = createSignal(false);
  const [sidebarOpen, setSidebarOpen] = createSignal(false);
  const [sidebarSection, setSidebarSection] = createSignal<'menu' | 'instruments'>('instruments');
  const [keymapKey, setKeymapKey] = createSignal<KeymapKey>(DEFAULT_KEYMAP_KEY);
  const [keyboardOctaveOffset, setKeyboardOctaveOffset] = createSignal(0);
  const [rootNote, setRootNote] = createSignal<RootNote>('C');
  const [amWaveform, setAmWaveform] = createSignal<SupportedWaveform>('square');

  const keymap = createMemo(() => keymaps[keymapKey()]);

  const computerKeyboard = useComputerKeyboard({
    player: samplePlayer,
    keymap,
    octaveOffset: keyboardOctaveOffset,
    setOctaveOffset: setKeyboardOctaveOffset,
  });

  createEffect(() => {
    samplePlayer()?.setRootNote(rootNote());
  });

  createEffect(() => {
    samplePlayer()?.setModulationWaveform('AM', amWaveform());
  });

  // `drive` and `clipping` write the same worklet params as the `distortion`
  // macro, and applyParams walks descriptor order, so they land after it and
  // zero it out. Neither has a knob here. Remove once web-audio gives the
  // macro and its components a defined precedence.
  const applyParams = (player: SamplePlayer, params: SamplerParams) => {
    const { drive: _drive, clipping: _clipping, ...macroSafe } = params;
    player.applyParams(macroSafe);
    restoreSamplerParamValues(macroSafe);
  };

  /** Loads audio files -- dropped or picked -- as the current samples. */
  const loadSampleFiles = async (files: readonly File[]) => {
    const player = samplePlayer();
    if (files.length === 0) return;
    if (!player) {
      showToast('Sampler is still loading', { kind: 'error' });
      return;
    }
    // loadLayers() throws if one is already running.
    if (instrumentLoading()) return;

    if (files.length > MAX_SAMPLES) {
      // The package truncates silently past the cap, so say so here.
      showToast(`Max ${MAX_SAMPLES} samples`, { kind: 'error' });
      return;
    }

    setInstrumentLoading(true);
    let prevRefs: InstrumentRef[] | undefined;
    try {
      const buffers = await Promise.all(files.map((file) => file.arrayBuffer()));
      // Teardown can land in that await, and loadLayers has no guard of its own.
      if (!player.initialized) return;
      // Set before the load: `sample:loaded` fires inside it and persists
      // whatever is here alongside the layers. Rolled back if the load throws.
      prevRefs = loadedRefs();
      setLoadedRefs([]);
      await player.loadLayers(buffers);
    } catch (error) {
      if (prevRefs) setLoadedRefs(prevRefs);
      console.error('Failed to load samples:', error);
      showToast(`Could not load “${files[0].name}”`, { kind: 'error' });
    } finally {
      setInstrumentLoading(false);
    }
  };

  // Shift-click stacks onto the current samples instead of replacing; tracked in #7.
  const handleInstrumentSelect = async (summary: InstrumentSummary, stack = false) => {
    const player = samplePlayer();
    if (!player) return;

    // Skip if it's a stack and the sample for this instrumentsummary is already in the stack
    if (
      stack &&
      loadedRefs().some(
        (ref) => ref.kind === 'saved' && summary.ref.kind === 'saved' && ref.id === summary.ref.id,
      )
    ) {
      showToast(`“${summary.name}” is already selected`, { kind: 'info' });
      return;
    }

    // loadLayers() throws if one is already running. A dropped replace-click is
    // just a duplicate, but a dropped stack-click loses a deliberate sample, so
    // that one says something.
    if (instrumentLoading()) {
      if (stack) showToast('Still loading', { kind: 'error' });
      return;
    }

    setInstrumentLoading(true);
    let prevRefs: InstrumentRef[] | undefined;
    try {
      const instrument = await loadInstrument(summary.ref);
      // Teardown can land in any of these awaits. dispose() clears
      // `initialized` and nulls the voice pool, and loadLayers has no guard of
      // its own, so ask the player rather than trusting the capture.
      if (!player.initialized) return;

      const samples = stack ? [...player.layers, ...instrument.samples] : instrument.samples;
      if (samples.length > MAX_SAMPLES) {
        // The package truncates silently past the cap, so say so here.
        showToast(`Max ${MAX_SAMPLES} samples`, { kind: 'error' });
        return;
      }

      // Set before the load: `sample:loaded` fires inside it and persists
      // whatever is here alongside the layers. Rolled back if the load throws.
      prevRefs = loadedRefs();
      setLoadedRefs(stack ? [...prevRefs, instrument.ref] : [instrument.ref]);
      await player.loadLayers(samples, undefined, { skipPreProcessing: true });
      if (!player.initialized) return;

      // A stack is not the instrument it started from, so it keeps no identity
      // and no params -- handleSampleLoaded already cleared both.
      if (stack) {
        log(`Samples: ${player.layers.length}`);
        return;
      }

      applyParams(player, { ...defaultSamplerParamValues, ...instrument.params });
      applyEnvelopes(player, instrument.envelopes ?? {});

      // Summary only -- keeping the loaded instrument would pin its samples in
      // memory for as long as it stays selected.
      setActiveInstrument({ ref: instrument.ref, name: instrument.name });
      setSidebarOpen(false);
    } catch (error) {
      if (prevRefs) setLoadedRefs(prevRefs);
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

  const handleSaved = (saved: InstrumentIdentity) => {
    setActiveInstrument(saved);
    setLoadedRefs([saved.ref]);
    // The layers are unchanged, so no `sample:loaded` fires to carry the new
    // ref to the working row. Write it through.
    const player = samplePlayer();
    if (player) {
      void saveWorkingSamples(player.layers, [saved.ref]).catch((error) =>
        console.error('Failed to persist working samples:', error),
      );
    }
  };

  // Drop audio files anywhere on the page to load them.
  const draggingFiles = useFileDrop((files) => void loadSampleFiles(files));
  useMidi(getSamplePlayer);

  onMount(() => {
    let disposed = false;
    let player: SamplePlayer | undefined;
    let unsubscribeSampleLoaded: (() => void) | undefined;
    let unsubscribeEnvelopeChanged: (() => void) | undefined;
    let uninstallAudioDebug: (() => void) | undefined;
    const reloadDraft = snapshotSamplerParamValues();
    const reloadEnvelopeDraft = loadEnvelopeDraft();

    const webmcp = new AbortController();
    void document.modelContext?.registerTool(
      {
        name: 'play_note',
        description: 'Play a MIDI note on the current sampler.',
        inputSchema: {
          type: 'object',
          properties: {
            midiNote: { type: 'number', description: 'MIDI note number to play.' },
            velocity: { type: 'number', description: 'Optional MIDI velocity.' },
            glideTime: { type: 'number', description: 'Optional glide time in seconds.' },
          },
          required: ['midiNote'],
        },
        execute: ({ midiNote, velocity, glideTime }) =>
          samplePlayer()?.play(midiNote, velocity, glideTime),
      },
      { signal: webmcp.signal },
    );

    const handleSampleLoaded = (samplePlayer: SamplePlayer) => {
      const audiobuffer = samplePlayer.audiobuffer;
      if (!audiobuffer?.length) {
        console.error('sample:loaded fired without usable audiobuffer');
        return;
      }

      setCurrentSamples([...samplePlayer.layers]);
      setSampleLoaded(true);
      setActiveInstrument(null);
      // Temporary until @kidlib/web-audio preserves voice configuration on load.
      samplePlayer.voicePool.applyToAllVoices((voice) =>
        voice.setLoopEnabled(computerKeyboard.loopEnabled()),
      );
      void saveWorkingSamples(samplePlayer.layers, loadedRefs()).catch((error) =>
        console.error('Failed to persist working samples:', error),
      );

      // SamplePlayer resets its loop/trim points to the full buffer on load,
      // so reset the normalized controls to match instead of keeping the
      // previous sample's fractions.
      (['trimStart', 'trimEnd', 'loopStart', 'loopEnd'] as const).forEach((key) =>
        setSamplerParamValue(key, samplerParams[key].defaultValue),
      );
    };

    void (async () => {
      // Held across the whole of init: the player is published to
      // `samplePlayer()` before the restore below finishes, and a drop landing
      // in that window would race loadLayers against the restore.
      setInstrumentLoading(true);
      try {
        const working = await loadWorkingSamples();
        // No stored row means the built-in instrument is what gets loaded.
        const samples = working?.samples ?? (await loadBuiltinSamples());
        setLoadedRefs(working?.refs ?? [{ kind: 'builtin' }]);

        // decodeAudioData detaches its input, so hand createSamplePlayer a copy
        // -- the restore below needs samples[0] intact.
        const createdPlayer = await createSamplePlayer(samples[0].slice(0), { polyphony: 16 });
        if (disposed) {
          createdPlayer.dispose();
          return;
        }

        player = createdPlayer;
        setSamplePlayer(createdPlayer);
        // dev-only: window.audioDebug.start() meters voices through master out
        if (import.meta.env.DEV) {
          uninstallAudioDebug = installAudioDebug(createdPlayer);
        }
        setAudioInitialized(true);
        setSamplerError(null);
        unsubscribeSampleLoaded = createdPlayer.onMessage('sample:loaded', () =>
          handleSampleLoaded(createdPlayer),
        );
        unsubscribeEnvelopeChanged = createdPlayer.onMessage('envelope:changed', () =>
          persistEnvelopeDraft(createdPlayer),
        );

        // createSamplePlayer only takes one buffer; restore the rest of the
        // stack now that the player exists.
        if (samples.length > 1) {
          await createdPlayer.loadLayers(samples, undefined, { skipPreProcessing: true });
          // Teardown can land inside that await. Everything below touches the
          // player or persists state, and handleSampleLoaded writes the working
          // samples, so a disposed player must not reach it.
          if (disposed) return;
        }

        // createSamplePlayer resolves after its initial sample has loaded.
        handleSampleLoaded(createdPlayer);
        applyParams(createdPlayer, reloadDraft);
        applyEnvelopes(createdPlayer, reloadEnvelopeDraft);
      } catch (error: any) {
        const errText = typeof error?.message === 'string' ? error.message : String(error);
        console.error('Sampler initialization error:', error);
        setSamplerError(errText.includes('AudioWorklet') ? 'AudioWorklet not supported' : errText);
      } finally {
        setInstrumentLoading(false);
      }
    })();

    onCleanup(() => {
      disposed = true;
      webmcp.abort();
      unsubscribeSampleLoaded?.();
      unsubscribeEnvelopeChanged?.();
      uninstallAudioDebug?.();
      if (player) {
        player.dispose();
        setSamplePlayer(null);
      }
    });
  });

  return (
    <>
      <ToastViewport />
      <div class="drop-overlay" classList={{ __active: draggingFiles() }} aria-hidden="true">
        Drop audio files to load
      </div>
      {import.meta.env.DEV && <AudioPipePanel source={samplePlayer()?.output} />}
      <div class="content-wrapper">
        <div
          class={`toolbar-wrapper ${toolbarOpen() ? '__toolbar-open' : ''} ${sidebarOpen() ? '__sidebar-open' : ''}`}
        >
          <button
            type="button"
            title="Toggle Toolbar"
            onClick={() => setToolbarOpen(!toolbarOpen())}
            class={`toolbar-toggle ${sidebarOpen() ? '__toolbar-open' : ''}`}
          >
            <svg width="20" height="20" stroke="10" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 6h18v2H3V6m0 5h18v2H3v-2m0 5h18v2H3v-2Z" />
            </svg>
          </button>

          <div class={`expandable-width ${toolbarOpen() ? '__toolbar-open' : ''}`}>
            <button
              type="button"
              title="View saved instruments"
              onClick={() => {
                setSidebarSection('instruments');
                setSidebarOpen(true);
              }}
              class={`toolbar-btn ${sidebarOpen() ? '__toolbar-open' : ''}`}
            >
              <SampleWaveformFilled
                fill={'white'}
                stroke={'white'}
                stroke-width={6}
                width={30}
                height={30}
              />
            </button>

            <SaveButton
              samples={currentSamples()}
              player={samplePlayer()}
              instrument={activeInstrument()}
              disabled={!sampleLoaded()}
              class={`toolbar-btn ${toolbarOpen() ? '__toolbar-open' : ''}`}
              onSavedCallback={handleSaved}
            />

            <ThemeToggle
              class={`toolbar-btn ${toolbarOpen() ? '__toolbar-open' : ''}`}
              defaultTheme="light"
            />

            <InputDeviceSelect
              class={`toolbar-btn input-device-select ${toolbarOpen() ? '__toolbar-open' : ''}`}
              disabled={recorderInputSource() !== 'audio-input'}
              value={recorderInputDeviceId()}
              onChange={setRecorderInputDeviceId}
            />

            <OutputDeviceSelect
              class={`toolbar-btn output-device-select ${toolbarOpen() ? '__toolbar-open' : ''}`}
            />

            <MidiChannelSelect
              class={`toolbar-btn input-device-select ${toolbarOpen() ? '__toolbar-open' : ''}`}
            />
          </div>
        </div>

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
                    loadedRefs={loadedRefs()}
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

        <div
          class={`control-grid layout-${layout()}`}
          id="sampler-container"
          onClick={(event) => handleExpandCollapseClick(event.currentTarget, event.target)}
        >
          <fieldset class="control-group env-group">
            <legend class="expandable-legend">Envelopes</legend>
            <div class="expandable-content">
              <div class="flex-col">
                <EnvelopeEditor
                  player={samplePlayer()}
                  underlay={<AudioWaveform buffer={currentSamples()[0]} />}
                />
              </div>
            </div>
          </fieldset>

          <SampleControls
            player={samplePlayer()}
            sampleLoaded={sampleLoaded()}
            onFiles={loadSampleFiles}
          />

          <fieldset id="space-group" class="control-group space-group">
            <legend class="expandable-legend">Space</legend>
            <div class="expandable-content">
              <ParamKnob param="dryWet" player={samplePlayer()} />
              <ParamKnob param="reverbSend" label="RevSend" player={samplePlayer()} />
              <ParamKnob param="reverbSize" label="RevSize" player={samplePlayer()} />
              <ParamKnob param="delaySend" label="Delay" player={samplePlayer()} />
              <ParamKnob param="delayTime" label="Time" player={samplePlayer()} />
              <ParamKnob param="delayFeedback" label="FB" player={samplePlayer()} />
            </div>
          </fieldset>

          <fieldset class="control-group filter-group">
            <legend class="expandable-legend">Filters</legend>
            <div class="expandable-content">
              <ParamKnob param="highpassFilter" player={samplePlayer()} />
              <ParamKnob param="lowpassFilter" player={samplePlayer()} />
            </div>
          </fieldset>

          <fieldset class="control-group misc-group">
            <legend class="expandable-legend">Dirt</legend>
            <div class="expandable-content">
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
                    on:change={(e) => samplePlayer()?.setAMModOctaveOffset(Number(e.target.value))}
                  />
                </span>
              </div>
            </div>
          </fieldset>

          <fieldset class="control-group loop-group">
            <legend class="expandable-legend">Loop</legend>
            <div class="expandable-content">
              <ParamKnob
                param="loopStart"
                label="Start"
                player={samplePlayer()}
                minAllowed={() => samplerParamValues().trimStart}
                maxAllowed={() => samplerParamValues().loopEnd}
              />
              <ParamKnob
                param="loopEnd"
                label="End"
                player={samplePlayer()}
                minAllowed={() => samplerParamValues().loopStart}
                maxAllowed={() => samplerParamValues().trimEnd}
              />
              <ParamKnob param="keytrackLoop" label="KeyTrack" player={samplePlayer()} />
              <div class="flex-col">
                <ParamKnob param="loopDurationDrift" label="Drift" player={samplePlayer()} />
                <SamplerToggle param="panDrift" player={samplePlayer()} />
              </div>
            </div>
          </fieldset>

          <fieldset class="control-group trim-group">
            <legend class="expandable-legend">Trim</legend>
            <div class="expandable-content">
              <ParamKnob
                param="trimStart"
                player={samplePlayer()}
                maxAllowed={() => samplerParamValues().trimEnd}
              />
              <ParamKnob
                param="trimEnd"
                player={samplePlayer()}
                minAllowed={() => samplerParamValues().trimStart}
              />
              <button class="crop-button" onClick={handleCrop}>
                Crop
              </button>
            </div>
          </fieldset>

          <fieldset class="control-group feedback-group">
            <legend class="expandable-legend">Feedback</legend>
            <div class="expandable-content">
              <ParamKnob param="feedback" label="Amount" player={samplePlayer()} />
              <ParamKnob param="feedbackPitch" label="Pitch" player={samplePlayer()} />
              <ParamKnob param="feedbackLpf" label="Lowpass" player={samplePlayer()} />

              <ParamKnob param="feedbackDecay" label="Decay" player={samplePlayer()} />

              <SamplerToggle param="feedbackMode" player={samplePlayer()} />
            </div>
          </fieldset>

          <div class="lfo-container">
            <fieldset class="control-group amp-lfo-group">
              <legend class="expandable-legend">Amp LFO</legend>
              <div class="expandable-content">
                <div class="flex-col">
                  <ParamKnob param="gainLFORate" label="Rate" player={samplePlayer()} />
                  <SamplerToggle param="gainLFOSync" player={samplePlayer()} />
                </div>
                <ParamKnob param="gainLFODepth" label="Depth" player={samplePlayer()} />
              </div>
            </fieldset>

            <fieldset class="control-group pitch-lfo-group">
              <legend class="expandable-legend">Pitch LFO</legend>
              <div class="expandable-content">
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
            <div class="expandable-content">
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
    </>
  );
};

export default App;
