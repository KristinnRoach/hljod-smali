import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(
    () => ((window as any).getSamplePlayer?.()?.audiobuffer?.length ?? 0) > 0,
    undefined,
    { timeout: 30_000 },
  );
});

test('double-clicking adds and removes envelope points', async ({ page }) => {
  const svg = page.locator('svg.envelope-editor-svg');
  const handles = svg.locator('[data-point]');
  const initialCount = await handles.count();
  const bounds = await svg.boundingBox();

  expect(bounds).not.toBeNull();
  await svg.dblclick({ position: { x: bounds!.width / 2, y: bounds!.height * 0.8 } });
  await expect(handles).toHaveCount(initialCount + 1);

  await handles.nth(1).dblclick();
  await expect(handles).toHaveCount(initialCount);
});
