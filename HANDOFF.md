# HANDOFF: waveform trim/loop overlays (temporary, delete when merged)

## State

Trim and loop points draw over the waveform in the Envelopes panel (`src/App.tsx`, `EnvelopeEditor` underlay).

- `AudioWaveform` takes `children`, drawn above the waveform in normalized 0..1 coordinates (x = buffer position). Trim/loop params are already 0..1, so no conversion.
- `WaveformMarker` (`position`, `class`): vertical line. Style: `--waveform-marker-color`, `--waveform-marker-width`.
- `WaveformRegion` (`start`, `end`, `class`): full-height band, any order. Style: `--waveform-region-fill`.
- `SamplePointMarkers.tsx`: default export draws the 4 trim/loop lines, `SampleRegions` dims outside trim and highlights the loop while `loopEnabled()`. Colors in `SamplePointMarkers.module.css`.
- `samplePlayer.ts` exports a `loopEnabled` signal fed by the player's `loop:enabled` message. It covers keyboard loop, loop lock and sustain pedal (lock implies enabled in web-audio).

## Decisions

- Player messages become signals in `samplePlayer.ts`, subscribed once, instead of per-component `onMessage` + passing `player` props. This works well for our "loopEnabled" but has not been reviewed independently as a pattern in hljod-smali.
- No feature flag.

## Next

- Interactive markers: drop `pointer-events="none"` for markers, map pointer x to 0..1, call `setSamplerParamValue`.
- Review and consider alternatives and other candidates for the signal pattern: e.g. `sample:loaded` (App, ParamKnob, EnvelopeEditor each subscribe separately. Note that we might need support for multiple sample-players soon, so some scalability needs to be taken into account.)
- Delete this file.
