import { Show, createEffect, createSignal, onCleanup, type Component, type JSX } from 'solid-js';
import type { SampleEnvelopeId, EnvelopeConfig, SamplePlayer } from '@kidlib/web-audio';
import EnvelopeControls from './EnvelopeControls';
import PointEnvelopeEditor from './PointEnvelopeEditor';
import { envelopeAxis } from './envelopeState';
import styles from './EnvelopeEditor.module.css';

export interface EnvelopeEditorProps {
  player: SamplePlayer | null;
  /** Whether double-click/tap may add and remove points. Defaults to true. */
  allowAddRemovePoints?: boolean;
  /** Optional non-interactive content rendered behind the envelope. */
  underlay?: JSX.Element;
}

export const EnvelopeEditor: Component<EnvelopeEditorProps> = (props) => {
  const [envId, setEnvId] = createSignal<SampleEnvelopeId>('amp');
  const [state, setState] = createSignal<EnvelopeConfig | null>(null);
  const [envIds, setEnvIds] = createSignal<SampleEnvelopeId[]>([]);
  const [editorResetToken, setEditorResetToken] = createSignal(0);

  const read = (player: SamplePlayer | null, id: SampleEnvelopeId) => {
    if (!player) {
      setEnvIds([]);
      return setState(null);
    }
    // The voices decide which envelopes exist: no filter in the chain means no
    // filter envelope. Ids are empty until the voice pool is initialized.
    const ids = player.envelopeIds;
    setEnvIds(ids);
    if (!ids.includes(id)) {
      // Keep the selection on something that exists, so the controls do not sit
      // disabled while the picker shows an available id.
      if (ids.length) return setEnvId(ids[0]);
      return setState(null);
    }
    setState(player.getEnvelope(id));
  };

  createEffect(() => {
    const player = props.player;
    const id = envId();
    setEditorResetToken((token) => token + 1);
    read(player, id);
    if (!player) return;

    const offChanged = player.onMessage('envelope:changed', (msg) => {
      if (msg.id === id) setState(msg.config as EnvelopeConfig);
    });
    const offLoaded = player.onMessage('sample:loaded', () => read(player, id));
    onCleanup(() => {
      offChanged();
      offLoaded();
    });
  });

  const commit = (next: EnvelopeConfig) => {
    const player = props.player;
    if (!player) return;
    const previous = state();
    setState(next);
    try {
      player.updateEnvelope(envId(), next);
    } catch (error) {
      setState(previous);
      console.error(`EnvelopeEditor: failed to apply ${envId()} settings`, error);
    }
  };

  const update = (updater: (current: EnvelopeConfig) => EnvelopeConfig) => {
    const current = state();
    if (current) commit(updater(current));
  };

  return (
    <div class={styles.editor}>
      <EnvelopeControls
        envId={envId()}
        envIds={envIds()}
        state={state()}
        onIdChange={setEnvId}
        onUpdate={update}
      />

      <Show when={state()} fallback={<p class={styles.empty}>No envelope yet.</p>}>
        {(current) => (
          <PointEnvelopeEditor
            state={current()}
            onChange={commit}
            axis={envelopeAxis(envId())}
            allowAddRemovePoints={props.allowAddRemovePoints}
            resetToken={editorResetToken()}
            underlay={props.underlay}
          />
        )}
      </Show>
    </div>
  );
};

export default EnvelopeEditor;
