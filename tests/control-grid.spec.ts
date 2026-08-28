import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => Boolean((window as any).getSamplePlayer?.()), undefined, {
    timeout: 30_000,
  });
});

test('control groups collapse from their legend and row control', async ({ page }) => {
  const sampleGroup = page.locator('.sample-group');

  await page.getByText('Sample', { exact: true }).click();
  await expect(sampleGroup).toHaveClass(/collapsed/);

  await page.locator('.row-collapse-icon[data-row="1"]').click({ force: true });
  await expect(sampleGroup).toHaveClass(/collapsed/);
  await expect(page.locator('.env-group')).toHaveClass(/collapsed/);
  await expect(page.locator('.space-group')).toHaveClass(/collapsed/);

  await page.locator('.row-collapse-icon[data-row="1"]').click({ force: true });
  await expect(sampleGroup).not.toHaveClass(/collapsed/);
});

test('reset restores shared parameter defaults', async ({ page }) => {
  const volumeKnob = page.locator('[data-param="volume"] knob-element');
  const defaultValue = Number(await volumeKnob.getAttribute('default-value'));
  const changedValue = defaultValue === 0 ? 0.5 : 0;

  await volumeKnob.evaluate((element, value) => {
    element.dispatchEvent(new CustomEvent('knob-change', { detail: { value } }));
  }, changedValue);
  await expect
    .poll(() => volumeKnob.evaluate((element: any) => element.getValue()))
    .toBe(changedValue);

  await page.getByTitle('Reset knobs').click();
  await expect
    .poll(() => volumeKnob.evaluate((element: any) => element.getValue()))
    .toBe(defaultValue);
});
