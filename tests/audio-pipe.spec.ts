import { test, expect } from '@playwright/test';
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { createServer } from 'node:net';
import { resolve } from 'node:path';

/**
 * Drives the real browser sender against the native AudioPipe receiver, with
 * Ableton out of the loop. What this covers that a unit test cannot: Chrome's
 * own scheduling of the worklet, the worker and the socket, including what a
 * backgrounded tab does to it. What it still does not cover: a DAW audio
 * callback, and anything audible. The capture is written out so it can be heard.
 *
 * Out of `pnpm test:all`: it is experimental, takes minutes of real time, and
 * needs a native build that lives outside this repo. Run with:
 *   cmake --build ../audiopipe/build --target audiopipe_probe
 *   pnpm test:audiopipe
 */
const PROBE = resolve(import.meta.dirname, '../../audiopipe/build/audiopipe_probe');
const CAPTURES = resolve(import.meta.dirname, '../test-results/audio-pipe');

type Summary = {
  rate: number;
  target: number;
  block: number;
  callbacks: number;
  underruns: number;
  overruns: number;
  gaps: number;
  resyncs: number;
  queueMin: number;
  queueMax: number;
  maxGapCallbacks: number;
  maxBurstFrames: number;
  maxLateMs: number;
  maxStep: number;
  peak: number;
};

const freePort = () =>
  new Promise<number>((done, fail) => {
    const probe = createServer();
    probe.once('error', fail);
    probe.listen(0, '127.0.0.1', () => {
      const { port } = probe.address() as { port: number };
      probe.close(() => done(port));
    });
  });

/** Resolves with the probe's summary once it has captured its full duration. */
function startProbe(args: string[]) {
  const child = spawn(PROBE, args, { stdio: ['ignore', 'pipe', 'pipe'] });
  let stdout = '';
  let stderr = '';
  child.stdout.on('data', (d) => (stdout += d));
  child.stderr.on('data', (d) => (stderr += d));
  const listening = new Promise<void>((done, fail) => {
    child.stderr.on('data', (d: Buffer) => d.includes('listening') && done());
    child.once('error', fail);
    child.once('exit', () => fail(new Error(`probe exited early: ${stderr}`)));
  });
  const finished = new Promise<Summary>((done, fail) => {
    child.once('error', fail);
    child.once('exit', (code) => {
      if (code !== 0) return fail(new Error(stderr || `probe exit ${code}`));
      try {
        done(JSON.parse(stdout) as Summary);
      } catch (error) {
        fail(error);
      }
    });
  });
  // The process may fail while the page is still loading, before we await it.
  void finished.catch(() => {});

  return { listening, finished, kill: () => child.kill() };
}

test.describe('AudioPipe bridge against the native receiver', () => {
  test.describe.configure({ mode: 'serial' });
  // ponytail: an env guard keeps this out of the default run with no extra
  // Playwright project or config file to maintain. A separate config is the
  // upgrade path if this ever needs its own webServer or reporter.
  test.skip(!process.env.AUDIOPIPE, 'experimental: run with pnpm test:audiopipe');
  test.skip(
    !existsSync(PROBE),
    'build audiopipe_probe first: cmake --build ../audiopipe/build --target audiopipe_probe',
  );

  // Long real-time captures; the default 30 s timeout is nowhere near enough.
  test.setTimeout(180_000);

  const scenarios = [
    { target: 256, background: false },
    { target: 512, background: false },
    { target: 512, background: true },
  ];

  for (const { target, background } of scenarios) {
    const name = `${target} frame target, tab ${background ? 'backgrounded' : 'in front'}`;
    test(name, async ({ page, context }) => {
      mkdirSync(CAPTURES, { recursive: true });
      const port = await freePort();
      // Long enough to catch the burst pattern, short enough to iterate on.
      // Raise it for a soak run: AUDIOPIPE_SECONDS=120 pnpm test:audiopipe
      const seconds = Number(process.env.AUDIOPIPE_SECONDS ?? 12);
      expect(Number.isInteger(seconds) && seconds >= 1 && seconds <= 120).toBe(true);
      await page.goto('/');
      await page.waitForFunction(
        () => ((window as any).getSamplePlayer?.()?.audiobuffer?.length ?? 0) > 0,
        undefined,
        { timeout: 30_000 },
      );
      await page.waitForFunction(() => Boolean((window as any).getAudioPipe));
      const rate = await page.evaluate(() => (window as any).getSamplePlayer().context.sampleRate);
      const probe = startProbe([
        '--rate',
        String(rate),
        '--port',
        String(port),
        '--target',
        String(target),
        '--seconds',
        String(seconds),
        '--wait',
        '60',
        '--out',
        `${CAPTURES}/target-${target}-${background ? 'background' : 'foreground'}`,
      ]);
      try {
        await probe.listening;
        await page.evaluate(
          (url) => (window as any).getAudioPipe().client.connect(url),
          `ws://127.0.0.1:${port}/audio`,
        );
        await expect
          .poll(() => page.evaluate(() => (window as any).getAudioPipe().state.status), {
            timeout: 10_000,
          })
          .toBe('connected');

        // A held chord plus a repeating note, so the capture is never silent and
        // a dropout shows up as a discontinuity rather than as a gap between notes.
        await page.evaluate(() => {
          const player = (window as any).getSamplePlayer();
          [48, 55, 60].forEach((note) => player.play(note, 100));
          (window as any).__pulse = setInterval(() => {
            player.release(72);
            player.play(72, 90);
          }, 500);
        });

        if (background) {
          // The focus switch the manual Chrome/Live test is trying to provoke.
          await page.waitForTimeout((seconds / 3) * 1000);
          const other = await context.newPage();
          await other.goto('about:blank');
          await other.bringToFront();
          await page.waitForTimeout((seconds / 3) * 1000);
          await page.bringToFront();
          await other.close();
        }

        const summary = await probe.finished;
        console.log(name, summary);
        expect(summary.rate).toBe(rate);
        expect(summary.callbacks).toBe(Math.floor((seconds * rate) / summary.block));

        // Probe lateness has to be small for any gap it reports to mean anything.
        expect(summary.maxLateMs, 'probe thread was descheduled').toBeLessThan(2);

        expect(summary.peak, 'capture is not silent').toBeGreaterThan(0.01);
        // A gap is audio the sender never delivered; the worklet's pool is the
        // only place it can go missing. Its drop counter would confirm that
        // directly, but it is only readable while the session is up -- the
        // probe's exit closes the socket, and the error state that follows
        // clears it -- and sampling it mid-run perturbs the timing measured here.
        expect(summary.gaps, 'sender dropped packets').toBe(0);
        expect(summary.overruns, 'producer outran the ring').toBe(0);
        expect(summary.resyncs, 'backlog hit the ceiling').toBe(0);
        expect(summary.queueMax, 'queue grew past the ceiling').toBeLessThanOrEqual(4800);
        // Coarse discontinuity guard only: sample content also affects this metric.
        // It is not evidence that the capture is click-free.
        expect(summary.maxStep, 'output stepped like a click').toBeLessThan(0.25);

        // Regression ceiling, not an acceptable playback quality target.
        // Bursts seen here do not identify which browser/network stage stalled.
        expect(summary.underruns / seconds, 'underruns per second').toBeLessThan(1);
      } finally {
        await page
          .evaluate(() => {
            clearInterval((window as any).__pulse);
            (window as any).getSamplePlayer?.()?.releaseAll();
            (window as any).getAudioPipe?.()?.client.disconnect();
          })
          .catch(() => {});
        probe.kill();
      }
    });
  }
});
