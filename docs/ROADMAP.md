# Roadmap

The legacy VanJS envelope editor is gone. Still left from the old stack:
`src/components/legacy/styles/` (global `audio-components.css`, and
`COMPONENT_STYLE` used by `PianoKeyboard`).

## Deferred

- Replace the package `KnobElement` with the existing Solid knob draft.
- Replace the self-contained canvas keyboard widget.

## Scope

Sampler UI and persistence live here. Audio primitives belong in
[`@kidlib/web-audio`](https://github.com/KristinnRoach/web-audio) once defined as
reusable public APIs.
