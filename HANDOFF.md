# Handoff: `new-env` branch

This branch moves the app to the new envelope API in `@kidlib/web-audio`
0.5.0 (`EnvelopeConfig`, `SampleEnvelopeId`). `pnpm test:all` passes against
the published package; `dev:local` is no longer needed.

## Before merge

- Persist rate-sync (below).

## Deferred

### Pitch and filter envelopes are dev-only

The "Select Envelope" picker in `EnvelopeControls` only renders in DEV, so
production only edits amp-env. Before showing it again, decide how 0.5.0
should read pitch values (0.4.x stored absolute rates in `[0.5, 1.5]`) and
filter values (now log-mapped from `filterCutoff`).

### Stored envelopes: amp-env migrated, the rest dropped

The Dexie v4 upgrade (`instrumentDb.ts`) converts saved amp-env states to
`EnvelopeConfig` and drops pitch/filter, which then load as defaults.
`playbackRateSync` is dropped too. Old sessionStorage drafts
(`play:working-envelope-draft:v1`) aren't migrated. The `ponytail:` fallback
in `applyEnvelopes` (`src/App.tsx`) resets them to defaults, so keep it until
old drafts are no longer a concern.

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
