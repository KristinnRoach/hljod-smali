import {
  For,
  createEffect,
  createSignal,
  onCleanup,
  untrack,
  type Component,
  type JSX,
} from 'solid-js';
import { addPoint, movePoint, removePoint, type PointEnvelopeState } from './envelopeState';
import styles from './EnvelopeEditor.module.css';

export interface PointEnvelopeEditorProps {
  state: PointEnvelopeState;
  onChange: (state: PointEnvelopeState) => void;
  /** Whether double-click/tap may add and remove points. Defaults to true. */
  allowAddRemovePoints?: boolean;
  /** Change this value to cancel an in-progress drag. */
  resetToken?: unknown;
  /** Optional non-interactive content rendered behind the envelope. */
  underlay?: JSX.Element;
}

// Fixed user-space box, stretched to the container. Handles are rects, not
// circles, so the non-uniform stretch cannot distort them.
const W = 600;
const H = 200;
const HANDLE = 10;

interface DragState {
  pointerId: number;
  pointIndex: number;
  maxTime: number;
}

/** Controlled editor for the multi-breakpoint envelope shape. */
export const PointEnvelopeEditor: Component<PointEnvelopeEditorProps> = (props) => {
  const [drag, setDrag] = createSignal<DragState | null>(null);
  let svg: SVGSVGElement | undefined;

  const canAddRemovePoints = () => props.allowAddRemovePoints !== false;

  const stateMaxTime = () => props.state.shape.points.at(-1)?.time || 1;
  // Keep the viewport fixed for the duration of a drag. In particular, moving
  // the final point must not also move the coordinate system under the pointer.
  const maxTime = () => drag()?.maxTime ?? stateMaxTime();
  const range = () => props.state.shape.valueRange;
  const toX = (time: number) => (time / maxTime()) * W;
  const toY = (value: number) => {
    const [min, max] = range();
    const span = max - min || 1;
    return H - ((value - min) / span) * H;
  };

  const cancelDrag = () => {
    const pointerId = untrack(drag)?.pointerId;
    setDrag(null);
    if (svg && pointerId !== undefined && svg.hasPointerCapture(pointerId)) {
      svg.releasePointerCapture(pointerId);
    }
  };

  createEffect(() => {
    void props.resetToken;
    cancelDrag();
  });
  onCleanup(cancelDrag);

  const fromEvent = (event: Pick<PointerEvent, 'clientX' | 'clientY'>) => {
    const rect = svg!.getBoundingClientRect();
    const [min, max] = range();
    return {
      time: ((event.clientX - rect.left) / rect.width) * maxTime(),
      value: min + (1 - (event.clientY - rect.top) / rect.height) * (max - min),
    };
  };

  const pointIndexFromTarget = (target: EventTarget | null) => {
    const pointElement = target instanceof Element ? target.closest('[data-point]') : null;
    if (!pointElement) return null;

    const value = pointElement.getAttribute('data-point');
    const index = Number(value);
    if (value === null || !Number.isInteger(index) || index < 0) {
      console.error('PointEnvelopeEditor: point handle has an invalid data-point attribute', value);
      return undefined;
    }
    return index;
  };

  // ponytail: the browser's own double-click detection (timing, movement
  // tolerance, per-device tuning) replaces a hand-rolled tap tracker.
  const onDoubleClick = (event: MouseEvent) => {
    if (!canAddRemovePoints()) return;
    // Pointer capture during the drag retargets the compat mouse events to the
    // svg, so event.target no longer names the handle under the cursor.
    const pointIndex = pointIndexFromTarget(
      document.elementFromPoint(event.clientX, event.clientY) ?? event.target,
    );
    if (pointIndex === undefined) return;
    if (pointIndex !== null) {
      const next = removePoint(props.state, pointIndex);
      if (next !== props.state) props.onChange(next);
      return;
    }

    const { time, value } = fromEvent(event);
    props.onChange(addPoint(props.state, time, value));
  };

  const onPointerMove = (event: PointerEvent) => {
    const activeDrag = drag();
    if (!activeDrag || event.pointerId !== activeDrag.pointerId) return;
    const { time, value } = fromEvent(event);
    const next = movePoint(props.state, activeDrag.pointIndex, time, value);
    if (next !== props.state) props.onChange(next);
  };

  const endDrag = (event: PointerEvent) => {
    if (event.pointerId === drag()?.pointerId) cancelDrag();
  };

  const onPointerDown = (event: PointerEvent) => {
    if (!event.isPrimary || event.button !== 0) return;
    const pointIndex = pointIndexFromTarget(event.target);
    if (pointIndex === null || pointIndex === undefined) return;
    setDrag({ pointerId: event.pointerId, pointIndex, maxTime: stateMaxTime() });
    svg!.setPointerCapture(event.pointerId);
  };

  const setSustainIndex = (value: string) => {
    props.onChange({
      ...props.state,
      shape: {
        ...props.state.shape,
        sustainIndex: value === 'none' ? null : Number(value),
      },
    });
  };

  const setReleaseIndex = (value: string) => {
    props.onChange({
      ...props.state,
      shape: {
        ...props.state.shape,
        releaseIndex: Number(value),
      },
    });
  };

  const pointRole = (index: number) => {
    const isSustain = index === props.state.shape.sustainIndex;
    const isRelease = index === props.state.shape.releaseIndex;
    if (isSustain && isRelease) return 'sustain-release';
    if (isSustain) return 'sustain';
    if (isRelease) return 'release';
    return 'normal';
  };

  const pointLabel = (index: number) => {
    const role = pointRole(index);
    if (role === 'sustain-release') return `Point ${index}: sustain and release`;
    if (role === 'sustain') return `Point ${index}: sustain`;
    if (role === 'release') return `Point ${index}: release`;
    return `Point ${index}`;
  };

  return (
    <div class="envelope-editor-shape envelope-editor-points-shape">
      <div class="envelope-editor-shape-controls">
        <label>
          Sustain
          <select
            value={String(props.state.shape.sustainIndex ?? 'none')}
            onChange={(event) => setSustainIndex(event.currentTarget.value)}
          >
            <option value="none" selected={props.state.shape.sustainIndex == null}>
              none
            </option>
            <For each={props.state.shape.points}>
              {(_point, index) => (
                <option
                  value={String(index())}
                  selected={index() === props.state.shape.sustainIndex}
                >
                  {index()}
                </option>
              )}
            </For>
          </select>
        </label>
      </div>

      <div class="envelope-editor-shape-controls">
        <label>
          Release
          <select
            value={String(props.state.shape.releaseIndex)}
            onChange={(event) => setReleaseIndex(event.currentTarget.value)}
          >
            <For each={props.state.shape.points}>
              {(_point, index) => (
                <option
                  value={String(index())}
                  selected={index() === props.state.shape.releaseIndex}
                >
                  {index()}
                </option>
              )}
            </For>
          </select>
        </label>
      </div>

      <svg
        ref={svg}
        class={`${styles.svg} ${drag() ? styles.dragging : ''} envelope-editor-svg envelope-editor-points`}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        width="100%"
        height="200"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onLostPointerCapture={endDrag}
        onDblClick={onDoubleClick}
      >
        {props.underlay}
        <polyline
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          vector-effect="non-scaling-stroke"
          points={props.state.shape.points
            .map((point) => `${toX(point.time)},${toY(point.value)}`)
            .join(' ')}
        />
        <For each={props.state.shape.points}>
          {(point, index) => (
            <rect
              class={styles.point}
              data-point={index()}
              data-role={pointRole(index())}
              x={toX(point.time) - HANDLE / 2}
              y={toY(point.value) - HANDLE / 2}
              width={HANDLE}
              height={HANDLE}
              vector-effect="non-scaling-stroke"
            >
              <title>{pointLabel(index())}</title>
            </rect>
          )}
        </For>
      </svg>
    </div>
  );
};

export default PointEnvelopeEditor;
