import { expect, test } from '@playwright/test';

test('Shift-selection layers keyboard playback without changing the primary player', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await page.waitForFunction(() => (window as any).getSamplePlayer?.()?.audiobuffer?.length > 0);
  await page.evaluate(() => {
    const primary = (window as any).getSamplePlayer();
    (window as any).__primary = primary;
    (window as any).__calls = [];
    (window as any).__players = new Map();
    for (const method of ['play', 'release', 'releaseAll', 'setLoopEnabled', 'setHoldEnabled']) {
      const prototype = Object.getPrototypeOf(primary);
      const original = prototype[method];
      prototype[method] = function (...args: any[]) {
        (window as any).__players.set(this.nodeId, this);
        (window as any).__calls.push({ method, id: this.nodeId, args });
        return original.apply(this, args);
      };
    }
    (window as any).__draft = sessionStorage.getItem('play:working-param-draft:v1');
  });
  await page.getByTitle('Toggle Toolbar').click();
  await page.getByTitle('View saved instruments').click();
  const sidebar = page.locator('.sidebar');
  const sample = sidebar.getByRole('button', { name: 'Default Built in' });
  await sample.click({ modifiers: ['Shift'] });
  await expect(sidebar.getByText('Extra players: 1')).toBeVisible({ timeout: 30_000 });
  await expect(sidebar).toHaveClass(/sidebar-open/);
  expect(
    await page.evaluate(() => ({
      samePlayer: (window as any).getSamplePlayer() === (window as any).__primary,
      sameDraft: sessionStorage.getItem('play:working-param-draft:v1') === (window as any).__draft,
    })),
  ).toEqual({ samePlayer: true, sameDraft: true });

  await page.keyboard.down('Space');
  await page.keyboard.down('KeyA');
  const played = await page.evaluate(() =>
    (window as any).__calls.filter((call: any) => call.method === 'play'),
  );
  expect(played).toHaveLength(2);
  expect(new Set(played.map((call: any) => call.id)).size).toBe(2);
  expect(played[0].args).toEqual(played[1].args);
  expect(
    await page.evaluate(() =>
      [...(window as any).__players.values()].every(
        (player: any) => player.loopEnabled && player.holdEnabled,
      ),
    ),
  ).toBe(true);
  await page.keyboard.up('KeyA');
  expect(
    await page.evaluate(
      () => (window as any).__calls.filter((call: any) => call.method === 'release').length,
    ),
  ).toBe(2);
  await page.keyboard.up('Space');
  expect(
    await page.evaluate(() =>
      [...(window as any).__players.values()].every(
        (player: any) => !player.loopEnabled && !player.holdEnabled,
      ),
    ),
  ).toBe(true);

  await page.keyboard.down('KeyS');
  await sidebar.getByRole('button', { name: 'Clear layers' }).click();
  await page.keyboard.up('KeyS');
  await expect(sidebar.getByText('Extra players: 0')).toBeVisible();
  expect(
    await page.evaluate(
      () => [...(window as any).__players.values()].filter((player: any) => player.disposed).length,
    ),
  ).toBe(1);
  expect(errors).toEqual([]);
});

test('sample-rate replacement cancels layers and disabling the flag clears them', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByTitle('Toggle Toolbar').click();
  const rate = page.getByLabel('Sample rate', { exact: true });
  await expect(rate).toBeEnabled({ timeout: 30_000 });
  await page.getByTitle('View saved instruments').click();
  const sidebar = page.locator('.sidebar');
  const sample = sidebar.getByRole('button', { name: 'Default Built in' });
  await sample.click({ modifiers: ['Shift'] });
  await expect(sidebar.getByText('Extra players: 1')).toBeVisible({ timeout: 30_000 });
  await sidebar.locator('.close-button').click();
  await rate.selectOption((await rate.inputValue()) === '44100' ? '48000' : '44100');
  await expect(rate).toBeEnabled();
  await page.getByTitle('View saved instruments').click();
  await expect(sidebar.getByText('Extra players: 0')).toBeVisible();
  await sample.click({ modifiers: ['Shift'] });
  await expect(sidebar.getByText('Extra players: 1')).toBeVisible({ timeout: 30_000 });
  await page.evaluate(() => (window as any).setFeatureFlag('sampleLayers', false));
  await expect(sidebar.getByRole('button', { name: 'Clear layers' })).toHaveCount(0);
  await page.evaluate(() => (window as any).setFeatureFlag('sampleLayers', true));
  await expect(sidebar.getByText('Extra players: 0')).toBeVisible();
});

test('the default MIDI sequence schedules and stops both players', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => (window as any).getSamplePlayer?.()?.audiobuffer?.length > 0);
  await page.evaluate(() => (window as any).setFeatureFlag('sequence', true));
  await page.getByTitle('Toggle Toolbar').click();
  await page.getByTitle('View saved instruments').click();
  const sidebar = page.locator('.sidebar');
  await sidebar.getByRole('button', { name: 'Default Built in' }).click({ modifiers: ['Shift'] });
  await expect(sidebar.getByText('Extra players: 1')).toBeVisible({ timeout: 30_000 });
  await sidebar.locator('.close-button').click();
  await page.evaluate(async () => {
    await (window as any).getSamplePlayer().context.resume();
    (window as any).__sequenceCalls = [];
    const prototype = Object.getPrototypeOf((window as any).getSamplePlayer());
    for (const method of ['play', 'releaseAll']) {
      const original = prototype[method];
      prototype[method] = function (...args: any[]) {
        (window as any).__sequenceCalls.push({ method, id: this.nodeId, args });
        return original.apply(this, args);
      };
    }
  });
  await page.getByRole('button', { name: 'Play', exact: true }).click();
  await expect
    .poll(
      () =>
        page.evaluate(
          () =>
            new Set(
              (window as any).__sequenceCalls
                .filter((call: any) => call.method === 'play')
                .map((call: any) => call.id),
            ).size,
        ),
      { timeout: 10_000 },
    )
    .toBe(2);
  const calls = await page.evaluate(() =>
    (window as any).__sequenceCalls.filter((call: any) => call.method === 'play').slice(0, 2),
  );
  expect(calls[0].args).toEqual(calls[1].args);
  expect(calls[0].args[3]).toBeGreaterThanOrEqual(0);
  await page.getByRole('button', { name: 'Stop', exact: true }).click();
  expect(
    await page.evaluate(
      () =>
        new Set(
          (window as any).__sequenceCalls
            .filter((call: any) => call.method === 'releaseAll')
            .map((call: any) => call.id),
        ).size,
    ),
  ).toBe(2);
});
