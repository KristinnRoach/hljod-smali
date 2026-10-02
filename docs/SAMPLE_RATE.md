# Sample-rate switching draft

The temporary **Sample rate** select is in the expanded toolbar in development
builds. It supports 44,100 and 48,000 Hz. Start with `vp run dev`.

This draft uses the current sibling web-audio checkout through the
`pnpm-workspace.yaml` link override. Build that package with `vp run build` after
changing it. The published 0.5.4 package does not expose the context creation API
used here. Remove the override when a compatible release is available.

## What consumers need to know

An AudioContext's sample rate is fixed. Switching rates creates a new context
and new nodes. References to the old player and its nodes must be replaced.
Await the old context's `close()` before creating another global context.

SamplePlayer's worklet requires sample buffers at the context's rate. This draft
renders the current layers through OfflineAudioContext before teardown, keeping
channel counts and duration to within sample rounding. It restores them without
repeating preprocessing. Repeated switches resample the already resampled audio;
retaining original source samples would avoid cumulative conversion loss.

The app snapshots knob values and live envelopes, keeps instrument identity and
layer references, and reapplies output routing. Its existing reactive controls
bind to the replacement player. Playing notes and sequence playback stop;
recording is cancelled and AudioPipe disconnects. Reconnect AudioPipe manually
with the receiver at the new rate. The new context may remain suspended until
the next user gesture. The selected rate is not persisted across reloads.

Changes are serialized by the existing loading state. Generation checks prevent
an initialization from publishing a player after teardown. Errors are shown by
the sampler status or a toast. There is no rollback after the old context closes;
reload if replacement fails. This remains a draft rather than a complete recovery
flow.

## Validation

`tests/sample-rate.spec.ts` switches in both directions and checks player
replacement, closure of the old context, two layers with matching rates and
preserved durations/channel counts, trim and envelope restoration, and successful
play/release calls without browser errors. This does not measure audible output
or validate physical output-device changes or a live recording during switching.
