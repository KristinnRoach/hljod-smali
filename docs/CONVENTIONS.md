# Conventions

## Folders

`src/` is split by feature. A feature folder owns everything for that feature:
components, CSS modules, state and unit tests. Deleting a feature means deleting
its folder.

- Features: `sampler/`, `envelopes/`, `library/`, `audio-pipe/`, `io/`, `sequence/`, `toolbar/`, `webmcp/` (agent tools; add one with a `registerTool` call in `registerWebmcpTools.ts`)
- Shared, no domain knowledge: `ui/` (generic widgets, directives), `lib/` (helpers, flat)
- Vendored third-party code lives in the feature that uses it (`io/webaudio-keyboard.js`) and is listed in `lint.ignorePatterns`.

`ui/` and `lib/` import only from each other, `assets/` and packages, never from
a feature folder (enforced by `no-restricted-imports` in `vite.config.ts`). Code
moves into them when a second feature needs it, not before. A new feature gets a
new folder; don't add type-based folders (`components/`, `hooks/`, `utils/`).

## Unreleased features

Gate a feature that isn't ready for everyone behind a flag from `lib/featureFlag.ts`.
It's on by default in DEV and off in PROD. Anyone can switch it on, and the choice
persists per browser.

`lib/featureFlag.ts` owns flag defaults, state and persistence. Only explicit flag
controls (console `setFeatureFlag` and WebMCP `set_feature_flag`) call `setFeatureFlag`.
Feature actions must never change flags, including when starting playback or
connecting an output. Enable a hidden feature explicitly before using it.

- Declare it at module scope in the feature folder:
  `export const sequenceShown = featureFlag('sequence', 'Sequence recorder')`.
  Module scope lists it before WebMCP registers its tools.
- Gate the mount point with `<Show when={sequenceShown()}>`, so turning the flag off
  unmounts the feature and runs its cleanup.
- Console: `setFeatureFlag('name', true)`, `setFeatureFlag('name', false)`, `listFeatureFlags()` lists all flags.
  WebMCP: `set_feature_flag` changes flags; `list_feature_flags` lists their current values.
  Both use the shared flag functions, so a new flag needs no wiring.
- Mark the flag with a `ponytail:` comment saying when to drop it, and delete the
  flag once the feature ships.

## Imports

`./x` within a folder, `@/folder/x` across folders. No `../`.

## Naming

- A file is named after its main export: `PascalCase` for components and classes,
  `camelCase` otherwise. Folders are `kebab-case`.
- `X.module.css` sits next to `X.tsx`. Global CSS is only `style.css` (app layout)
  and `themes.css` (tokens).

## Tests

- Unit: `x.test.ts` next to `x.ts`. Runs in node, so no DOM or Web Audio.
- E2E: `tests/*.spec.ts` (Playwright, dev server). `*.prod.spec.ts` runs
  against the production build.
- Before pushing: `vp check && vp test`. CI runs those plus `vp build`.
