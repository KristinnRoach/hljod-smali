import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(
    () => ((window as any).getSamplePlayer?.()?.audiobuffer?.length ?? 0) > 0,
    undefined,
    { timeout: 30_000 },
  );
  test.skip(
    (await page.locator('svg.envelope-editor-svg').count()) === 0,
    'EnvelopeEditor prototype is not selected',
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

test('renders the loaded sample as a non-interactive underlay', async ({ page }) => {
  const waveform = page.locator(
    'svg.envelope-editor-svg > svg[aria-hidden="true"][pointer-events="none"] path',
  );

  await expect(waveform).toHaveAttribute('d', /^M/);
});

test('right-clicking a point does not start a drag', async ({ page }) => {
  const handle = page.locator('svg.envelope-editor-svg [data-point]').nth(1);
  const before = await handle.evaluate((element) => ({
    x: element.getAttribute('x'),
    y: element.getAttribute('y'),
  }));
  const bounds = await handle.boundingBox();

  expect(bounds).not.toBeNull();
  await page.mouse.move(bounds!.x + bounds!.width / 2, bounds!.y + bounds!.height / 2);
  await page.mouse.down({ button: 'right' });
  await page.mouse.move(bounds!.x + bounds!.width * 4, bounds!.y + bounds!.height * 4);
  await page.mouse.up({ button: 'right' });

  await expect
    .poll(() =>
      handle.evaluate((element) => ({
        x: element.getAttribute('x'),
        y: element.getAttribute('y'),
      })),
    )
    .toEqual(before);
});

test('dragging moves an interior point', async ({ page }) => {
  const handle = page.locator('svg.envelope-editor-svg [data-point]').nth(1);
  const before = await page.evaluate(
    () => (window as any).getSamplePlayer().getEnvelopeState('amp-env').shape.points[1],
  );
  const bounds = await handle.boundingBox();

  expect(bounds).not.toBeNull();
  await page.mouse.move(bounds!.x + bounds!.width / 2, bounds!.y + bounds!.height / 2);
  await page.mouse.down();
  await page.mouse.move(bounds!.x + bounds!.width / 2 + 30, bounds!.y + bounds!.height / 2 + 30);
  await page.mouse.up();

  await expect
    .poll(() =>
      page.evaluate(
        () => (window as any).getSamplePlayer().getEnvelopeState('amp-env').shape.points[1].time,
      ),
    )
    .toBeGreaterThan(before.time);
  const after = await page.evaluate(
    () => (window as any).getSamplePlayer().getEnvelopeState('amp-env').shape.points[1],
  );
  expect(after.time).toBeGreaterThan(before.time);
  expect(after.value).toBeLessThan(before.value);
});

test('a click before switching envelopes does not add a point', async ({ page }) => {
  const svg = page.locator('svg.envelope-editor-svg');
  const bounds = await svg.boundingBox();

  expect(bounds).not.toBeNull();
  const position = { x: bounds!.width / 2, y: bounds!.height / 2 };
  await svg.click({ position });
  // sustain/release selects are nested in <label>, so `>` picks the type select
  await page.locator('.envelope-editor-controls > select').selectOption('pitch-env');

  const pitchHandles = svg.locator('[data-point]');
  const initialCount = await pitchHandles.count();
  await svg.click({ position });

  await expect(pitchHandles).toHaveCount(initialCount);
});
