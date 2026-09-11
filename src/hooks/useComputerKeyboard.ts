import { type Accessor, type Setter, createSignal, onCleanup, onMount } from 'solid-js';
import type { KeyMap, SamplePlayer } from '@kidlib/web-audio';

const MIN_OCTAVE_OFFSET = -3;
const MAX_OCTAVE_OFFSET = 3;

type ComputerKeyboardOptions = {
  player: Accessor<SamplePlayer | null>;
  keymap: Accessor<KeyMap>;
  octaveOffset: Accessor<number>;
  setOctaveOffset: Setter<number>;
};

const isEditableTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;

  if (target instanceof HTMLTextAreaElement) return true;
  if (target instanceof HTMLInputElement) {
    return ['text', 'search', 'email', 'password', 'url', 'tel'].includes(target.type);
  }

  return false;
};

export const useComputerKeyboard = ({
  player,
  keymap,
  octaveOffset,
  setOctaveOffset,
}: ComputerKeyboardOptions) => {
  const [pressedNotes, setPressedNotes] = createSignal<ReadonlySet<number>>(new Set());
  const [loopEnabled, setLoopEnabled] = createSignal(false);
  const [holdEnabled, setHoldEnabled] = createSignal(false);
  const pressedKeys = new Map<string, { note: number; player: SamplePlayer }>();
  let spacePressed = false;

  const syncPressedNotes = () => {
    setPressedNotes(new Set([...pressedKeys.values()].map(({ note }) => note)));
  };

  const releasePressedNotes = () => {
    const players = new Set<SamplePlayer>();
    const activePlayer = player();
    if (activePlayer) players.add(activePlayer);
    for (const pressed of pressedKeys.values()) players.add(pressed.player);

    for (const activePlayer of players) {
      activePlayer.setLoopEnabled(false);
      activePlayer.setHoldEnabled(false);
      activePlayer.releaseAll();
    }

    pressedKeys.clear();
    syncPressedNotes();
    spacePressed = false;
    setLoopEnabled(false);
    setHoldEnabled(false);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (
      event.repeat ||
      isEditableTarget(event.target) ||
      event.metaKey ||
      event.ctrlKey ||
      event.altKey
    ) {
      return;
    }

    if (event.code === 'Backquote') {
      event.preventDefault();
      const direction = event.shiftKey ? 1 : -1;
      setOctaveOffset((current) =>
        Math.max(MIN_OCTAVE_OFFSET, Math.min(MAX_OCTAVE_OFFSET, current + direction)),
      );
    }

    const activePlayer = player();
    if (!activePlayer) return;

    if (event.code === 'Space') {
      event.preventDefault();
      event.stopPropagation();
      spacePressed = true;
    }

    const nextLoopEnabled =
      (event.code === 'CapsLock' || event.getModifierState('CapsLock')) !== spacePressed;
    const nextHoldEnabled = event.shiftKey !== spacePressed;

    setLoopEnabled(nextLoopEnabled);
    setHoldEnabled(nextHoldEnabled);
    activePlayer.setLoopEnabled(nextLoopEnabled);
    activePlayer.setHoldEnabled(nextHoldEnabled);

    const midiNote = keymap()[event.code];
    if (midiNote === undefined || pressedKeys.has(event.code)) return;

    event.preventDefault();
    const adjustedMidiNote = midiNote + octaveOffset() * 12;

    pressedKeys.set(event.code, {
      note: adjustedMidiNote,
      player: activePlayer,
    });
    syncPressedNotes();
    activePlayer.play(adjustedMidiNote);
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    const pressed = pressedKeys.get(event.code);
    if (pressed) {
      pressed.player.release(pressed.note);
      pressedKeys.delete(event.code);
      syncPressedNotes();
    }

    if (isEditableTarget(event.target)) return;

    const activePlayer = player();
    if (!activePlayer) return;

    if (event.code === 'CapsLock') {
      setLoopEnabled(false);
      activePlayer.setLoopEnabled(false);
    } else if (event.code === 'Space') {
      spacePressed = false;
      const nextLoopEnabled = event.getModifierState('CapsLock');
      const nextHoldEnabled = event.shiftKey;
      setLoopEnabled(nextLoopEnabled);
      setHoldEnabled(nextHoldEnabled);
      activePlayer.setLoopEnabled(nextLoopEnabled);
      activePlayer.setHoldEnabled(nextHoldEnabled);
    }
  };

  onMount(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', releasePressedNotes);
  });

  onCleanup(() => {
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('keyup', handleKeyUp);
    window.removeEventListener('blur', releasePressedNotes);
    releasePressedNotes();
  });

  return { pressedNotes, loopEnabled, holdEnabled };
};
