import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import { AudioPipeClient, type AudioPipeState } from './AudioPipeClient';

class FakeWorker {
  static instances: FakeWorker[] = [];
  onmessage?: (event: { data: unknown }) => void;
  onerror?: () => void;
  postMessage = vi.fn();
  terminate = vi.fn();
  constructor() {
    FakeWorker.instances.push(this);
  }
  receive(data: unknown) {
    this.onmessage?.({ data });
  }
}
class FakeNode {
  port = { postMessage: vi.fn(), close: vi.fn(), onmessage: undefined };
  connect = vi.fn();
  disconnect = vi.fn();
}

const SAMPLE_RATE = 41000;

function fixture() {
  const destination = {};
  const recorder = {};
  const edges = new Set<unknown>([destination, recorder]);
  const source = {
    connect: vi.fn((target: unknown) => edges.add(target)),
    disconnect: vi.fn((target: unknown) => {
      if (!edges.delete(target)) throw new Error('Missing edge');
    }),
  };
  const context = {
    resume: vi.fn().mockResolvedValue(undefined),
    audioWorklet: { addModule: vi.fn().mockResolvedValue(undefined) },
    state: 'running',
    sampleRate: 41000,
    destination,
  };
  const states: AudioPipeState[] = [];
  const client = new AudioPipeClient(
    context as unknown as AudioContext,
    source as unknown as AudioNode,
    (state) => states.push(state),
  );
  return { client, context, source, states, edges, destination, recorder };
}

beforeEach(() => {
  FakeWorker.instances = [];
  vi.stubGlobal('Worker', FakeWorker);
  vi.stubGlobal('AudioWorkletNode', FakeNode);
  vi.stubGlobal(
    'MessageChannel',
    class {
      port1 = {};
      port2 = {};
    },
  );
});
afterEach(() => vi.unstubAllGlobals());

async function start(client: AudioPipeClient) {
  const pending = client.connect();
  await vi.waitFor(() => expect(FakeWorker.instances).toHaveLength(1));
  return { pending, worker: FakeWorker.instances[0] };
}

describe('AudioPipe routing lifecycle', () => {
  it('mutes only after handshake and restores only the destination edge on disconnect', async () => {
    const f = fixture();
    const { pending, worker } = await start(f.client);
    expect(f.edges.has(f.destination)).toBe(true);
    worker.receive({ type: 'ready', sampleRate: SAMPLE_RATE });
    await pending;
    expect(f.edges.has(f.destination)).toBe(false);
    expect(f.edges.has(f.recorder)).toBe(true);
    f.client.disconnect();
    expect(f.edges).toEqual(new Set([f.destination, f.recorder]));
    expect(worker.terminate).toHaveBeenCalledOnce();
    f.client.disconnect();
    expect(f.source.connect.mock.calls.filter(([node]) => node === f.destination)).toHaveLength(1);
  });

  it('keeps browser output on a failed handshake and exposes the reason', async () => {
    const f = fixture();
    const { pending, worker } = await start(f.client);
    const rejected = expect(pending).rejects.toThrow('Sample-rate mismatch');
    worker.receive({ type: 'error', message: 'Sample-rate mismatch' });
    await rejected;
    expect(f.edges).toEqual(new Set([f.destination, f.recorder]));
    expect(f.states.at(-1)?.status).toBe('error');
  });

  it('restores browser output after an established connection fails', async () => {
    const f = fixture();
    const { pending, worker } = await start(f.client);
    worker.receive({ type: 'ready', sampleRate: SAMPLE_RATE });
    await pending;
    worker.receive({ type: 'error', message: 'Disconnected' });
    expect(f.edges).toEqual(new Set([f.destination, f.recorder]));
    expect(f.states.at(-1)?.message).toBe('Disconnected');
  });

  it('cannot attach a late worklet after disposal during module loading', async () => {
    const f = fixture();
    let finish!: () => void;
    f.context.audioWorklet.addModule.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );
    const pending = f.client.connect();
    await vi.waitFor(() => expect(f.context.audioWorklet.addModule).toHaveBeenCalled());
    f.client.dispose();
    finish();
    await pending;
    expect(FakeWorker.instances).toHaveLength(0);
    expect(f.edges).toEqual(new Set([f.destination, f.recorder]));
  });

  it('rejects non-loopback endpoints', async () => {
    const f = fixture();
    await expect(f.client.connect('ws://example.com/audio')).rejects.toThrow('localhost');
    expect(FakeWorker.instances).toHaveLength(0);
  });
});
