import {
  For,
  Match,
  Show,
  Switch,
  createEffect,
  createSignal,
  onCleanup,
  type Component,
} from 'solid-js';
import type { EnvelopeState, SampleEnvelopeType, SamplePlayer } from '@kidlib/web-audio';
import { addPoint, movePoint, removePoint, type PointEnvelopeState } from './envelopeState';
import styles from './EnvelopeEditor.module.css';

const ENV_TYPES: SampleEnvelopeType[] = ['amp-env', 'filter-env', 'pitch-env'];

export interface PointEnvelopeEditorProps {
  state: PointEnvelopeState;
  onChange: (state: PointEnvelopeState) => void;
  /** Whether double-click/tap may add and remove points. Defaults to true. */
  allowAddRemovePoints?: boolean;
  /** Change this value to cancel any active pointer interaction. */
  resetToken?: unknown;
}

export interface EnvelopeEditorProps {
  player: SamplePlayer | null;
  /** Whether double-click/tap may add and remove points. Defaults to true. */
  allowAddRemovePoints?: boolean;
}

// Fixed user-space box, stretched to the container. Handles are rects, not
// circles, so the non-uniform stretch cannot distort them.
const W = 600;
const H = 200;
const HANDLE = 10;
const DOUBLE_TAP_MS = 500;
const TAP_DISTANCE = 16;

/** Controlled editor for the multi-breakpoint envelope shape. */
export const PointEnvelopeEditor: Component<PointEnvelopeEditorProps> = (props) => {
  const [dragIndex, setDragIndex] = createSignal<number | null>(null);
  const [dragMaxTime, setDragMaxTime] = createSignal<number | null>(null);
  let activePointerId: number | null = null;
  let svg: SVGSVGElement | undefined;
  let pointerStart: {
    pointerId: number;
    pointerType: string;
    x: number;
    y: number;
    pointIndex: number | null;
  } | null = null;
  let lastTap: {
    time: number;
    pointerType: string;
    x: number;
    y: number;
    pointIndex: number | null;
  } | null = null;

  const canAddRemovePoints = () => props.allowAddRemovePoints !== false;

  const stateMaxTime = () => props.state.shape.points.at(-1)?.time || 1;
  // Keep the viewport fixed for the duration of a drag. In particular, moving
  // the final point must not also move the coordinate system under the pointer.
  const maxTime = () => dragMaxTime() ?? stateMaxTime();
  const range = () => props.state.shape.valueRange;
  const toX = (time: number) => (time / maxTime()) * W;
  const toY = (value: number) => {
    const [min, max] = range();
    const span = max - min || 1;
    return H - ((value - min) / span) * H;
  };

  const cancelDrag = () => {
    const pointerId = activePointerId;
    activePointerId = null;
    setDragIndex(null);
    setDragMaxTime(null);
    if (svg && pointerId !== null && svg.hasPointerCapture(pointerId)) {
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

  const editPointCount = (pointIndex: number | null | undefined, event: PointerEvent) => {
    if (pointIndex === undefined) return;
    if (!canAddRemovePoints()) return;
    if (pointIndex !== null) {
      const next = removePoint(props.state, pointIndex);
      if (next !== props.state) props.onChange(next);
      return;
    }

    const { time, value } = fromEvent(event);
    props.onChange(addPoint(props.state, time, value));
  };

  const onPointerMove = (event: PointerEvent) => {
    if (
      pointerStart?.pointerId === event.pointerId &&
      Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y) > TAP_DISTANCE
    ) {
      pointerStart = null;
    }
    const index = dragIndex();
    if (index === null || event.pointerId !== activePointerId) return;
    const { time, value } = fromEvent(event);
    props.onChange(movePoint(props.state, index, time, value));
  };

  const endDrag = (event: PointerEvent) => {
    if (event.pointerId !== activePointerId) return;
    cancelDrag();
  };

  const onPointerDown = (event: PointerEvent) => {
    if (!event.isPrimary || event.button !== 0 || !canAddRemovePoints()) return;
    const pointIndex = pointIndexFromTarget(event.target);
    if (pointIndex === undefined) return;
    pointerStart = {
      pointerId: event.pointerId,
      pointerType: event.pointerType,
      x: event.clientX,
      y: event.clientY,
      pointIndex,
    };
  };

  const onPointerUp = (event: PointerEvent) => {
    const tap = pointerStart?.pointerId === event.pointerId ? pointerStart : null;
    pointerStart = null;

    if (tap) {
      const now = performance.now();
      const isDoubleTap =
        lastTap !== null &&
        now - lastTap.time <= DOUBLE_TAP_MS &&
        lastTap.pointerType === tap.pointerType &&
        lastTap.pointIndex === tap.pointIndex &&
        Math.hypot(event.clientX - lastTap.x, event.clientY - lastTap.y) <= TAP_DISTANCE;

      if (isDoubleTap) {
        editPointCount(tap.pointIndex, event);
        lastTap = null;
      } else {
        lastTap = {
          time: now,
          pointerType: tap.pointerType,
          x: event.clientX,
          y: event.clientY,
          pointIndex: tap.pointIndex,
        };
      }
    }

    endDrag(event);
  };

  const cancelPointer = (event: PointerEvent) => {
    if (pointerStart?.pointerId === event.pointerId) pointerStart = null;
    endDrag(event);
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
        class={`${styles.svg} envelope-editor-svg envelope-editor-points`}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        width="100%"
        height="200"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={cancelPointer}
        onLostPointerCapture={endDrag}
      >
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
              onPointerDown={(event) => {
                activePointerId = event.pointerId;
                setDragMaxTime(stateMaxTime());
                setDragIndex(index());
                svg!.setPointerCapture(event.pointerId);
              }}
            >
              <title>{pointLabel(index())}</title>
            </rect>
          )}
        </For>
      </svg>
    </div>
  );
};

