/**
 * Which envelope UI mounts. Its own module so Playwright can gate the
 * legacy-only DOM tests on it without importing App.tsx.
 */
export type EnvelopeImplementation = 'envelope-switcher' | 'EnvelopeEditor';

// Annotated, not `as`-cast: the wider type is what keeps `=== 'envelope-switcher'`
// from narrowing to a constant-false comparison at the call sites.
export const ENVELOPE_IMPLEMENTATION: EnvelopeImplementation = 'envelope-switcher';
