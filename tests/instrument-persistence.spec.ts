import { test, expect, type Page } from '@playwright/test';

import { ENVELOPE_IMPLEMENTATION } from '../src/components/envelopes/implementation';

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
    await page.getByTitle('Save instrument').click();

    const nameInput = page.getByPlaceholder('Instrument Name');
    await expect(nameInput).toHaveValue('Instrument 1');
    await nameInput.press('Enter');

    await expect(page.getByText('Saved “Instrument 1”')).toBeVisible();

    // The list refreshes via instrumentLibrary.subscribe(), not a document event.
    await page.getByTitle('View saved instruments').click();
    await expect(page.locator('.instrument-name', { hasText: 'Instrument 1' })).toBeVisible();
  });

  // These two assert through the legacy envelope-switcher DOM (#envelope-path,
  // knob-element), which only mounts under that implementation. The Solid editor
  // draws a <polyline> instead, so the selectors match nothing there.
  test.describe('legacy envelope-switcher UI', () => {
    test.skip(
      ENVELOPE_IMPLEMENTATION !== 'envelope-switcher',
      `envelope UI is ${ENVELOPE_IMPLEMENTATION}`,
    );

    test('saved envelope settings are restored with the instrument', async ({ page }) => {
      const path = page.locator('envelope-switcher #envelope-path').first();
      const initialPath = await path.getAttribute('d');

      await page.evaluate(() => {
        const player = (window as any).getSamplePlayer();
        const state = player.getEnvelopeState('amp-env');
        player.applyEnvelopeState('amp-env', {
          ...state,
          enabled: true,
          timeScale: 1.75,
          shape: {
            ...state.shape,
            points: [
              { time: 0, value: 0 },
              { time: 0.2, value: 1 },
              { time: 1, value: 0 },
            ],
            sustainIndex: 1,
            releaseIndex: 1,
          },
        });
      });

      await expect.poll(() => path.getAttribute('d')).not.toBe(initialPath);
      const savedPath = await path.getAttribute('d');

      await page.getByTitle('Toggle Toolbar').click();
      await page.getByTitle('Save instrument').click();
      await page.getByPlaceholder('Instrument Name').press('Enter');
      await expect(page.getByText('Saved “Instrument 1”')).toBeVisible();

      await page.evaluate(() => {
        const player = (window as any).getSamplePlayer();
        const state = player.getEnvelopeState('amp-env');
        player.applyEnvelopeState('amp-env', {
          ...state,
          timeScale: 2.5,
          shape: {
            ...state.shape,
            points: [
              { time: 0, value: 0 },
              { time: 0.8, value: 0.2 },
              { time: 1, value: 0 },
            ],
          },
        });
      });

      await expect.poll(() => path.getAttribute('d')).not.toBe(savedPath);

      await page.getByTitle('View saved instruments').click();
      await page.locator('.instrument-name', { hasText: 'Instrument 1' }).click();

      await expect
        .poll(() =>
          page.evaluate(
            () => (window as any).getSamplePlayer().getEnvelopeState('amp-env').timeScale,
          ),
        )
        .toBe(1.75);
      await expect.poll(() => path.getAttribute('d')).toBe(savedPath);
    });

    test('working envelope settings survive a reload', async ({ page }) => {
      await page
        .locator('envelope-switcher knob-element')
        .first()
        .evaluate((knob: any) => knob.setValue(1.5));

      await expect
        .poll(() =>
          page.evaluate(
            () => (window as any).getSamplePlayer().getEnvelopeState('amp-env').timeScale,
          ),
        )
        .toBe(1.5);

      await page.reload();
      await waitForLoadedSample(page);

      await expect
        .poll(() =>
          page.evaluate(
            () => (window as any).getSamplePlayer().getEnvelopeState('amp-env').timeScale,
          ),
        )
        .toBe(1.5);
    });
  });

  test('the built-in instrument is always listed first', async ({ page }) => {
    await openLibrary(page);
    await expect(page.locator('.instrument-name').first()).toHaveText('Default');
  });

  test('selecting the built-in instrument does not prefill its name on save', async ({ page }) => {
    await openLibrary(page);
    await page.locator('.instrument-name', { hasText: 'Default' }).click();
    await expect(page.locator('.sidebar')).not.toHaveClass(/sidebar-open/);

    await page.getByTitle('Save instrument').click();
    // "Default" would collide with the built-in instrument's own list entry.
    await expect(page.getByPlaceholder('Instrument Name')).toHaveValue('Instrument 1');
  });

  test('a deleted instrument leaves the library', async ({ page }) => {
    await page.getByTitle('Toggle Toolbar').click();
    await page.getByTitle('Save instrument').click();
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