export const EnvelopeEditor: Component<EnvelopeEditorProps> = (props) => {
  const [envType, setEnvType] = createSignal<SampleEnvelopeType>('amp-env');
  const [state, setState] = createSignal<EnvelopeState | null>(null);
  const [editorResetToken, setEditorResetToken] = createSignal(0);

  const read = (player: SamplePlayer | null, type: SampleEnvelopeType) => {
    if (!player) return setState(null);
    try {
      setState(player.getEnvelopeState(type));
    } catch {
      // No voices or no such envelope yet.
      setState(null);
    }
  };

  createEffect(() => {
    const player = props.player;
    const type = envType();
    setEditorResetToken((token) => token + 1);
    read(player, type);
    if (!player) return;

    const offChanged = player.onMessage('envelope:changed', (msg) => {
      if (msg.envelopeType === type) setState(msg.state as EnvelopeState);
    });
    const offLoaded = player.onMessage('sample:loaded', () => read(player, type));
    onCleanup(() => {
      offChanged();
      offLoaded();
    });
  });

  const commit = (next: EnvelopeState) => {
    const player = props.player;
    if (!player) return;
    const previous = state();
    setState(next);
    try {
      player.applyEnvelopeState(envType(), next);
    } catch (error) {
      setState(previous);
      console.error(`EnvelopeEditor: failed to apply ${envType()} state`, error);
    }
  };

  const update = (updater: (current: EnvelopeState) => EnvelopeState) => {
    const current = state();
    if (current) commit(updater(current));
  };

  return (
    <div class="envelope-editor">
      <div class="envelope-editor-controls">
        <label>
          Envelope
          <select
            value={envType()}
            onChange={(event) => setEnvType(event.currentTarget.value as SampleEnvelopeType)}
          >
            <For each={ENV_TYPES}>
              {(type) => (
                <option value={type} selected={type === envType()}>
                  {type}
                </option>
              )}
            </For>
          </select>
        </label>

        <label>
          Enabled
          <input
            type="checkbox"
            checked={state()?.enabled ?? false}
            disabled={!state()}
            onChange={(event) =>
              update((current) => ({ ...current, enabled: event.currentTarget.checked }))
            }
          />
        </label>

        <label>
          Loop
          <input
            type="checkbox"
            checked={state()?.loop ?? false}
            disabled={!state()}
            onChange={(event) =>
              update((current) => ({ ...current, loop: event.currentTarget.checked }))
            }
          />
        </label>

        <label>
          Rate sync
          <input
            type="checkbox"
            checked={state()?.playbackRateSync ?? false}
            disabled={!state()}
            onChange={(event) =>
              update((current) => ({
                ...current,
                playbackRateSync: event.currentTarget.checked,
              }))
            }
          />
        </label>

        <label>
          Time scale {state()?.timeScale.toFixed(1) ?? '1.0'}
          <input
            type="range"
            min="0.1"
            max="16"
            step="0.1"
            value={state()?.timeScale ?? 1}
            disabled={!state()}
            onInput={(event) =>
              update((current) => ({
                ...current,
                timeScale: Number(event.currentTarget.value),
              }))
            }
          />
        </label>
      </div>

      <Show when={state()} fallback={<p class="envelope-editor-empty">No envelope yet.</p>}>
        <Switch
          fallback={
            <p class="envelope-editor-unsupported">
              Unsupported envelope shape: {(state()!.shape as { kind: string }).kind}
            </p>
          }
        >
          <Match when={state()!.shape.kind === 'points'}>
            <PointEnvelopeEditor
              state={state() as PointEnvelopeState}
              onChange={commit}
              allowAddRemovePoints={props.allowAddRemovePoints}
              resetToken={editorResetToken()}
            />
          </Match>
        </Switch>
      </Show>
    </div>
  );
};

export default EnvelopeEditor;
