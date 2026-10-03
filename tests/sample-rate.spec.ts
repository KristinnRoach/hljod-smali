import { expect, test } from '@playwright/test';

test('sample-rate changes replace the context and preserve layers and settings', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await page.getByTitle('Toggle Toolbar').click();
  const rate = page.getByLabel('Sample rate', { exact: true });
  await expect(rate).toBeEnabled({ timeout: 30_000 });

  await page.evaluate(async () => {
    const player = (window as any).getSamplePlayer();
    await player.loadAudio([player.audiobuffer, player.audiobuffer], {
      skipPreProcessing: true,
    });
    player.updateEnvelope('amp', { timeScale: 1.75 });
  });
  const trim = page.locator('[data-param="trimStart"] [data-knob]');
  await trim.evaluate((element) => (element as any).setValue(0.2));
  const before = await page.evaluate(() => {
    const player = (window as any).getSamplePlayer();
    return {
      envelope: player.getEnvelope('amp'),
      layers: player.samples.map((buffer: AudioBuffer) => ({
        duration: buffer.duration,
        channels: buffer.numberOfChannels,
      })),
    };
  });

  const first = Number(await rate.inputValue()) === 44_100 ? 48_000 : 44_100;
  for (const sampleRate of [first, first === 48_000 ? 44_100 : 48_000]) {
    await page.evaluate(() => {
      (window as any).__previousPlayer = (window as any).getSamplePlayer();
    });
    await rate.selectOption(String(sampleRate));
    await expect(rate).toBeEnabled();
    await expect(rate).toHaveValue(String(sampleRate));
    const after = await page.evaluate(() => {
      const player = (window as any).getSamplePlayer();
      return {
        replaced: player !== (window as any).__previousPlayer,
        oldState: (window as any).__previousPlayer.context.state,
        sampleRate: player.context.sampleRate,
        envelope: player.getEnvelope('amp'),
        layers: player.samples.map((buffer: AudioBuffer) => ({
          rate: buffer.sampleRate,
          duration: buffer.duration,
          channels: buffer.numberOfChannels,
        })),
      };
    });
    expect(after.replaced).toBe(true);
    expect(after.oldState).toBe('closed');
    expect(after.sampleRate).toBe(sampleRate);
    expect(after.envelope).toEqual(before.envelope);
    expect(after.layers).toHaveLength(before.layers.length);
    after.layers.forEach(
      (layer: { rate: number; duration: number; channels: number }, i: number) => {
        expect(layer.rate).toBe(sampleRate);
        expect(layer.channels).toBe(before.layers[i].channels);
        expect(Math.abs(layer.duration - before.layers[i].duration)).toBeLessThan(2 / sampleRate);
      },
    );
    await expect(trim).toHaveAttribute('aria-valuenow', '0.2');
    await page.evaluate(async () => {
      const player = (window as any).getSamplePlayer();
      await player.context.resume();
      player.play(60);
      player.releaseAll();
    });
  }
  expect(errors).toEqual([]);
});
