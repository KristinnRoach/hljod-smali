import { expect, test, type Locator } from '@playwright/test';

// aria-pressed was correct throughout the off-state regression -- the dim
// colour was the only thing that broke, and only a computed style catches it.
const color = (button: Locator) => button.evaluate((el) => getComputedStyle(el).color);

test('an icon toggle dims when off unless its descriptor opts out', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => Boolean((window as any).getSamplePlayer?.()), undefined, {
    timeout: 30_000,
  });

  // loopLock draws the same glyph either way, so the colour carries the state.
  const loop = page.getByRole('button', { name: 'Toggle Loop Locked' });
  await expect(loop).toHaveAttribute('aria-pressed', 'false');
  const loopOff = await color(loop);

  await loop.click();
  await expect(loop).toHaveAttribute('aria-pressed', 'true');
  expect(await color(loop)).not.toBe(loopOff);

  // playbackDirection swaps forward/reverse icons: neither state is inactive.
  const direction = page.getByRole('button', { name: 'Toggle Playback Direction' });
  const directionOff = await color(direction);
  await direction.click();
  await expect(direction).toHaveAttribute('aria-pressed', 'true');
  expect(await color(direction)).toBe(directionOff);
});
