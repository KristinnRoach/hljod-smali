# Handoff: `new-env` branch

This branch consumes the unreleased envelope API in `@kidlib/web-audio`
(`EnvelopeConfig`, `SampleEnvelopeId`). It only runs with `vp run dev:local`
against `../kidlib/web-audio`. Don't merge it until that API is released and
this branch uses the released version.

## Before merge

- Bump `@kidlib/web-audio` to the release and drop the need for `dev:local`.
  `vp check` must come back clean. The ~27 type errors it shows now all come
  from the new API not being in 0.4.2.
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
- `sustainIndex` → `mode: { type: 'sustain', at }`, `loop: true` →
  `mode: { type: 'loop' }`, otherwise `mode: { type: 'once' }`.
- `releaseIndex` → `release`.
- `enabled` and `timeScale` carry over unchanged.
- `playbackRateSync` has nowhere to go until rate-sync gets a place to live.

Re-saving an old instrument by `id` without `envelopes` keeps the old-shape
envelopes in the row. The migration fixes that too.

### Rate-sync is not persisted
`EnvelopeConfig` has no sync field. The package keeps sync in a private
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
- The package's filter-env wiring is commented out (`TODO: @POST_ENV_API_READY`
  in `SamplePlayer.applyEnvelopeConfig`), so filter-env edits are inaudible for now.
- Package members the legacy editor used and this app no longer touches:
  `getStartPoint`, `getEndPoint`, `setSampleStartPoint`, `setSampleEndPoint`,
  `setLoopStart`, `setLoopEnd`, `loopStart`, `loopEnd` and `loopEnabled` getters,
  plus the `'voice:stopped'`, `'loop-points:updated'` and `'loop:enabled'`
  messages. They are candidates for the package's API review, not removal here.
