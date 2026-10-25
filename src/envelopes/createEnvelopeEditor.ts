import { createEffect, createSignal, onCleanup } from 'solid-js';
import type { SampleEnvelopeId, EnvelopeConfig, SamplePlayer } from '@kidlib/web-audio';
import { envelopeAxis } from './envelopeState';

/** Selected envelope state, shared by `EnvelopeControls` and a `PointEnvelopeEditor` plot layer. */
export function createEnvelopeEditor(player: () => SamplePlayer | null) {
  const [envId, setEnvId] = createSignal<SampleEnvelopeId>('amp');
  const [state, setState] = createSignal<EnvelopeConfig | null>(null);
  const [sampleDuration, setSampleDuration] = createSignal(1);
  const [envIds, setEnvIds] = createSignal<SampleEnvelopeId[]>([]);
  const [resetToken, setResetToken] = createSignal(0);

  const read = (player: SamplePlayer | null, id: SampleEnvelopeId) => {
    setSampleDuration(player?.sampleDuration || 1);
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
    const current = player();
    const id = envId();
    setResetToken((token) => token + 1);
    read(current, id);
    if (!current) return;

    const offChanged = current.onMessage('envelope:changed', (msg) => {
      if (msg.id === id) setState(msg.config as EnvelopeConfig);
    });
    const offLoaded = current.onMessage('sample:loaded', () => read(current, id));
    onCleanup(() => {
      offChanged();
      offLoaded();
    });
  });

  const commit = (next: EnvelopeConfig) => {
    const current = player();
    if (!current) return;
    const previous = state();
    setState(next);
    try {
      current.updateEnvelope(envId(), next);
    } catch (error) {
      setState(previous);
      console.error(`createEnvelopeEditor: failed to apply ${envId()} settings`, error);
    }
  };

  return {
    envId,
    setEnvId,
    envIds,
    state,
    sampleDuration,
    /** Selected shape's duration in seconds; reads `state` so it updates on every change. */
    duration: () => (state() ? (player()?.getEnvelopeDuration(envId()) ?? 1) : 1),
    /** The config while the envelope is enabled, otherwise undefined. */
    enabledState: () => {
      const current = state();
      return current?.enabled ? current : undefined;
    },
    axis: () => envelopeAxis(envId()),
    resetToken,
    commit,
    update: (updater: (current: EnvelopeConfig) => EnvelopeConfig) => {
      const current = state();
      if (current) commit(updater(current));
    },
    setDuration: (duration: number) => {
      player()?.updateEnvelope(envId(), { duration });
    },
    reset: () => {
      setResetToken((token) => token + 1);
      player()?.resetEnvelope(envId());
    },
  };
}
