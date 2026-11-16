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
  silent(results.stealing[1]);
  expect(errors).toEqual([]);
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
