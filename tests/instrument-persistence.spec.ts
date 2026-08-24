import { test, expect, type Page } from '@playwright/test';

const waitForLoadedSample = (page: Page) =>
  page.waitForFunction(
    () => ((window as any).getSamplePlayer?.()?.audiobuffer?.length ?? 0) > 0,
    undefined,
    {
      timeout: 30_000,
    },
  );

const readWorkingSampleCount = (page: Page) =>
  page.evaluate(
    () =>
      new Promise<number>((resolve, reject) => {
        const req = indexedDB.open('SampleDatabase');
        req.onerror = () => reject(req.error);
        req.onsuccess = () => {
          const opened = req.result;
          const tx = opened.transaction('workingSamples', 'readonly');
          const get = tx.objectStore('workingSamples').get('current');
          // Close before resolving: a lingering second connection blocks the
          // app's Dexie on the next schema bump.
          get.onsuccess = () => {
            opened.close();
            resolve(get.result?.layers?.length ?? 0);
          };
          get.onerror = () => {
            opened.close();
            reject(get.error);
          };
        };
      }),
  );

// Covers the wiring that instrumentLibrary's unit tests can't reach: App,
// SaveButton and InstrumentListSection all going through the one module, plus
// the working-samples restore on reload.
test.describe('instrument persistence', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Start from an empty library so `Instrument 1` is predictable.
    await page.evaluate(() => indexedDB.deleteDatabase('SampleDatabase'));
    await page.reload();
    await waitForLoadedSample(page);
  });

  const openLibrary = async (page: Page) => {
    await page.getByTitle('Toggle Toolbar').click();
    await page.getByTitle('View saved instruments').click();
    await expect(page.locator('.sidebar')).toHaveClass(/sidebar-open/);
  };

  test('saving adds the instrument to the library without a manual refresh', async ({ page }) => {
    await page.getByTitle('Toggle Toolbar').click();
    await page.locator('save-button').click();

    const nameInput = page.getByPlaceholder('Instrument Name');
    await expect(nameInput).toHaveValue('Instrument 1');
    await nameInput.press('Enter');

    await expect(page.getByText('Saved “Instrument 1”')).toBeVisible();

    // The list refreshes via instrumentLibrary.subscribe(), not a document event.
    await page.getByTitle('View saved instruments').click();
    await expect(page.locator('.instrument-name', { hasText: 'Instrument 1' })).toBeVisible();
  });

  test('the built-in instrument is always listed first', async ({ page }) => {
    await openLibrary(page);
    await expect(page.locator('.instrument-name').first()).toHaveText('Default');
  });

  test('selecting the built-in instrument does not prefill its name on save', async ({ page }) => {
    await openLibrary(page);
    await page.locator('.instrument-name', { hasText: 'Default' }).click();
    await expect(page.locator('.sidebar')).not.toHaveClass(/sidebar-open/);

    await page.locator('save-button').click();
    // "Default" would collide with the built-in instrument's own list entry.
    await expect(page.getByPlaceholder('Instrument Name')).toHaveValue('Instrument 1');
  });

  test('a deleted instrument leaves the library', async ({ page }) => {
    await page.getByTitle('Toggle Toolbar').click();
    await page.locator('save-button').click();
    await page.getByPlaceholder('Instrument Name').press('Enter');
    await expect(page.getByText('Saved “Instrument 1”')).toBeVisible();

    await page.getByTitle('View saved instruments').click();
    await page.getByTitle('Delete Instrument 1').click();
    await expect(page.locator('.instrument-name', { hasText: 'Instrument 1' })).toHaveCount(0);
  });

  test('the working samples survive a reload', async ({ page }) => {
    const sampleCountBefore = await page.evaluate(
      () => (window as any).getSamplePlayer()?.layers.length,
    );
    expect(sampleCountBefore).toBeGreaterThan(0);

    await expect.poll(() => readWorkingSampleCount(page)).toBe(sampleCountBefore);

    let builtinRequested = false;
    page.on('request', (request) => {
      if (request.url().includes('/audio/init_sample.webm')) builtinRequested = true;
    });

    await page.reload();
    await waitForLoadedSample(page);
    expect(builtinRequested).toBe(false);

    // Restored from IndexedDB rather than refetched from public/audio/.
    const stored = await readWorkingSampleCount(page);
    expect(stored).toBe(sampleCountBefore);
  });
});
