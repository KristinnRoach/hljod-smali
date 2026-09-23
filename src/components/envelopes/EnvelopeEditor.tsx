import {
  Show,
  createEffect,
  createSignal,
  onCleanup,
  untrack,
  type Component,
  type JSX,
} from 'solid-js';
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

type RateSync = Partial<Record<SampleEnvelopeId, boolean>>;

// ponytail: web-audio 0.5.0 has no rate-sync getter and EnvelopeConfig has no
// sync field, so the editor keeps it in sessionStorage next to the working
// envelope draft. Survives reloads, not instrument saves. Replace once the
// package exposes it (#33).
const RATE_SYNC_STORAGE_KEY = 'play:envelope-rate-sync:v1';

const loadRateSync = (): RateSync => {
  try {
    return JSON.parse(sessionStorage.getItem(RATE_SYNC_STORAGE_KEY) ?? '{}');
  } catch {
    return {};
  }
};

export const EnvelopeEditor: Component<EnvelopeEditorProps> = (props) => {
  const [envId, setEnvId] = createSignal<SampleEnvelopeId>('amp-env');
  const [state, setState] = createSignal<EnvelopeConfig | null>(null);
  const [envIds, setEnvIds] = createSignal<SampleEnvelopeId[]>([]);
  const [editorResetToken, setEditorResetToken] = createSignal(0);
  // The package has no getter for playback-rate sync, so the checkbox tracks it here.
  const [rateSync, setRateSync] = createSignal<RateSync>(loadRateSync());

  // Hand the remembered sync to each new player; voices created later pick it up
  // from the player.
  createEffect(() => {
    const player = props.player;
    if (!player) return;
    Object.entries(untrack(rateSync)).forEach(([id, sync]) =>
      player.setEnvelopeSync(id as SampleEnvelopeId, sync),
    );
  });

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
    const next = { ...rateSync(), [id]: sync };
    setRateSync(next);
    try {
      sessionStorage.setItem(RATE_SYNC_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Sync still applies for this page when session storage is unavailable.
    }
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
