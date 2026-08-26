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

test('every waveform option renders a parseable icon mask', async ({ page }) => {
  await page.goto('/');
  const options = page.locator('.modulation-waveform-select option');
  const icons = options.locator('.waveform-icon');
  expect(await icons.count()).toBe(await options.count());

  // A malformed mask SVG fails XML parsing, resolves to nothing, and hides the icon.
  const broken = await icons.evaluateAll(async (elements) => {
    const checked = await Promise.all(
      elements.map(async (element) => {
        const name = element.getAttribute('data-waveform');
        const url = getComputedStyle(element).maskImage.match(/url\("?([^")]+)"?\)/)?.[1];
        if (!url) return name;
        const source = url.startsWith('data:')
          ? decodeURIComponent(url.slice(url.indexOf(',') + 1))
          : await (await fetch(url)).text();
        const parsed = new DOMParser().parseFromString(source, 'image/svg+xml');
        return parsed.querySelector('parsererror') ? name : null;
      }),
    );
    return checked.filter(Boolean);
  });

  expect(broken).toEqual([]);
});
