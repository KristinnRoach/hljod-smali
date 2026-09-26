# audio-pipe

Streams the sampler's output to the AudioPipe VST3 plugin (separate `audiopipe` repo) over a loopback WebSocket, `ws://127.0.0.1:18765/audio`.

- `AudioPipeClient.ts`: swaps the source's `destination` edge for the sender worklet; restores it on disconnect or failure.
- `sender.worklet.js` / `sender.worker.ts`: audio thread → worker → WebSocket.
- `createAudioPipeOutput.ts`: exposes the client as a `NonDeviceOutput` for `OutputDeviceSelect` ("Ableton (AudioPipe)").
- `AudioPipePanel.tsx`: status and stats, shown while AudioPipe is connecting, connected or failed.

The receiver only accepts pages from localhost ports 3000, 3017 and 4180 or from `https://kristinnroach.github.io` (the deployed app), and the browser and Live sample rates must match.

E2E against the native probe: `pnpm test:audiopipe` (see `tests/audio-pipe.spec.ts`).

## AudioPipe Instrument MIDI input

With the companion AudioPipe MIDI build installed, load **AudioPipe Instrument**
on a Live MIDI track and select **Ableton (AudioPipe)** in this app. Arm/monitor
the track and play a clip or controller. Disable the old IAC route to avoid
triggering notes twice. The browser MIDI toggle is not needed for this route.

`io/AudioPipeMidiInput.ts` handles notes and velocity separately from audio
routing. The worker forwards server messages; `AudioPipeClient` delivers control
messages through an optional callback, with `null` on disconnect to release notes.
The original AudioPipe effect still works with no MIDI messages.

All channels address the same sampler. Notes play on arrival; the transmitted
block-relative sample offsets are not scheduled. CC/sustain/pitch bend and timing
compensation are outside this version. Disconnect/reset balances held note-offs;
the sampler's own Hold setting still applies.
