/* global AudioWorkletProcessor, registerProcessor, sampleRate, currentFrame */

// No app/library dependencies. The Worker supplies and recycles the packet pool.
class AudioPipeSender extends AudioWorkletProcessor {
  constructor() {
    super();
    this.pool = [];
    this.sequence = 0;
    this.dropped = 0;
    this.audioPort = null;
    this.port.onmessage = ({ data }) => {
      this.audioPort = data.port;
      this.audioPort.onmessage = ({ data: buffer }) => {
        this.pool.push({ buffer, header: new DataView(buffer), pcm: new Float32Array(buffer, 24) });
      };
    };
  }

  process(inputs) {
    const channels = inputs[0];
    if (!channels?.[0] || !this.audioPort) return true;
    const left = channels[0];
    const right = channels[1] || left;
    for (let offset = 0; offset < left.length; offset += 128) {
      const frames = Math.min(128, left.length - offset);
      const packet = this.pool.pop();
      const sequence = this.sequence++;
      if (!packet) {
        this.dropped++;
        continue;
      }
      const { buffer, header, pcm } = packet;
      header.setUint32(0, 0x31505041, true); // APP1
      header.setUint32(4, sequence, true);
      header.setUint32(8, sampleRate, true);
      header.setUint32(12, frames, true);
      header.setUint16(16, 2, true);
      header.setUint16(18, 0, true);
      header.setUint32(20, (currentFrame + offset) >>> 0, true);
      for (let i = 0; i < frames; i++) {
        pcm[i * 2] = left[offset + i];
        pcm[i * 2 + 1] = right[offset + i];
      }
      this.audioPort.postMessage(buffer, [buffer]);
    }
    if (currentFrame % 16384 === 0) this.port.postMessage({ dropped: this.dropped });
    // Keep the graph rendering, but leave the local output silent.
    return true;
  }
}

registerProcessor('audio-pipe-sender', AudioPipeSender);
