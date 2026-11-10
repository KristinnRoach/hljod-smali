// fake-indexeddb must install its globals before any Dexie instance opens.
import 'fake-indexeddb/auto';

import Dexie from 'dexie';
import { expect, test } from 'vite-plus/test';

test('opening over an older database wipes it', async () => {
  const old = new Dexie('SampleDatabase');
  old.version(6).stores({ samples: '++id, name, createdAt', workingSamples: 'id' });
  await old.open();
  await old.table('samples').add({ name: 'Old', layers: [new ArrayBuffer(8)] });
  old.close();

  // Imported here so the singleton opens over the database seeded above.
  const { db } = await import('./instrumentDb');
  await db.open();

  expect([...db.backendDB().objectStoreNames].sort()).toEqual(['instruments', 'workingSample']);
  expect(await db.instruments.count()).toBe(0);
  db.close();
});
