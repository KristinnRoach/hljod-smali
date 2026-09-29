import { expect, test } from 'vite-plus/test';

const store = new Map<string, string>([['audiopipe', '1']]);
Object.assign(globalThis, {
  window: globalThis,
  localStorage: {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
    removeItem: (key: string) => store.delete(key),
  },
});

const { audioPipeShown } = await import('./audioPipeSwitches');
const { setFeatureFlag } = await import('@/lib/featureFlag');

test('removes the obsolete key and turns off through the shared flag', () => {
  expect(store.has('audiopipe')).toBe(false);
  expect(setFeatureFlag('audiopipe', false)).toBe('AudioPipe off.');
  expect(audioPipeShown()).toBe(false);
  expect(store.get('flag:audiopipe')).toBe('0');
});
