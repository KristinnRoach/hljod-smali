import { createSignal, onCleanup, onMount, type Component } from 'solid-js';

import styles from './SolidKnob.module.css';

export interface SolidKnobElement extends HTMLDivElement {
  setValue: (value: number) => void;
  setValueNormalized: (value: number) => void;
}

interface SolidKnobProps {
  label: string;
  'aria-valuetext'?: string;
  value: number;
  min: number;
  max: number;
  defaultValue: number;
  title?: string;
  size?: number;
  step?: number;
  /** Step used while shift-dragging or pressing Shift+arrow. */
  fineStep?: number;
  curve?: number;
  allowedValues?: readonly number[];
  class?: string;
  disabled?: boolean;
  onChange: (value: number) => void;
}

const SolidKnob: Component<SolidKnobProps> = (props) => {
  const [isDragging, setIsDragging] = createSignal(false);
  let knob!: SolidKnobElement;
  let startY = 0;
  let startProgress = 0;
  let isFine = false;

  const clamp = (value: number) => Math.max(props.min, Math.min(props.max, value));
  const snap = (value: number, step = props.step) => {
    if (props.allowedValues?.length) {
      return props.allowedValues.reduce((closest, candidate) =>
        Math.abs(candidate - value) < Math.abs(closest - value) ? candidate : closest,
      );
    }
    return step ? Math.round(value / step) * step : value;
  };
  const progress = (value = props.value) =>
    Math.pow((clamp(value) - props.min) / (props.max - props.min), 1 / (props.curve ?? 1));
  const fromProgress = (normalized: number) =>
    props.min +
    Math.pow(Math.max(0, Math.min(1, normalized)), props.curve ?? 1) * (props.max - props.min);
  const setValue = (value: number, step = props.step) => {
    if (!props.disabled) props.onChange(clamp(snap(value, step)));
  };
  const rotation = () => progress() * 300 - 150;

  const handlePointerMove = (event: PointerEvent) => {
    if (!isDragging()) return;
    // Rebase when shift is toggled mid-drag, or the accumulated delta gets
    // rescaled by the new sensitivity and the value jumps.
    if (event.shiftKey !== isFine) {
      isFine = event.shiftKey;
      startY = event.clientY;
      startProgress = progress();
    }
    const step = isFine ? (props.fineStep ?? props.step) : props.step;
    const target = clamp(
      snap(fromProgress(startProgress + (startY - event.clientY) / (isFine ? 1500 : 150)), step),
    );
    setValue(target, step);
    // Parent adjusted the value (e.g. friction/detent): continue the drag from there.
    if (props.value !== target) {
      startY = event.clientY;
      startProgress = progress();
    }
  };

  const stopDragging = (event: PointerEvent) => {
    if (!isDragging()) return;
    setIsDragging(false);
    // The pointer is already gone after pointercancel, so capture may be released.
    if (knob.hasPointerCapture(event.pointerId)) knob.releasePointerCapture(event.pointerId);
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', stopDragging);
    window.removeEventListener('pointercancel', stopDragging);
  };

  const startDragging = (event: PointerEvent) => {
    if (props.disabled) return;
    event.preventDefault();
    knob.focus({ preventScroll: true });
    setIsDragging(true);
    startY = event.clientY;
    startProgress = progress();
    isFine = event.shiftKey;
    knob.setPointerCapture(event.pointerId);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', stopDragging);
    window.addEventListener('pointercancel', stopDragging);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    const direction = ['ArrowUp', 'ArrowRight'].includes(event.key)
      ? 1
      : ['ArrowDown', 'ArrowLeft'].includes(event.key)
        ? -1
        : 0;
    if (event.key === 'Home') setValue(props.min);
    else if (event.key === 'End') setValue(props.max);
    else if (direction) {
      const values = props.allowedValues;
      if (values?.length) {
        const ordered = [...values].sort((a, b) => a - b);
        const next =
          direction > 0
            ? (ordered.find((value) => value > props.value) ?? ordered.at(-1)!)
            : (ordered.findLast((value) => value < props.value) ?? ordered[0]);
        setValue(next);
      } else {
        const step = (event.shiftKey ? props.fineStep : undefined) ?? props.step;
        setValue(props.value + direction * (step ?? (props.max - props.min) / 100), step);
      }
    } else return;
    event.preventDefault();
  };

  onMount(() => {
    knob.setValue = setValue;
    knob.setValueNormalized = (value) => setValue(fromProgress(value));
  });

  onCleanup(() => {
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', stopDragging);
    window.removeEventListener('pointercancel', stopDragging);
  });

  return (
    <div
      ref={knob}
      data-knob
      data-default-value={props.defaultValue}
      class={`${styles.knob} ${props.class ?? ''}`}
      title={props.title || ''}
      role="slider"
      tabIndex={props.disabled ? -1 : 0}
      aria-label={props.label}
      aria-disabled={props.disabled}
      aria-valuemin={props.min}
      aria-valuemax={props.max}
      aria-valuenow={props.value}
      aria-valuetext={props['aria-valuetext']}
      onPointerDown={startDragging}
      onDblClick={() => setValue(props.defaultValue)}
      onKeyDown={handleKeyDown}
      style={{
        '--knob-size': `${props.size ?? 40}px`,
        '--knob-rotation': `${rotation()}deg`,
      }}
    >
      <span />
    </div>
  );
};

export default SolidKnob;
