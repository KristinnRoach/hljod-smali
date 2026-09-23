# Handoff: `new-env` branch

This branch moves the app to the new envelope API in `@kidlib/web-audio`
0.5.0 (`EnvelopeConfig`, `SampleEnvelopeId`). `pnpm test:all` passes against
the published package; `dev:local` is no longer needed.

## Before merge

- Migrate stored envelopes (below). Delete the `ponytail:` fallback in
  `applyEnvelopes` (`src/App.tsx`) once old rows can't reach it.
- Persist rate-sync (below).

## Deferred

### Old-shape envelopes are dropped, not migrated

`main` stores `Record<EnvelopeType, EnvelopeState>` in instrument rows and in
the sessionStorage draft (`play:working-envelope-draft:v1`).
`applyEnvelopeConfig` rejects that shape. `applyEnvelopes` now resets to
defaults and skips anything invalid, so old instruments load without their
custom envelopes.

To migrate, add a Dexie `version(4).upgrade()` that maps:

- `shape.points` → `envelope.points`. Normalise through `shape.valueRange` if
  the `[0, 1]` range holds for every envelope id.
- `sustainIndex` → `sustain` with `mode: { type: 'sustain' }`, `loop: true` →
  `mode: { type: 'loop' }`, otherwise `mode: { type: 'once' }`. `sustain` is
  required in every mode, so fall back to `releaseIndex` when it is null.
- `releaseIndex` → `release`.
- Point times must be strictly increasing. Nudge duplicates apart, the way
  `MIN_POINT_GAP` in `envelopeState.ts` does.
- `enabled` and `timeScale` carry over unchanged.
- `playbackRateSync` has nowhere to go until rate-sync gets a place to live.

Re-saving an old instrument by `id` without `envelopes` keeps the old-shape
envelopes in the row. The migration fixes that too.

### Rate-sync is not persisted

`EnvelopeConfig` has no sync field. As of 0.5.0 the package still keeps sync in a private
`playbackRateSyncedEnvelopes` set with no getter. `SaveButton` only saves
`getEnvelopeConfig()`, and `EnvelopeEditor`'s `rateSync` signal is UI-only and
starts at `false`. This needs a package change: either a getter or a `sync`
field in `EnvelopeConfig`.

### No e2e coverage for envelope persistence

The two Playwright tests in `tests/instrument-persistence.spec.ts` went with
the legacy editor. Rewrite them against `EnvelopeEditor` (its `<polyline>`,
`getEnvelopeConfig`) once the API is stable.

### Minor

- `SaveButton` hardcodes `'amp-env' | 'filter-env' | 'pitch-env'`. Use
  `availableEnvelopeIds` if the set changes.
- Package members the legacy editor used and this app no longer touches:
  `getStartPoint`, `getEndPoint`, `setSampleStartPoint`, `setSampleEndPoint`,
  `setLoopStart`, `setLoopEnd`, `loopStart`, `loopEnd` and `loopEnabled` getters,
  plus the `'voice:stopped'`, `'loop-points:updated'` and `'loop:enabled'`
  messages. They are candidates for the package's API review, not removal here.
