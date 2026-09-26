import workletUrl from './sender.worklet.js?url&no-inline';

export type AudioPipeStats = {
  queueFrames: number;
  targetFrames: number;
  sampleRate: number;
  underruns: number;
  overruns: number;
  gaps: number;
  receivedFrames: number;
  callbacks: number;
};

export type AudioPipeState = {
  status: 'idle' | 'connecting' | 'connected' | 'error';
  message?: string;
  stats?: AudioPipeStats;
  dropped?: number;
};

type Session = {
  closed: boolean;
  worker?: Worker;
  node?: AudioWorkletNode;
  muted: boolean;
  timer?: ReturnType<typeof setTimeout>;
  reject?: (error: Error) => void;
};

const modules = new WeakMap<AudioContext, Promise<void>>();

/** Framework-independent adapter. The source must initially be connected to
 * context.destination. Only that edge is switched; other recorder/tap edges stay.
 * disconnect()/failure restores it. dispose() also cancels an in-flight connect.
 */
export class AudioPipeClient {
  private session?: Session;
  private disposed = false;
  private state: AudioPipeState = { status: 'idle' };

  constructor(
    private readonly context: AudioContext,
    private readonly source: AudioNode,
    private readonly onState: (state: AudioPipeState) => void,
    private readonly onControlMessage?: (message: unknown) => void,
  ) {}

  async connect(url = 'ws://127.0.0.1:18765/audio'): Promise<void> {
    if (this.disposed) throw new Error('AudioPipe has been disposed.');
    this.disconnect();
    const endpoint = new URL(url);
    if (endpoint.protocol !== 'ws:' || !['localhost', '127.0.0.1'].includes(endpoint.hostname)) {
      throw new Error('This prototype only connects to localhost.');
    }
    const session: Session = { closed: false, muted: false };
    this.session = session;
    this.publish({ status: 'connecting' });
    try {
      await this.context.resume();
      if (session.closed) return;
      let module = modules.get(this.context);
      if (!module) {
        module = this.context.audioWorklet.addModule(workletUrl);
        modules.set(this.context, module);
        void module.catch(() => modules.delete(this.context));
      }
      await module;
      if (session.closed) return;
      session.node = new AudioWorkletNode(this.context, 'audio-pipe-sender', {
        numberOfInputs: 1,
        numberOfOutputs: 1,
        outputChannelCount: [2],
        channelCount: 2,
        channelCountMode: 'explicit',
      });
      session.worker = new Worker(new URL('./sender.worker.ts', import.meta.url), {
        type: 'module',
      });
      const channel = new MessageChannel();
      session.node.port.postMessage({ port: channel.port1 }, [channel.port1]);
      session.node.port.onmessage = ({ data }) => {
        if (!session.closed) this.publish({ ...this.state, dropped: data.dropped });
      };
      await new Promise<void>((resolve, reject) => {
        session.reject = reject;
        const fail = (message: string) => this.fail(session, message);
        session.timer = setTimeout(() => fail('AudioPipe did not respond within 5 seconds.'), 5000);
        session.worker!.onerror = () => fail('AudioPipe sender failed to start.');
        session.node!.onprocessorerror = () => fail('AudioPipe audio sender stopped.');
        session.worker!.onmessage = ({ data }) => {
          if (session.closed) return;
          if (data.type === 'error') {
            fail(data.message);
          } else if (data.type === 'ready') {
            try {
              this.source.disconnect(this.context.destination);
              session.muted = true;
              this.source.connect(session.node!);
              session.node!.connect(this.context.destination);
              clearTimeout(session.timer);
              session.reject = undefined;
              this.publish({ status: 'connected', dropped: 0 });
              resolve();
            } catch (error) {
              fail(error instanceof Error ? error.message : String(error));
            }
          } else if (data.type === 'stats') {
            this.publish({ ...this.state, stats: data });
          } else {
            this.onControlMessage?.(data);
          }
        };
        session.worker!.postMessage(
          { type: 'start', url, sampleRate: this.context.sampleRate, port: channel.port2 },
          [channel.port2],
        );
      });
    } catch (error) {
      if (!session.closed)
        this.fail(session, error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  disconnect(): void {
    if (this.session) this.release(this.session);
    this.publish({ status: 'idle' });
  }

  dispose(): void {
    this.disconnect();
    this.disposed = true;
  }

  private fail(session: Session, message: string): void {
    if (session.closed) return;
    this.release(session, message);
    this.publish({ status: 'error', message });
  }

  private release(session: Session, message = 'Connection cancelled.'): void {
    session.closed = true;
    this.onControlMessage?.(null);
    clearTimeout(session.timer);
    session.worker?.terminate();
    if (session.node) {
      try {
        this.source.disconnect(session.node);
      } catch {
        /* Edge not connected yet. */
      }
      session.node.disconnect();
      session.node.port.close();
    }
    if (session.muted && this.context.state !== 'closed') {
      this.source.connect(this.context.destination);
      session.muted = false;
    }
    session.reject?.(new Error(message));
    session.reject = undefined;
    if (this.session === session) this.session = undefined;
  }

  private publish(state: AudioPipeState): void {
    this.state = state;
    this.onState(state);
  }
}
