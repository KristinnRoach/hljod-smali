/// <reference lib="webworker" />

const worker = self as unknown as DedicatedWorkerGlobalScope;
let socket: WebSocket | undefined;
let audioPort: MessagePort | undefined;
let ready = false;
let failed = false;

function fail(message: string) {
  if (failed) return;
  failed = true;
  ready = false;
  worker.postMessage({ type: 'error', message });
  socket?.close();
}

worker.onmessage = ({ data }) => {
  if (data.type !== 'start') return;
  audioPort = data.port as MessagePort;
  socket = new WebSocket(data.url);
  socket.onopen = () => {
    socket?.send(`AUDIOPIPE/1 ${data.sampleRate} 2`);
  };
  socket.onmessage = ({ data: raw }) => {
    try {
      const message = JSON.parse(String(raw));
      if (message.type === 'ready') {
        if (message.sampleRate !== data.sampleRate) {
          fail(`Set Live to ${data.sampleRate} Hz, then reconnect.`);
          return;
        }
        ready = true;
      } else if (message.type === 'error') {
        fail(String(message.message));
        return;
      }
      worker.postMessage(message);
    } catch {
      fail('The receiver sent an invalid response.');
    }
  };
  socket.onerror = () =>
    fail('Cannot reach AudioPipe. Insert the plugin in Live and turn its audio engine on.');
  socket.onclose = () => fail('AudioPipe disconnected. Browser output has been restored.');
  audioPort.onmessage = ({ data: buffer }: MessageEvent<ArrayBuffer>) => {
    if (ready && socket?.readyState === WebSocket.OPEN) {
      // 8 packets is ~21 ms at 48 kHz. Never quietly accumulate stale TCP audio.
      if (socket.bufferedAmount > 8 * (24 + 128 * 8)) {
        fail('AudioPipe fell behind. Reconnect or choose a larger buffer.');
      } else {
        const bytes = 24 + new DataView(buffer).getUint32(12, true) * 8;
        socket.send(bytes === buffer.byteLength ? buffer : buffer.slice(0, bytes));
      }
    }
    audioPort?.postMessage(buffer, [buffer]);
  };
  for (let i = 0; i < 8; i++) {
    const buffer = new ArrayBuffer(24 + 128 * 8);
    audioPort.postMessage(buffer, [buffer]);
  }
};

export {};
