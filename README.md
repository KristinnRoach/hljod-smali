# Hljóð-Smali

A polyphonic sampler instrument that runs in the browser.

**[Try Hljóð-Smali](https://kristinnroach.github.io/hljod-smali/)**

![Hljóð-Smali sampler interface](assets/screenshots/hljod-smali-dark.jpeg)

Hljóð-Smali is built with [`@kidlib/web-audio`](https://github.com/KristinnRoach/web-audio), a library of high-level Web Audio primitives for building musical instruments and tools, still in active development.

## Features

- Record or upload samples and play them with a MIDI controller, computer keyboard, or on-screen keys
- Samples are automatically optimized for in-tune polyphonic playback, if the sample contains a prominent pitch it is tuned to C so it can be played polyphonically in tune with other instruments. 
- Shape playback with envelopes, filters, looping, trimming, modulation, and effects
- Build layered patches and save them locally in the browser
- Install as a responsive PWA with light and dark themes

## Stack

TypeScript, SolidJS, Web Audio API, AudioWorklet, Web MIDI, IndexedDB, Vite+, Vitest, and Playwright.

## Run locally

```sh
pnpm install
pnpm dev
```

```sh
pnpm build
pnpm exec vp test
pnpm test:e2e
```

The app was originally developed in
[`sampler-monorepo`](https://github.com/KristinnRoach/sampler-monorepo). The UI is
now maintained here while the reusable audio engine lives in `@kidlib/web-audio`.

MIT licensed.
