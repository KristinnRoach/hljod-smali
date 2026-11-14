import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => Boolean((window as any).getSamplePlayer?.()), undefined, {
    timeout: 30_000,
  });
});

test('control groups collapse from their legend and row control', async ({ page }) => {
  const sampleGroup = page.locator('.sample-group');

  const colorGroup = page.locator('.color-group');
  await page.getByText('Color', { exact: true }).click();
  await expect(colorGroup).toHaveClass(/collapsed/);

  await page.locator('.row-collapse-icon[data-row="2"]').click({ force: true });
  await expect(sampleGroup).toHaveClass(/collapsed/);
  await expect(colorGroup).toHaveClass(/collapsed/);

  await page.locator('.row-collapse-icon[data-row="2"]').click({ force: true });
  await expect(sampleGroup).not.toHaveClass(/collapsed/);
  await expect(colorGroup).not.toHaveClass(/collapsed/);
});

test('reset restores shared parameter defaults', async ({ page }) => {
  const volumeKnob = page.locator('[data-param="volume"] [data-knob]');
  const defaultValue = Number(await volumeKnob.getAttribute('data-default-value'));
  const changedValue = defaultValue === 0 ? 0.5 : 0;

  await volumeKnob.evaluate((element, value) => {
    (element as any).setValue(value);
  }, changedValue);
  await expect.poll(() => volumeKnob.getAttribute('aria-valuenow').then(Number)).toBe(changedValue);

  await page.getByRole('button', { name: 'Reset Knobs' }).click();
  await expect.poll(() => volumeKnob.getAttribute('aria-valuenow').then(Number)).toBe(defaultValue);
});

test('tuning returns to whole steps when switching to coarse controls', async ({ page }) => {
  const knob = page.locator('[data-param="transpose"] [data-knob]');
  const value = async () => Number(await knob.getAttribute('aria-valuenow'));
  await knob.dblclick();
  await expect(knob).toBeFocused();
  await page.keyboard.press('Shift+ArrowUp');
  expect(await value()).toBeCloseTo(0.01);
  await knob.press('ArrowUp');
  expect(await value()).toBeCloseTo(1);

  const box = (await knob.boundingBox())!;
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.keyboard.down('Shift');
  await page.mouse.down();
  await page.mouse.move(x, y - 3);
  const fineValue = await value();
  expect(fineValue).toBeGreaterThan(1);
  await page.keyboard.up('Shift');
  expect(await value()).toBeCloseTo(fineValue);
  await page.mouse.move(x, y - 4);
  expect(await value()).toBeCloseTo(Math.round(fineValue));
  await page.mouse.move(x, y - 8);
  const coarseValue = await value();
  expect(coarseValue).toBeGreaterThan(Math.round(fineValue));
  expect(coarseValue).toBeCloseTo(Math.round(coarseValue));
  await page.mouse.up();
  expect(await value()).toBeCloseTo(coarseValue);
});
