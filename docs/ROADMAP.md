# Roadmap

The envelope editor is the last VanJS feature. Migrating it to a Solid component
that receives `SamplePlayer` directly will also remove:

- the `envelope-switcher` custom element and registration;
- the `sampler-initialized` and `sample-loaded` compatibility events;
- `vanjs-core` and the vendored `van-element` adapter;
- envelope-only global typings and legacy styles.

The replacement needs a small public envelope-state contract in
`@kidlib/web-audio`; audio behavior belongs there, while editing interactions,
presentation, and persistence decisions belong here.

## Deferred

- Replace the package `KnobElement` with the existing Solid knob draft.
- Replace the self-contained canvas keyboard widget.

## Scope

Sampler UI and persistence live here. Audio primitives belong in
[`@kidlib/web-audio`](https://github.com/KristinnRoach/web-audio) once defined as
reusable public APIs.
