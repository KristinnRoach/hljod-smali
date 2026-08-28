import { For, createEffect, createSignal, onCleanup, type Component } from 'solid-js';
import type { EnvelopeState, SampleEnvelopeType, SamplePlayer } from '@kidlib/web-audio';
import { commitPointMove } from './envelopeState';

// ponytail: prototype only -- no waveform, no playheads, no persistence, no polish.
// It exists to check that getEnvelopeState/applyEnvelopeState/envelope:changed
// are enough to drive an editor. See src/audio-elements/envelope/ for the
// legacy implementation this would eventually replace.

const ENV_TYPES: SampleEnvelopeType[] = ['amp-env', 'filter-env', 'pitch-env'];

// Fixed user-space box, stretched to the container. Handles are rects, not
// circles, so the non-uniform stretch cannot distort them.
const W = 600;
const H = 200;
const HANDLE = 10;

export const EnvelopeEditor: Component<{ player: SamplePlayer | null }> = (props) => {
  const [envType, setEnvType] = createSignal<SampleEnvelopeType>('amp-env');
  const [state, setState] = createSignal<EnvelopeState | null>(null);
  const [dragIndex, setDragIndex] = createSignal<number | null>(null);
  let svg!: SVGSVGElement;

  const read = () => {
    const player = props.player;
    if (!player) return setState(null);
    try {
      setState(player.getEnvelopeState(envType()));
    } catch {
      // No voices or no such envelope yet.
      setState(null);
    }
  };

  createEffect(() => {
    const player = props.player;
    const type = envType();
    read();
    if (!player) return;

    const offChanged = player.onMessage('envelope:changed', (msg) => {
      if (msg.envelopeType === type) setState(msg.state as EnvelopeState);
    });
    const offLoaded = player.onMessage('sample:loaded', () => read());
    onCleanup(() => {
      offChanged();
      offLoaded();
    });
  });

  const apply = (partial: Partial<EnvelopeState>) => {
    const current = state();
    if (!current || !props.player) return;
    props.player.applyEnvelopeState(envType(), { ...current, ...partial });
  };

  const maxTime = () => state()?.shape.points.at(-1)?.time || 1;
  const range = () => state()?.shape.valueRange ?? [0, 1];
  const toX = (time: number) => (time / maxTime()) * W;
  const toY = (value: number) => {
    const [min, max] = range();
    return H - ((value - min) / (max - min)) * H;
  };

  const fromEvent = (event: PointerEvent) => {
    const rect = svg.getBoundingClientRect();
    const [min, max] = range();
    return {
      time: ((event.clientX - rect.left) / rect.width) * maxTime(),
      value: min + (1 - (event.clientY - rect.top) / rect.height) * (max - min),
    };
  };

  const onPointerMove = (event: PointerEvent) => {
    const index = dragIndex();
    const current = state();
    if (index === null || !current || !props.player) return;
    const { time, value } = fromEvent(event);
    setState(commitPointMove(props.player, envType(), current, index, time, value));
  };

  const endDrag = (event: PointerEvent) => {
    if (dragIndex() === null) return;
    svg.releasePointerCapture(event.pointerId);
    setDragIndex(null);
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
            onChange={(event) => apply({ enabled: event.currentTarget.checked })}
          />
        </label>

        <label>
          Loop
          <input
            type="checkbox"
            checked={state()?.loop ?? false}
            disabled={!state()}
            onChange={(event) => apply({ loop: event.currentTarget.checked })}
          />
        </label>

        <label>
          Rate sync
          <input
            type="checkbox"
            checked={state()?.playbackRateSync ?? false}
            disabled={!state()}
            onChange={(event) => apply({ playbackRateSync: event.currentTarget.checked })}
          />
        </label>

        <label>
          Sustain
          <select
            value={String(state()?.shape.sustainIndex ?? 'none')}
            disabled={!state()}
            onChange={(event) => {
              const current = state();
              if (!current) return;
              const value = event.currentTarget.value;
              apply({
                shape: {
                  ...current.shape,
                  sustainIndex: value === 'none' ? null : Number(value),
                },
              });
            }}
          >
            <option value="none" selected={state()?.shape.sustainIndex == null}>
              none
            </option>
            <For each={state()?.shape.points ?? []}>
              {(_point, index) => (
                <option value={String(index())} selected={index() === state()?.shape.sustainIndex}>
                  {index()}
                </option>
              )}
            </For>
          </select>
        </label>

        <label>
          Time scale
          <input
            type="range"
            min="0.1"
            max="4"
            step="0.1"
            value={state()?.timeScale ?? 1}
            disabled={!state()}
            onInput={(event) => apply({ timeScale: Number(event.currentTarget.value) })}
          />
        </label>
      </div>

      {state() ? (
        <svg
          ref={svg}
          class="envelope-editor-svg"
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          width="100%"
          height="200"
          style={{ background: 'var(--envelope-bg)', 'touch-action': 'none' }}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <polyline
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            vector-effect="non-scaling-stroke"
            points={state()!
              .shape.points.map((point) => `${toX(point.time)},${toY(point.value)}`)
              .join(' ')}
          />
          <For each={state()!.shape.points}>
            {(point, index) => (
              <rect
                data-point={index()}
                x={toX(point.time) - HANDLE / 2}
                y={toY(point.value) - HANDLE / 2}
                width={HANDLE}
                height={HANDLE}
                fill={index() === state()!.shape.sustainIndex ? 'orange' : 'currentColor'}
                onPointerDown={(event) => {
                  svg.setPointerCapture(event.pointerId);
                  setDragIndex(index());
                }}
              />
            )}
          </For>
        </svg>
      ) : (
        <p class="envelope-editor-empty">No envelope yet.</p>
      )}
    </div>
  );
};

export default EnvelopeEditor;
