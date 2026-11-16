import { expect, test } from '@playwright/test';
import { audioSmoke } from './audio-smoke.js';

test('PCM: scheduled pitch, legato fallback, cancellation and voice stealing', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await page.waitForFunction(() => (window as any).getSamplePlayer?.()?.isLoaded);
  const { results } = await page.evaluate(audioSmoke);
  const silent = (window: any) => {
    expect(window.samples).toBeGreaterThan(1000);
    expect(window.invalid).toBe(0);
    expect(window.rms).toBeLessThan(0.0001);
  };
  const sounding = (window: any, hz?: number) => {
    expect(window.samples).toBeGreaterThan(1000);
    expect(window.invalid).toBe(0);
    expect(window.rms).toBeGreaterThan(0.005);
    expect(window.peak).toBeLessThan(1);
    if (hz) expect(Math.abs(window.hz - hz)).toBeLessThan(15);
  };
  silent(results.scheduled[0]);
  sounding(results.scheduled[1], 220);
  silent(results.scheduled[2]);
  sounding(results.legato[0], 220);
  sounding(results.legato[1], 440);
  sounding(results.legato[2], 220);
  silent(results.legato[3]);
  silent(results.cancel[0]);
  sounding(results.stealing[0]);
  const [stolen60, stolen64, kept76, kept79] = results.stealing[0].amps;
  expect(Math.min(kept76, kept79)).toBeGreaterThan(0.02);
  expect(Math.max(stolen60, stolen64)).toBeLessThan(0.005);
  silent(results.stealing[1]);
  expect(errors).toEqual([]);
});

// Replays voice events the way src/sampler/playbackState.ts does (keyed by voiceId),
// so a stolen voice's stop arriving after its restart, or a stale end report from the
// stolen trigger, shows up as a missing or orphaned playhead.
test('voice events: stolen voices leave exactly the held notes live, none after release', async ({
  page,
}) => {
  await page.goto('/');
  await page.waitForFunction(() => (window as any).getSamplePlayer?.()?.isLoaded);
  const { held, afterRelease } = await page.evaluate(async () => {
    const app = (window as any).getSamplePlayer();
    const context = app.context;
    await context.resume();
    const player = new app.constructor({ context, polyphony: 2 });
    await player.init();
    const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
    buffer.getChannelData(0).fill(0.1);
    await player.loadAudio(buffer, { skipPreProcessing: true });
    for (const id of player.envelopeIds) player.updateEnvelope(id, { enabled: false });
    player.setLoopEnabled(true);
    const live: Record<string, number> = {};
    player.onMessage('voice:started', (m: any) => (live[m.voiceId] = m.midiNote));
    player.onMessage('voice:stopped', (m: any) => delete live[m.voiceId]);
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const notes = [60, 64, 67, 72, 76, 79];
    const start = context.currentTime + 0.1;
    notes.forEach((note, i) => player.play(note, 100, 0, start + i * 0.08));
    await wait(800);
    const held = Object.values(live).sort((a, b) => a - b);
    notes.forEach((note) => player.release(note));
    await wait(1000);
    const afterRelease = Object.values(live);
    player.dispose();
    return { held, afterRelease };
  });
  expect(held).toEqual([76, 79]);
  expect(afterRelease).toEqual([]);
});

test('computer keyboard produces audio and releases the default instrument', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => (window as any).getSamplePlayer?.()?.isLoaded);
  await page.evaluate(async () => {
    const player = (window as any).getSamplePlayer();
    await player.context.resume();
    const analyser = player.context.createAnalyser();
    player.connect(analyser);
    (window as any).__smokeLevel = () => {
      const data = new Float32Array(analyser.fftSize);
      analyser.getFloatTimeDomainData(data);
      return Math.max(...data.map(Math.abs));
    };
  });
  await page.keyboard.down('z');
  try {
    await expect
      .poll(() => page.evaluate(() => (window as any).__smokeLevel()))
      .toBeGreaterThan(0.001);
  } finally {
    await page.keyboard.up('z');
  }
  await expect
    .poll(() => page.evaluate(() => (window as any).__smokeLevel()), {
      timeout: 5000,
    })
    .toBeLessThan(0.0001);
});

