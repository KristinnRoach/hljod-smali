import { expect, test } from '@playwright/test';

// The button used to unlock on a `sampler-initialized` document event; it now
// unlocks on the `player` prop. This is the only coverage of that swap.
test('the record button is disabled until the sampler exists', async ({ page }) => {
  await page.goto('/');

  const record = page.getByRole('button', { name: 'Record Sample' });
  await expect(record).toBeVisible();

  await page.waitForFunction(() => Boolean((window as any).getSamplePlayer?.()), undefined, {
    timeout: 30_000,
  });
  await expect(record).toBeEnabled();
});

test('records sound, stops on silence, and cancels an armed take', async ({ page }) => {
  await page.addInitScript(() => {
    navigator.mediaDevices.getUserMedia = async () => {
      const context = new AudioContext();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const destination = context.createMediaStreamDestination();
      gain.gain.value = 0;
      oscillator.connect(gain).connect(destination);
      oscillator.start();
      await context.resume();
      (window as any).recordingTestInput = { context, gain, stream: destination.stream };
      return destination.stream;
    };
  });
  await page.goto('/');
  const record = page.getByRole('button', { name: 'Record Sample' });
  await expect(record).toBeEnabled();
  await page.evaluate(() => {
    const player = (window as any).getSamplePlayer();
    const loadAudio = player.loadAudio.bind(player);
    player.loadAudio = (buffer: AudioBuffer, options: unknown) => {
      (window as any).recordedDuration = buffer.duration;
      return loadAudio(buffer, options);
    };
  });

  await record.click();
  await expect(record).toHaveCSS('color', 'rgb(245, 158, 11)');
  await page.evaluate(() => ((window as any).recordingTestInput.gain.gain.value = 0.2));
  await expect(record).toHaveCSS('color', 'rgb(239, 68, 68)');
  await page.evaluate(() => ((window as any).recordingTestInput.gain.gain.value = 0));
  await expect(record).toHaveCSS('color', 'rgb(255, 255, 255)');
  await expect(record).toBeEnabled();
  await expect.poll(() => page.evaluate(() => (window as any).recordedDuration)).toBeGreaterThan(0);
  await expect
    .poll(() =>
      page.evaluate(() => (window as any).recordingTestInput.stream.getTracks()[0].readyState),
    )
    .toBe('ended');

  await record.click();
  await expect(record).toHaveCSS('color', 'rgb(245, 158, 11)');
  await page.keyboard.press('Escape');
  await expect(record).toHaveCSS('color', 'rgb(255, 255, 255)');
  await expect
    .poll(() =>
      page.evaluate(() => (window as any).recordingTestInput.stream.getTracks()[0].readyState),
    )
    .toBe('ended');
});
