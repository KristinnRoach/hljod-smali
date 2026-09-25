# audio-pipe

Streams the sampler's output to the AudioPipe VST3 plugin (separate `audiopipe` repo) over a loopback WebSocket, `ws://127.0.0.1:18765/audio`.

- `AudioPipeClient.ts`: swaps the source's `destination` edge for the sender worklet; restores it on disconnect or failure.
- `sender.worklet.js` / `sender.worker.ts`: audio thread → worker → WebSocket.
- `createAudioPipeOutput.ts`: exposes the client as a `NonDeviceOutput` for `OutputDeviceSelect` ("Ableton (AudioPipe)").
- `AudioPipePanel.tsx`: status and stats, shown while AudioPipe is connecting, connected or failed.

The receiver only accepts pages from localhost ports 3000, 3017 and 4180 or from `https://kristinnroach.github.io` (the deployed app), and the browser and Live sample rates must match.

E2E against the native probe: `pnpm test:audiopipe` (see `tests/audio-pipe.spec.ts`).
