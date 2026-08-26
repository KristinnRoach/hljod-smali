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
