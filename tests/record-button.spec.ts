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

test.beforeEach(async ({ page }) => {
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
});

test('records sound, stops on silence, and cancels an armed take', async ({ page }) => {
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
  await expect(record).toHaveAttribute('data-state', 'ARMED');
  await page.evaluate(() => ((window as any).recordingTestInput.gain.gain.value = 0.2));
  await expect(record).toHaveAttribute('data-state', 'RECORDING');
  await page.evaluate(() => ((window as any).recordingTestInput.gain.gain.value = 0));
  await expect(record).toHaveAttribute('data-state', 'IDLE');
  await expect(record).toBeEnabled();
  await expect.poll(() => page.evaluate(() => (window as any).recordedDuration)).toBeGreaterThan(0);
  await expect
    .poll(() =>
      page.evaluate(() => (window as any).recordingTestInput.stream.getTracks()[0].readyState),
    )
    .toBe('ended');

  await record.click();
  await expect(record).toHaveAttribute('data-state', 'ARMED');
  await page.keyboard.press('Escape');
  await expect(record).toHaveAttribute('data-state', 'IDLE');
  await expect
    .poll(() =>
      page.evaluate(() => (window as any).recordingTestInput.stream.getTracks()[0].readyState),
    )
    .toBe('ended');
});

test('the threshold slider sets and live-updates the armed start level', async ({ page }) => {
  await page.goto('/');
  const record = page.getByRole('button', { name: 'Record Sample' });
  const threshold = page.getByRole('slider', { name: 'Recording start threshold' });
  await expect(record).toBeEnabled();

  // A 0.2 sine peaks near -14 dB: below a -6 dB threshold, above -40 dB.
  await threshold.fill('-6');
  await record.click();
  await expect(record).toHaveAttribute('data-state', 'ARMED');
  await page.evaluate(() => ((window as any).recordingTestInput.gain.gain.value = 0.2));
  await page.waitForTimeout(300);
  await expect(record).toHaveAttribute('data-state', 'ARMED');

  await threshold.fill('-40');
  await expect(record).toHaveAttribute('data-state', 'RECORDING');
  await expect(threshold).toBeDisabled();
  await page.keyboard.press('Escape');
  await expect(record).toHaveAttribute('data-state', 'IDLE');
  await expect(threshold).toHaveValue('-40');
});

test('Auto sets the threshold from the noise floor and releases input', async ({ page }) => {
  await page.goto('/');
  const threshold = page.getByRole('slider', { name: 'Recording start threshold' });
  const auto = page.getByRole('button', { name: 'Auto', exact: true });
  await expect(auto).toBeEnabled();

  // Digital silence suggests the Recorder's floor of -60 dB.
  await auto.click();
  await expect(threshold).toHaveValue('-60');
  await expect(auto).toBeEnabled();
  await expect
    .poll(() =>
      page.evaluate(() => (window as any).recordingTestInput.stream.getTracks()[0].readyState),
    )
    .toBe('ended');
});

test('Play previews the last take and stops', async ({ page }) => {
  await page.goto('/');
  const record = page.getByRole('button', { name: 'Record Sample' });
  const play = page.getByRole('button', { name: 'Play take' });
  await expect(record).toBeEnabled();
  await expect(play).toBeDisabled();

  await record.click();
  await page.evaluate(() => ((window as any).recordingTestInput.gain.gain.value = 0.2));
  await expect(record).toHaveAttribute('data-state', 'RECORDING');
  // Let enough audio arrive for MediaRecorder to produce a decodable take.
  await expect
    .poll(() => page.evaluate(() => (window as any).recordingTestInput.context.currentTime))
    .toBeGreaterThan(0.5);
  await record.click();

  await play.click();
  await page.getByRole('button', { name: 'Stop take' }).click();
  await expect(play).toBeEnabled();
});
