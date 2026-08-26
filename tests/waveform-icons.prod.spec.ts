import { expect, test } from '@playwright/test';

test('built waveform icon masks survive Vite asset inlining', async ({ page }) => {
  await page.goto('/');
  const icons = page.locator('.modulation-waveform-select option .waveform-icon');
  await expect(icons.first()).toBeAttached();

  const broken = await icons.evaluateAll(async (elements) => {
    const checked = await Promise.all(
      elements.map(async (element) => {
        const name = element.getAttribute('data-waveform');
        const url = getComputedStyle(element).maskImage.match(/url\("?([^")]+)"?\)/)?.[1];
        if (!url) return name;
        const image = new Image();
        image.src = url;
        try {
          await image.decode();
          return image.naturalWidth > 0 ? null : name;
        } catch {
          return name;
        }
      }),
    );
    return checked.filter(Boolean);
  });

  expect(broken).toEqual([]);
});
