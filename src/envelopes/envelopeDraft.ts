import type { EnvelopeConfig, SampleEnvelopeId, SamplePlayer } from '@kidlib/web-audio';

const ENVELOPE_DRAFT_STORAGE_KEY = 'play:working-envelope-draft:v2';

export type EnvelopeStates = Partial<Record<SampleEnvelopeId, EnvelopeConfig>>;

export const loadEnvelopeDraft = (): EnvelopeStates => {
  try {
    return JSON.parse(sessionStorage.getItem(ENVELOPE_DRAFT_STORAGE_KEY) ?? '{}');
  } catch {
    return {};
  }
};

export const persistEnvelopeDraft = (player: SamplePlayer) => {
  try {
    sessionStorage.setItem(
      ENVELOPE_DRAFT_STORAGE_KEY,
      JSON.stringify(
        Object.fromEntries(player.envelopeIds.map((id) => [id, player.getEnvelope(id)])),
      ),
    );
  } catch {
    // Live state remains usable when session storage is unavailable.
  }
};

// ponytail: envelopes that fail validation drop to defaults. Saved rows are
// migrated in instrumentDb; older session drafts sit under a previous key. See #33.
export const applyEnvelopes = (player: SamplePlayer, envelopes: EnvelopeStates) => {
  player.resetEnvelope();
  Object.entries(envelopes).forEach(([id, config]) => {
    try {
      player.updateEnvelope(id as SampleEnvelopeId, config);
    } catch (error) {
      console.warn(`Dropped invalid ${id} envelope`, error);
    }
  });
};
