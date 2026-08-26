import { expect, test } from '@playwright/test';

test('Solid sampler selects own their state and audio wiring', async ({ page }) => {
  await page.goto('/');

  const sampleControls = page.getByRole('group', { name: 'Sample' });
  const inputSource = sampleControls.getByLabel('Audio input source');
  const inputDevice = sampleControls.getByLabel('Audio input device');

  await expect(inputSource).toHaveValue('audio-input');
  await expect(inputDevice).toBeEnabled();

  await inputSource.selectOption('browser');
  await expect(inputDevice).toBeDisabled();

  await inputSource.selectOption('audio-input');
  await expect(inputDevice).toBeEnabled();

  await page.waitForFunction(() => Boolean((window as any).getSamplePlayer?.()), undefined, {
    timeout: 30_000,
  });
  await page.evaluate(() => {
    const player = (window as any).getSamplePlayer();
    const setModulationWaveform = player.setModulationWaveform.bind(player);
    (window as any).__appliedAmWaveforms = [];
    player.setModulationWaveform = (modType: string, waveform: string) => {
      (window as any).__appliedAmWaveforms.push([modType, waveform]);
      setModulationWaveform(modType, waveform);
    };
  });

  const waveform = page.getByLabel('AM modulation waveform');
  const waveformIcon = page.locator('.modulation-waveform-select > .waveform-icon');
  await expect(waveform).toHaveValue('warm-pad');
  await expect(waveformIcon).toBeVisible();
  await expect(waveformIcon).toHaveAttribute('data-waveform', 'warm-pad');
  await expect
    .poll(() => waveformIcon.evaluate((icon) => getComputedStyle(icon).maskImage))
    .not.toBe('none');

  await waveform.selectOption('square');
  await expect(waveform).toHaveValue('square');
  await expect(waveformIcon).toHaveAttribute('data-waveform', 'square');
  await expect
    .poll(() => page.evaluate(() => (window as any).__appliedAmWaveforms.at(-1)))
    .toEqual(['AM', 'square']);
});
