import { expect, test } from 'vite-plus/test';

// Unit tests run in node: stand up the window and storage the module touches.
const store = new Map<string, string>();
Object.assign(globalThis, {
  window: globalThis,
  localStorage: {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
  },
});
store.set('flag:stored-off', '0');
const { featureFlag, featureFlags, setFeatureFlag } = await import('./featureFlag');

test('a flag defaults to on in DEV, a stored choice wins, and setting it persists', () => {
  expect(import.meta.env.DEV).toBe(true);
  const fresh = featureFlag('fresh', 'Fresh');
  const storedOff = featureFlag('stored-off', 'Stored off');
  expect([fresh(), storedOff()]).toEqual([true, false]);

  expect(setFeatureFlag('stored-off', true)).toBe('Stored off on.');
  expect(storedOff()).toBe(true);
  expect(store.get('flag:stored-off')).toBe('1');

  expect(featureFlags().map(({ name }) => name)).toEqual(['fresh', 'stored-off']);
  expect(() => setFeatureFlag('nope', true)).toThrow('Unknown feature flag "nope"');
});
