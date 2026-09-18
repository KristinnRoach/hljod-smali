import { test, expect } from '@playwright/test';
import { spawn } from 'node:child_process';
import { readFileSync, mkdirSync } from 'node:fs';
import { createServer } from 'node:net';
import { resolve } from 'node:path';

/**
 * Drives the real browser sender against the native AudioPipe receiver, with
 * Ableton out of the loop. What this covers that a unit test cannot: Chrome's
 * own scheduling of the worklet, the worker and the socket, including what a
 * backgrounded tab does to it. What it still does not cover: a DAW audio
 * callback, and anything audible. The capture is written out so it can be heard.
 *
 * Skipped unless the probe has been built. Run with:
 *   cmake --build ../audiopipe/build --target audiopipe_probe
 *   pnpm exec playwright test tests/audio-pipe.spec.ts
 */
const PROBE = resolve(import.meta.dirname, '../../audiopipe/build/audiopipe_probe');
const CAPTURES = resolve(import.meta.dirname, '../test-results/audio-pipe');

type Summary = {
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
    child.once('exit', () => fail(new Error(`probe exited early: ${stderr}`)));
  });
  const finished = new Promise<Summary>((done, fail) =>
    child.once('exit', (code) =>
      code === 0
        ? done(JSON.parse(stdout) as Summary)
        : fail(new Error(stderr || `probe exit ${code}`)),
    ),
  );
  return { listening, finished, kill: () => child.kill() };
}

test.describe('AudioPipe bridge against the native receiver', () => {
  test.skip(() => {
    try {
      readFileSync(PROBE);
      return false;
    } catch {
      return true;
    }
  }, 'build audiopipe_probe first: cmake --build ../audiopipe/build --target audiopipe_probe');

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
      // Raise it for a soak run: AUDIOPIPE_SECONDS=120 pnpm exec playwright test ...
      const seconds = Number(process.env.AUDIOPIPE_SECONDS ?? 12);
      const probe = startProbe([
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
      await probe.listening;

      try {
        await page.goto('/');
        await page.waitForFunction(
          () => ((window as any).getSamplePlayer?.()?.audiobuffer?.length ?? 0) > 0,
          undefined,
          { timeout: 30_000 },
        );
        await page.waitForFunction(() => Boolean((window as any).getAudioPipe));
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

        // Probe lateness has to be small for any gap it reports to mean anything.
        expect(summary.maxLateMs, 'probe thread was descheduled').toBeLessThan(2);

        expect(summary.peak, 'capture is not silent').toBeGreaterThan(0.01);
        expect(summary.gaps, 'sender dropped packets').toBe(0);
        expect(summary.overruns, 'producer outran the ring').toBe(0);
        expect(summary.resyncs, 'backlog hit the ceiling').toBe(0);
        expect(summary.queueMax, 'queue grew past the ceiling').toBeLessThanOrEqual(4800);
        // Sampler audio has no fixed slope, so this only catches a hard cut to or
        // from silence, which is what a failed declick produces.
        expect(summary.maxStep, 'output stepped like a click').toBeLessThan(0.25);

        // Not a passing grade. The sender delivers in bursts far longer than any
        // target this plugin offers, so underruns cannot reach zero from the
        // receiver side; measured around 0.2/s. This ceiling only catches the
        // rate getting materially worse, and should drop once the sender is fixed.
        expect(summary.underruns / seconds, 'underruns per second').toBeLessThan(1);
      } finally {
        await page.evaluate(() => clearInterval((window as any).__pulse)).catch(() => {});
        probe.kill();
      }
    });
  }
});
