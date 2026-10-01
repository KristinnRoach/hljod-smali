import { createSignal, type Accessor, type Setter } from 'solid-js';

// Feature flags for work that isn't ready for everyone. On by default in DEV,
// off in PROD. A choice made through setFeatureFlag persists per browser and
// wins in both. Console and WebMCP use setFeatureFlag; listFeatureFlags lists them.
// Only explicit flag controls change flags; feature actions must never change them.

type Flag = { label: string; on: Accessor<boolean>; set: Setter<boolean> };

const flags = new Map<string, Flag>();
const storageKey = (name: string) => `flag:${name}`;

const read = (name: string): boolean => {
  try {
    const stored = localStorage.getItem(storageKey(name));
    if (stored !== null) return stored === '1';
  } catch {
    // No storage: fall back to the default.
  }
  return import.meta.env.DEV;
};

/** Declares a flag, at module scope so it is listed before WebMCP registers. */
export function featureFlag(name: string, label: string): Accessor<boolean> {
  let flag = flags.get(name);
  if (!flag) {
    const [on, set] = createSignal(read(name));
    flag = { label, on, set };
    flags.set(name, flag);
  }
  return flag.on;
}

export function setFeatureFlag(name: string, on: boolean): string {
  if (typeof on !== 'boolean') throw new Error('on must be a boolean.');
  const flag = flags.get(name);
  if (!flag) {
    throw new Error(`Unknown feature flag "${name}". Known: ${[...flags.keys()].join(', ')}.`);
  }
  try {
    localStorage.setItem(storageKey(name), on ? '1' : '0');
  } catch {
    // Persistence is optional; the flag still changes for this session.
  }
  flag.set(on);
  return `${flag.label} ${on ? 'on' : 'off'}.`;
}

export function listFeatureFlags(): { name: string; label: string; on: boolean }[] {
  return [...flags].map(([name, { label, on }]) => ({ name, label, on: on() }));
}

Object.assign(window, { setFeatureFlag, listFeatureFlags });
