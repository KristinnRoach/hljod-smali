import {
  Match,
  Show,
  Switch,
  createEffect,
  createSignal,
  onCleanup,
  type Component,
  type JSX,
} from 'solid-js';
import type { EnvelopeState, EnvelopeType, SamplePlayer } from '@kidlib/web-audio';
import EnvelopeControls from './EnvelopeControls';
import PointEnvelopeEditor from './PointEnvelopeEditor';
import type { PointEnvelopeState } from './envelopeState';

export interface EnvelopeEditorProps {
  player: SamplePlayer | null;
  /** Whether double-click/tap may add and remove points. Defaults to true. */
  allowAddRemovePoints?: boolean;
  /** Optional non-interactive content rendered behind the envelope. */
  underlay?: JSX.Element;
}

export const EnvelopeEditor: Component<EnvelopeEditorProps> = (props) => {
  const [envType, setEnvType] = createSignal<EnvelopeType>('amp-env');
  const [state, setState] = createSignal<EnvelopeState | null>(null);
  const [envTypes, setEnvTypes] = createSignal<EnvelopeType[]>([]);
  const [editorResetToken, setEditorResetToken] = createSignal(0);

  const read = (player: SamplePlayer | null, type: EnvelopeType) => {
    if (!player) {
      setEnvTypes([]);
      return setState(null);
    }
    // The voices decide which envelopes exist: no filter in the chain means no
    // filter-env. Types are empty until the voice pool is initialized.
    const types = player.availableEnvelopeTypes;
    setEnvTypes(types);
    if (!types.includes(type)) {
      // Keep the selection on something that exists, so the controls do not sit
      // disabled while the picker shows an available type.
      if (types.length) return setEnvType(types[0]);
      return setState(null);
    }
    setState(player.getEnvelopeState(type));
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
      <EnvelopeControls
        envType={envType()}
        envTypes={envTypes()}
        state={state()}
        onTypeChange={setEnvType}
        onUpdate={update}
      />

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
              underlay={props.underlay}
            />
          </Match>
        </Switch>
      </Show>
    </div>
  );
};

export default EnvelopeEditor;
