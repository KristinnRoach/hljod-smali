import { test, expect, type Page } from '@playwright/test';

const waitForLoadedSample = (page: Page) =>
  page.waitForFunction(
    () => ((window as any).getSamplePlayer?.()?.audiobuffer?.length ?? 0) > 0,
    undefined,
    {
      timeout: 30_000,
    },
  );

// Covers the wiring that patchLibrary's unit tests can't reach: App, SaveButton
// and PatchListSection all going through the one module, plus the working-patch
// restore on reload.
test.describe('patch persistence', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Start from an empty library so `Patch 1` is predictable.
    await page.evaluate(() => indexedDB.deleteDatabase('SampleDatabase'));
    await page.reload();
    await waitForLoadedSample(page);
  });

  const openLibrary = async (page: Page) => {
    await page.getByTitle('Toggle Toolbar').click();
    await page.getByTitle('View saved samples').click();
    await expect(page.locator('.sidebar')).toHaveClass(/sidebar-open/);
  };

  test('saving adds the patch to the library without a manual refresh', async ({ page }) => {
    await page.getByTitle('Toggle Toolbar').click();
    await page.locator('save-button').click();

    const nameInput = page.getByPlaceholder('Patch Name');
    await expect(nameInput).toHaveValue('Patch 1');
    await nameInput.press('Enter');

    await expect(page.getByText('Saved “Patch 1”')).toBeVisible();

    // The list refreshes via patchLibrary.subscribe(), not a document event.
    await page.getByTitle('View saved samples').click();
    await expect(page.locator('.sample-name', { hasText: 'Patch 1' })).toBeVisible();
  });

  test('the built-in default patch is always listed first', async ({ page }) => {
    await openLibrary(page);
    await expect(page.locator('.sample-name').first()).toHaveText('Default sample');
  });

  test('a deleted patch leaves the library', async ({ page }) => {
    await page.getByTitle('Toggle Toolbar').click();
    await page.locator('save-button').click();
    await page.getByPlaceholder('Patch Name').press('Enter');
    await expect(page.getByText('Saved “Patch 1”')).toBeVisible();

    await page.getByTitle('View saved samples').click();
    await page.getByTitle('Delete Patch 1').click();
    await expect(page.locator('.sample-name', { hasText: 'Patch 1' })).toHaveCount(0);
  });

  test('the working patch survives a reload', async ({ page }) => {
    const layerCountBefore = await page.evaluate(
      () => (window as any).getSamplePlayer()?.layers.length,
    );
    expect(layerCountBefore).toBeGreaterThan(0);

    await page.reload();
    await waitForLoadedSample(page);

    // Restored from IndexedDB rather than refetched from public/audio/.
    const stored = await page.evaluate(
      () =>
        new Promise<number>((resolve, reject) => {
          const req = indexedDB.open('SampleDatabase');
          req.onerror = () => reject(req.error);
          req.onsuccess = () => {
            const tx = req.result.transaction('workingSamples', 'readonly');
            const get = tx.objectStore('workingSamples').get('current');
            get.onsuccess = () => resolve(get.result?.layers?.length ?? 0);
            get.onerror = () => reject(get.error);
          };
        }),
    );
    expect(stored).toBe(layerCountBefore);
  });
});
