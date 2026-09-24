import { expect, test } from 'vite-plus/test';
import { createRoot } from 'solid-js';
import type { KeyMap, SamplePlayer } from '@kidlib/web-audio';

import { useComputerKeyboard } from './useComputerKeyboard';

const KEYMAP = { KeyA: 60, KeyS: 62, KeyD: 64, KeyF: 65 } as unknown as KeyMap;

/**
 * The hook binds to document/window on mount. Unit tests run in node (see
 * vite.config.ts), so stand up only the listener surface it touches and call
 * the captured handlers directly -- no jsdom, no audio.
 */
function mount() {
  const listeners: Record<string, (event: unknown) => void> = {};
  const bind = {
    addEventListener: (t: string, h: never) => (listeners[t] = h),
    removeEventListener: () => {},
  };
  const globals = globalThis as Record<string, unknown>;
  globals.document = bind;
  globals.window = bind;
  // Just enough for isEditableTarget's instanceof checks and the focus handling.
  globals.HTMLElement = class {};
  globals.HTMLTextAreaElement = class {};
  globals.HTMLInputElement = class {};

  const calls: string[] = [];
  const player = {
    play: (note: number) => calls.push(`play ${note}`),
    release: (note: number) => calls.push(`release ${note}`),
    releaseAll: () => calls.push('releaseAll'),
    setLoopEnabled: () => {},
    setHoldEnabled: () => {},
  } as unknown as SamplePlayer;

  let dispose!: () => void;
  const api = createRoot((disposeRoot) => {
    dispose = disposeRoot;
    return useComputerKeyboard({
      player: () => player,
      keymap: () => KEYMAP,
      octaveOffset: () => 0,
      setOctaveOffset: (() => 0) as never,
    });
  });

  return { listeners, calls, api, dispose };
}

const keyEvent = (code: string, extra: Record<string, unknown> = {}) => ({
  code,
  repeat: false,
  target: null,
  metaKey: false,
  ctrlKey: false,
  altKey: false,
  shiftKey: false,
  getModifierState: () => false,
  preventDefault: () => {},
  stopPropagation: () => {},
  ...extra,
});

test('every key release releases the note its press played, in any order', () => {
  const { listeners, calls, api, dispose } = mount();
  const keys = ['KeyA', 'KeyS', 'KeyD', 'KeyF'];

  for (const code of keys) listeners.keydown(keyEvent(code));
  // Auto-repeat while a key is held must not retrigger the note.
  listeners.keydown(keyEvent('KeyA', { repeat: true }));
  expect(calls).toEqual(['play 60', 'play 62', 'play 64', 'play 65']);

  // Reverse order: releasing out of order is where the bookkeeping goes wrong.
  for (const code of [...keys].reverse()) listeners.keyup(keyEvent(code));

  expect(calls.slice(4)).toEqual(['release 65', 'release 64', 'release 62', 'release 60']);
  expect([...api.pressedNotes()]).toEqual([]);
  dispose();
});

test('losing focus releases everything still held', () => {
  const { listeners, calls, api, dispose } = mount();

  listeners.keydown(keyEvent('KeyA'));
  listeners.keydown(keyEvent('KeyS'));
  listeners.blur({});

  expect(calls).toContain('releaseAll');
  expect([...api.pressedNotes()]).toEqual([]);

  // The keyup that arrives after the window comes back must not double-release.
  listeners.keyup(keyEvent('KeyA'));
  expect(calls.filter((call) => call.startsWith('release '))).toEqual([]);
  dispose();
});

test('instrument keys blur the focused control and block its default, unmapped keys do not', () => {
  const { listeners, dispose } = mount();
  const log: string[] = [];
  const HTMLElementStub = (globalThis as Record<string, unknown>).HTMLElement as new () => object;
  const control = Object.assign(new HTMLElementStub(), { blur: () => log.push('blur') });
  const press = (code: string, extra: Record<string, unknown> = {}) =>
    listeners.keydown(
      keyEvent(code, {
        target: control,
        preventDefault: () => log.push(`prevent ${code}`),
        ...extra,
      }),
    );

  press('KeyA');
  press('KeyA', { repeat: true });
  press('Space');
  press('ArrowLeft');

  expect(log).toEqual(['prevent KeyA', 'blur', 'prevent KeyA', 'blur', 'prevent Space', 'blur']);
  dispose();
});
