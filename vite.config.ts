import { defineConfig, lazyPlugins } from 'vite-plus';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { VitePWA } from 'vite-plugin-pwa';
import solidPlugin from 'vite-plugin-solid';

// ponytail: LOCAL_WEB_AUDIO=1 points @kidlib/web-audio at the sibling repo's
// dist instead of the published package. Run `vp run watch` in that repo so
// dist rebuilds on edit. Unset to go back to npm.
const localWebAudio = process.env.LOCAL_WEB_AUDIO
  ? resolve(import.meta.dirname, '../kidlib/web-audio')
  : null;

if (localWebAudio) {
  if (!existsSync(`${localWebAudio}/dist/index.js`)) {
    throw new Error(
      `LOCAL_WEB_AUDIO set but ${localWebAudio}/dist is missing. Run \`vp run build\` there.`,
    );
  }
  console.log(`Using linked local web-audio package: ${localWebAudio}/dist`);
}

export default defineConfig({
  fmt: {
    singleQuote: true,
  },
  test: {
    // ponytail: node, not jsdom. jsdom has no Web Audio and no layout, so it
    // can't test this app's audio or SVG geometry -- Playwright covers those.
    // For real component tests use Vitest browser mode, not jsdom.
    environment: 'node',
    // tests/ belongs to Playwright (see playwright.config.ts). No unit tests yet;
    // drop this exclude once some exist under src/.
    exclude: ['tests/**', 'node_modules/**', 'dist/**'],
    passWithNoTests: true,
  },
  lint: {
    jsPlugins: [{ name: 'vite-plus', specifier: 'vite-plus/oxlint-plugin' }],
    rules: { 'vite-plus/prefer-vite-plus-imports': 'error' },
    options: { typeAware: true, typeCheck: true },
  },
  base: './',

  plugins: lazyPlugins(() => [
    solidPlugin(),
    VitePWA({
      registerType: 'autoUpdate', // Automatically update the service worker
      injectRegister: false,
      includeAssets: [
        'icons/favicon.svg',
        'icons/favicon.ico',
        'icons/apple-touch-icon-180x180.png',
      ], // assets to cache
      manifest: {
        // Stable install identity. Decoupled from start_url so the app can move
        // paths without orphaning installed instances. Do not change.
        id: '/hljod-smali/',
        name: 'Hljóð-Smali',
        short_name: 'HljóðSmali',
        description: 'Sampler Instrument',
        theme_color: '#666',
        icons: [
          {
            src: 'icons/pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png',
          },
          {
            src: 'icons/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icons/maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: 'icons/favicon_io/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/favicon_io/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      devOptions: {
        enabled: false, // enable PWA in dev for testing
      },
    }),
  ]),

  server: {
    hmr: {
      overlay: false,
    },
    port: Number(process.env.PORT) || 3000,
    open: true,
    host: true, // Allow access from network
    ...(localWebAudio && { fs: { allow: ['.', localWebAudio] } }),
  },

  build: {
    sourcemap: true,
  },

  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, 'src/audio-elements'),
      ...(localWebAudio && { '@kidlib/web-audio': `${localWebAudio}/dist` }),
    },
  },
});
