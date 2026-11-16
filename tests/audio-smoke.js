// Runs in the browser against either dev or dev:local; measures real worklet PCM.
export async function audioSmoke() {
  const app = window.getSamplePlayer();
  const context = app.context;
  await context.resume();
  if (context.state !== 'running') throw new Error('AudioContext is not running');
  const player = new app.constructor({ context, polyphony: 2 });
  await player.init();
  const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
  buffer.getChannelData(0).forEach((_, i, data) => {
    data[i] = 0.2 * Math.sin((2 * Math.PI * 220 * i) / context.sampleRate);
  });
  await player.loadAudio(buffer, { skipPreProcessing: true });
  for (const id of player.envelopeIds) player.updateEnvelope(id, { enabled: false });
  player.setLoopEnabled(true);
  player.setGlideTime(0);
  player.setVolume(0.5);
  player.setDryWetMix({ dry: 1, wet: 0 });
  player.setPanDriftEnabled(false);
  player.disconnect();

  const moduleURL = URL.createObjectURL(
    new Blob(
      [
        `
    registerProcessor('smoke-capture', class extends AudioWorkletProcessor {
      process(inputs) {
        if (inputs[0]?.[0]) this.port.postMessage({ time: currentTime, pcm: inputs[0][0] });
        return true;
      }
    });
  `,
      ],
      { type: 'text/javascript' },
    ),
  );
  // Unique contexts are not needed: each page runs this probe once.
  await context.audioWorklet.addModule(moduleURL);
  URL.revokeObjectURL(moduleURL);
  const tap = new AudioWorkletNode(context, 'smoke-capture');
  player.connect(tap);
  tap.connect(context.destination); // Processor outputs silence, but stays in the render graph.
  let blocks = [];
  tap.port.onmessage = ({ data }) => blocks.push(data);
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  /** @type {Record<string, {amps: number[], rms: number, peak: number, hz: number, invalid: number, samples: number}[]>} */
  const results = {};
  async function capture(name, schedule, windows) {
    player.releaseAll();
    await wait(100);
    blocks = [];
    const start = context.currentTime + 0.1;
    const delay = (time) => Math.max(0, start + time - context.currentTime);
    await schedule(delay);
    await wait(1200);
    results[name] = windows.map(([from, to, tones = []]) => {
      const samples = blocks.flatMap(({ time, pcm }) =>
        Array.from(pcm).filter((_, i) => {
          const t = time + i / context.sampleRate - start;
          return t >= from && t < to;
        }),
      );
      let squares = 0,
        peak = 0,
        crossings = 0,
        invalid = 0;
      samples.forEach((value, i) => {
        if (!Number.isFinite(value)) invalid++;
        squares += value * value;
        peak = Math.max(peak, Math.abs(value));
        if (i && samples[i - 1] <= 0 && value > 0) crossings++;
      });
      // Goertzel amplitude per requested frequency.
      const amps = tones.map((hz) => {
        let re = 0,
          im = 0;
        samples.forEach((value, i) => {
          const phase = (2 * Math.PI * hz * i) / context.sampleRate;
          re += value * Math.cos(phase);
          im += value * Math.sin(phase);
        });
        return (2 * Math.hypot(re, im)) / samples.length;
      });
      return {
        amps,
        rms: Math.sqrt(squares / samples.length),
        peak,
        hz: (crossings * context.sampleRate) / samples.length,
        invalid,
        samples: samples.length,
      };
    });
  }
  try {
    await capture(
      'scheduled',
      (d) => {
        player.play(60, 100, 0, d(0));
        player.release(60, d(0.4));
      },
      [
        [-0.08, -0.02],
        [0.1, 0.3],
        [0.6, 0.8],
      ],
    );
    await capture(
      'legato',
      (d) => {
        player.setLegato({ mode: 'always' });
        player.play(60, 100, 0, d(0));
        player.play(72, 100, 0, d(0.2));
        player.release(72, d(0.5));
        player.release(60, d(0.8));
      },
      [
        [0.05, 0.15],
        [0.3, 0.45],
        [0.6, 0.75],
        [0.95, 1.05],
      ],
    );
    await capture(
      'cancel',
      async (d) => {
        player.setLegato({ mode: 'off' });
        player.play(60, 100, 0, d(0.3));
        await wait(50);
        player.releaseAll();
      },
      [[0.4, 0.8]],
    );
    await capture(
      'stealing',
      (d) => {
        [60, 64, 67, 72, 76, 79].forEach((note, i) => player.play(note, 100, 0, d(i * 0.08)));
        [60, 64, 67, 72, 76, 79].forEach((note) => player.release(note, d(0.7)));
      },
      [
        // Root is note 60 = 220 Hz. Survivors 76/79 vs stolen 60/64.
        [0.5, 0.65, [220, 277, 554, 659]],
        [0.9, 1.05],
      ],
    );
    return { sampleRate: context.sampleRate, results };
  } finally {
    player.dispose();
    tap.disconnect();
    tap.port.close();
  }
}
