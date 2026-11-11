// src/App.tsx
import { Component, onMount, createSignal, createMemo, onCleanup, Show } from 'solid-js';

import { keymaps, DEFAULT_KEYMAP_KEY, type KeymapKey } from '@kidlib/web-audio';
import ParamKnob from '@/sampler/ParamKnob';
import { bindSamplerParams } from '@/sampler/bindSamplerParams';
import Toolbar from '@/toolbar/Toolbar';

import { handleExpandCollapseClick } from '@/lib/expandCollapse';
import { showToast, ToastViewport } from '@/ui/Toast';
import { fitZoom } from '@/lib/fitZoom';
import { useFileDrop } from '@/lib/useFileDrop';
import { useMidi } from '@/io/useMidi';
import SequenceControls, { sequenceShown } from '@/sequence/SequenceControls';
import PitchyTuner from '@/tuner/PitchyTuner';
import { registerWebmcpTools } from '@/webmcp/registerWebmcpTools';
import type { InstrumentSummary } from '@/library/instrumentLibrary';
import {
  samplerParamValues,
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
import SamplePlayheads from '@/sampler/SamplePlayheads';
import { samplePlayer, getSamplePlayer } from '@/sampler/samplePlayer';
import { createSampler } from '@/sampler/createSampler';
import { createSampleLayers, sampleLayersEnabled } from '@/sampler/createSampleLayers';
import { createLayeredInput } from '@/io/inputTarget';

const App: Component = () => {
  bindSamplerParams(samplePlayer);
  const plotDimensions = { width: 575, height: 200 };
  let waveformViewport: SVGSVGElement | undefined;
  const waveformZoom = createWaveformZoom({
    viewport: () => waveformViewport,
    onChange: (next, previous) => scaleSamplerParamRange(zoomScaledParams(), previous, next),
    sampleCount: () => sampler.currentSample()?.length,
  });
  const envelope = createEnvelopeEditor(samplePlayer);
  const audioPipe = createAudioPipe(() => samplePlayer()?.output, getSamplePlayer);

  const [sidebarOpen, setSidebarOpen] = createSignal(false);
  const [sidebarSection, setSidebarSection] = createSignal<'menu' | 'instruments'>('instruments');
  const [keymapKey, setKeymapKey] = createSignal<KeymapKey>(DEFAULT_KEYMAP_KEY);
  const [keyboardOctaveOffset, setKeyboardOctaveOffset] = createSignal(0);
  const [rootNote, setRootNote] = createSignal<RootNote>('C');

  // Root note is a local MIDI offset on the keymap. Tuning stays in transpose and fineTune.
  const keymap = createMemo(() => {
    const offset = ROOT_NOTES.indexOf(rootNote());
    return Object.fromEntries(
      Object.entries(keymaps[keymapKey()]).map(([code, note]) => [code, note + offset]),
    );
  });

  const sampleLayers = createSampleLayers(samplePlayer);
  const inputTarget = createLayeredInput(() => {
    const primary = getSamplePlayer();
    return [...(primary ? [primary] : []), ...sampleLayers.layers()].filter(
      (player) => !player.disposed,
    );
  });
  const getInputTarget = () => (getSamplePlayer() ? inputTarget : null);

  const computerKeyboard = useComputerKeyboard({
    player: getInputTarget,
    keymap,
    octaveOffset: keyboardOctaveOffset,
    setOctaveOffset: setKeyboardOctaveOffset,
  });

  const sampler = createSampler({
    keyboardLoopEnabled: computerKeyboard.loopEnabled,
    releasePressedNotes: computerKeyboard.releasePressedNotes,
    onSampleLoaded: waveformZoom.resetViewport,
  });

  const handleInstrumentSelect = async (summary: InstrumentSummary, addLayer: boolean) => {
    if (addLayer && sampleLayersEnabled()) {
      await sampleLayers.add(summary);
      return;
    }
    if (await sampler.loadLibraryInstrument(summary)) setSidebarOpen(false);
  };

  // Drop an audio file anywhere on the page to load it.
  const draggingFiles = useFileDrop((files) => {
    if (files.length > 1) showToast('Drop one sample at a time', { kind: 'error' });
    else if (files[0]) void sampler.loadFile(files[0]);
  });
  useMidi(getInputTarget);

  onMount(() => {
    const unregisterWebmcpTools = registerWebmcpTools(() => {
      const player = samplePlayer();
      return {
        ready: sampler.sampleLoaded() && !sampler.instrumentLoading() && !sampler.samplerError(),
        loading: sampler.instrumentLoading(),
        error: sampler.samplerError(),
        audioContextState: player?.context.state ?? null,
        sampleDurationSeconds: player?.sampleDuration ?? null,
        activeInstrument: sampler.activeInstrument(),
        params: snapshotSamplerParamValues(),
      };
    });
    onCleanup(unregisterWebmcpTools);
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
                  <>
                    <Show when={sampleLayersEnabled()}>
                      <p>Shift-select to layer samples. UI controls the original player.</p>
                      <p>Extra players: {sampleLayers.layers().length}</p>
                      <button type="button" onClick={sampleLayers.clear}>
                        Clear layers
                      </button>
                    </Show>
                    <InstrumentListSection
                      onInstrumentSelect={handleInstrumentSelect}
                      loadedRef={sampler.loadedRef()}
                      onInstrumentDeleted={sampler.markDeleted}
                    />
                  </>
                ),
              },
            ]}
            openSectionId={sidebarSection()}
            onSectionChange={setSidebarSection}
          />
        </Sidebar>

        <div class="sampler-w-toolbar" ref={fitZoom}>
          <Toolbar
            player={samplePlayer()}
            sample={sampler.currentSample()}
            instrument={sampler.activeInstrument()}
            sampleLoaded={sampler.sampleLoaded()}
            instrumentLoading={sampler.instrumentLoading()}
            sidebarOpen={sidebarOpen()}
            audioPipeActive={audioPipe.active()}
            onOpenLibrary={() => {
              setSidebarSection('instruments');
              setSidebarOpen(true);
            }}
            onSaved={sampler.markSaved}
            onSampleRateChange={sampler.setSampleRate}
          />

          <div
            class="control-grid"
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
                      buffer={sampler.currentSample()}
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
              sampleLoaded={sampler.sampleLoaded()}
              onFile={sampler.loadFile}
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
                <button class="crop-button" onClick={sampler.commitPitch}>
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
                    <ModulationWaveformSelect
                      value={sampler.amWaveform()}
                      onChange={sampler.setAmWaveform}
                    />
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
                <button class="crop-button" onClick={sampler.crop}>
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
                  audioInitialized={sampler.audioInitialized()}
                  sampleLoaded={sampler.sampleLoaded()}
                  error={sampler.samplerError()}
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
                  pressedNotes={computerKeyboard.pressedNotes()}
                  height={80}
                />
                <div class="keyboard-controls">
                  <div class="flex-row">
                    <RootNoteSelect value={rootNote()} onChange={setRootNote} />
                    <KeymapSelect value={keymapKey()} onChange={setKeymapKey} />
                  </div>

                  <div class="flex-row">
                    <ParamKnob param="glide" player={samplePlayer()} />
                    <SamplerIconToggle param="legato" player={samplePlayer()} />
                  </div>
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
