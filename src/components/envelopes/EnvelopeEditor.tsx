import { Show, createEffect, createSignal, onCleanup, type Component, type JSX } from 'solid-js';
import type { SampleEnvelopeId, EnvelopeConfig, SamplePlayer } from '@kidlib/web-audio';
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
  const [envId, setEnvId] = createSignal<SampleEnvelopeId>('amp-env');
  const [state, setState] = createSignal<EnvelopeConfig | null>(null);
  const [envIds, setEnvIds] = createSignal<SampleEnvelopeId[]>([]);
  const [editorResetToken, setEditorResetToken] = createSignal(0);
  // The package has no getter for playback-rate sync, so the checkbox tracks it here.
  const [rateSync, setRateSync] = createSignal<Partial<Record<SampleEnvelopeId, boolean>>>({});

  const read = (player: SamplePlayer | null, id: SampleEnvelopeId) => {
    if (!player) {
      setEnvIds([]);
      return setState(null);
    }
    // The voices decide which envelopes exist: no filter in the chain means no
    // filter-env. Ids are empty until the voice pool is initialized.
    const ids = player.availableEnvelopeIds;
    setEnvIds(ids);
    if (!ids.includes(id)) {
      // Keep the selection on something that exists, so the controls do not sit
      // disabled while the picker shows an available id.
      if (ids.length) return setEnvId(ids[0]);
      return setState(null);
    }
    setState(player.getEnvelopeConfig(id));
  };

  createEffect(() => {
    const player = props.player;
    const id = envId();
    setEditorResetToken((token) => token + 1);
    read(player, id);
    if (!player) return;

    const offChanged = player.onMessage('envelope:changed', (msg) => {
      if (msg.envelopeId === id) setState(msg.settings as EnvelopeConfig);
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
      player.applyEnvelopeConfig(envId(), next);
    } catch (error) {
      setState(previous);
      console.error(`EnvelopeEditor: failed to apply ${envId()} settings`, error);
    }
  };

  const update = (updater: (current: EnvelopeConfig) => EnvelopeConfig) => {
    const current = state();
    if (current) commit(updater(current));
  };

  const setSync = (sync: boolean) => {
    const id = envId();
    props.player?.setEnvelopeSync(id, sync);
    setRateSync((current) => ({ ...current, [id]: sync }));
  };

  return (
    <div class="envelope-editor">
      <EnvelopeControls
        envId={envId()}
        envIds={envIds()}
        state={state()}
        rateSync={rateSync()[envId()] ?? false}
        onIdChange={setEnvId}
        onUpdate={update}
        onRateSyncChange={setSync}
      />

      <Show when={state()} fallback={<p class="envelope-editor-empty">No envelope yet.</p>}>
        <PointEnvelopeEditor
          state={state() as PointEnvelopeState}
          onChange={commit}
          allowAddRemovePoints={props.allowAddRemovePoints}
          resetToken={editorResetToken()}
          underlay={props.underlay}
        />
      </Show>
    </div>
  );
};

export default EnvelopeEditor;
