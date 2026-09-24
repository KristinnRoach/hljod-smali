# Conventions

## Folders

`src/` is split by feature. A feature folder owns everything for that feature:
components, CSS modules, state and unit tests. Deleting a feature means deleting
its folder.

- Features: `sampler/`, `envelopes/`, `keyboard/`, `library/`, `audio-pipe/`, `io/`
- Shared, no domain knowledge: `ui/` (generic widgets, directives), `lib/` (helpers, flat)
- `vendor/`: third-party code we don't maintain. Not linted.
- `legacy/`: old stack, being removed (see `ROADMAP.md`).

`ui/` and `lib/` import only from each other, `assets/` and packages, never from
a feature folder (enforced by `no-restricted-imports` in `vite.config.ts`). Code
moves into them when a second feature needs it, not before. A new feature gets a
new folder; don't add type-based folders (`components/`, `hooks/`, `utils/`).

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
