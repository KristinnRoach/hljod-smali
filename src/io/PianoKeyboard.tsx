import { createEffect, createSignal, onCleanup, onMount } from 'solid-js';
import type { KeyMap, SamplePlayer } from '@kidlib/web-audio';
import { playNote, releaseNote } from './noteInput';
import './webaudio-keyboard';

const KEY_COUNT = 25;

type PianoPointerEvent = Event & { note: [0 | 1, number] };

type PianoKeyboardProps = {
  player: SamplePlayer | null;
  keymap: KeyMap;
  octaveOffset: number;
  pressedNotes: ReadonlySet<number>;
  height?: number;
};

const PianoKeyboard = (props: PianoKeyboardProps) => {
  let keyboard!: WebAudioKeyboardElement;
  let container!: HTMLDivElement;
  const [width, setWidth] = createSignal(300);
  let displayedPressedNotes = new Set<number>();

  const getDisplayRange = () => {
    const notes = Object.values(props.keymap);
    const keymapMin = notes.length ? Math.min(...notes) : 48;

    return { min: keymapMin + props.octaveOffset * 12, keys: KEY_COUNT };
  };

  const handlePointer = (event: Event) => {
    const [noteState, note] = (event as PianoPointerEvent).note;

    if (!props.player) return;
    if (noteState === 1) playNote(props.player, note, 100, event.timeStamp);
    else releaseNote(props.player, note, event.timeStamp);
  };

  onMount(() => {
    keyboard.addEventListener('pointer', handlePointer);

    // Set the real width, not a CSS scale: the element maps pointers to notes in canvas px.
    const resizeObserver = new ResizeObserver(([entry]) => {
      const available = Math.floor(entry.contentRect.width);
      if (available > 0) setWidth(available);
    });
    resizeObserver.observe(container);

    onCleanup(() => {
      keyboard.removeEventListener('pointer', handlePointer);
      resizeObserver.disconnect();
    });
  });

  createEffect(() => {
    const { min, keys } = getDisplayRange();
    keyboard.width = width();
    keyboard.height = props.height ?? 60;
    keyboard.min = min;
    keyboard.keys = keys;
    displayedPressedNotes = new Set();
  });

  createEffect(() => {
    getDisplayRange();
    const nextNotes = new Set(props.pressedNotes);

    for (const note of displayedPressedNotes) {
      if (!nextNotes.has(note)) keyboard.setNote(0, note);
    }
    for (const note of nextNotes) {
      if (!displayedPressedNotes.has(note)) keyboard.setNote(1, note);
    }

    displayedPressedNotes = nextNotes;
  });

  return (
    <div ref={container} id="piano-keyboard" class="piano-keyboard piano-keyboard-control">
      <webaudio-keyboard ref={keyboard} />
    </div>
  );
};

export default PianoKeyboard;