// Correctness under load. Dropouts are the next test.
test('stress: 400-note flood on the app player stays finite, within polyphony, and goes silent', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await page.waitForFunction(() => (window as any).getSamplePlayer?.()?.isLoaded);
  const result = await page.evaluate(async () => {
    const player = (window as any).getSamplePlayer();
    const context = player.context;
    await context.resume();
    const analyser = context.createAnalyser();
    player.connect(analyser);
    const data = new Float32Array(analyser.fftSize);
    const level = () => {
      analyser.getFloatTimeDomainData(data);
      let peak = 0;
      for (const v of data) {
        if (!Number.isFinite(v)) return NaN;
        peak = Math.max(peak, Math.abs(v));
      }
      return peak;
    };
    const live = new Set<string>();
    let maxLive = 0;
    const offs = [
      player.onMessage('voice:started', (m: any) => {
        live.add(m.voiceId);
        maxLive = Math.max(maxLive, live.size);
      }),
      player.onMessage('voice:stopped', (m: any) => live.delete(m.voiceId)),
    ];
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const start = context.currentTime + 0.1;
    for (let i = 0; i < 400; i++) {
      const note = 48 + ((i * 7) % 37);
      const at = start + i * 0.005; // 200 notes/s, each held 150 ms: ~30 overlapping on 16 voices
      player.play(note, 60 + (i % 60), 0, at);
      player.release(note, at + 0.15);
    }
    let peak = 0;
    let nonFinite = 0;
    for (let t = 0; t < 2300; t += 20) {
      const l = level();
      if (Number.isNaN(l)) nonFinite++;
      else peak = Math.max(peak, l);
      await wait(20);
    }
    player.releaseAll();
    let silentAfterMs = -1;
    for (let t = 0; t < 5000; t += 50) {
      if (level() < 0.0001) {
        silentAfterMs = t;
        break;
      }
      await wait(50);
    }
    offs.forEach((off: () => void) => off());
    player.disconnect(analyser);
    return { peak, nonFinite, maxLive, liveAtEnd: live.size, silentAfterMs };
  });
  expect(result.nonFinite).toBe(0);
  expect(result.peak).toBeGreaterThan(0.001);
  expect(result.maxLive).toBe(16); // saturated, never over
  expect(result.liveAtEnd).toBe(0);
  expect(result.silentAfterMs).toBeGreaterThanOrEqual(0);
  expect(errors).toEqual([]);
});

// Runs alone via `vpr test:dropouts`: parallel tests cause underruns of their own.
// Chrome's AudioContext.playbackStats counts output underruns (glitches heard as clicks).
// ponytail: Chromium-only; skips elsewhere. Headless output is a fake device, so this catches
// a render thread that can't keep up, not device-level glitches.
test('dropouts: 400-note flood on the app player causes no audio underruns', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => (window as any).getSamplePlayer?.()?.isLoaded);
  const stats = await page.evaluate(async () => {
    const player = (window as any).getSamplePlayer();
    const context = player.context;
    await context.resume();
    if (!context.playbackStats) return null;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    // Stats refresh about once a second.
    const read = async () => {
      await wait(1100);
      const { underrunEvents, underrunDuration, totalDuration } = context.playbackStats;
      return { underrunEvents, underrunDuration, totalDuration };
    };
    const before = await read();
    const start = context.currentTime + 0.1;
    for (let i = 0; i < 400; i++) {
      const note = 48 + ((i * 7) % 37);
      const at = start + i * 0.005;
      player.play(note, 60 + (i % 60), 0, at);
      player.release(note, at + 0.15);
    }
    await wait(2200);
    player.releaseAll();
    const after = await read();
    return {
      underrunEvents: after.underrunEvents - before.underrunEvents,
      underrunDuration: after.underrunDuration - before.underrunDuration,
      measured: after.totalDuration - before.totalDuration,
    };
  });
  test.skip(!stats, 'AudioContext.playbackStats not supported');
  test.info().annotations.push({ type: 'playbackStats', description: JSON.stringify(stats) });
  expect(stats!.measured).toBeGreaterThan(2); // the window actually covered the flood
  expect(stats!.underrunEvents).toBe(0);
});
