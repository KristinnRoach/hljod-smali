// Dev-only level metering for chasing distortion/clipping. Nothing is created
// until `audioDebug.start()` is called from the console; see
// @kidlib/web-audio/src/debug/levelMeters.ts for what the taps cost (nothing).
import { monitorLevels, type LevelMonitors } from '@kidlib/web-audio/debug';
import type { SamplePlayer } from '@kidlib/web-audio';

// Bar range. Anything quieter than this is off the left edge.
const FLOOR_DB = -60;

/** Overlay: one row per stage, peak bar + rms tick + clip count. */
function createMeterPanel(labels: string[]) {
  const panel = document.createElement('div');
  panel.style.cssText = `position:fixed;top:8px;right:8px;z-index:9999;padding:6px 8px;
    background:#000c;color:#eee;font:11px ui-monospace,monospace;border-radius:6px;
    pointer-events:none;display:grid;grid-template-columns:auto 120px auto;gap:2px 6px;align-items:center`;

  const rows = labels.map((label) => {
    const name = document.createElement('span');
    name.textContent = label;
    const track = document.createElement('div');
    track.style.cssText = 'height:8px;background:#333;border-radius:2px;position:relative';
    const peak = document.createElement('div');
    peak.style.cssText = 'height:100%;width:0;background:#4c9;border-radius:2px';
    const rms = document.createElement('div');
    rms.style.cssText = 'position:absolute;top:0;bottom:0;width:2px;left:0;background:#fff8';
    const readout = document.createElement('span');
    track.append(peak, rms);
    panel.append(name, track, readout);
    return { peak, rms, readout };
  });

  document.body.append(panel);

  const pct = (db: number) => Math.max(0, Math.min(1, (db - FLOOR_DB) / -FLOOR_DB)) * 100;

  return {
    update(readings: Record<string, { peakDB: number; rmsDB: number; clipCount: number }>) {
      labels.forEach((label, i) => {
        const { peakDB, rmsDB, clipCount } = readings[label];
        const row = rows[i];
        row.peak.style.width = `${pct(peakDB)}%`;
        // Over 0 dB is the thing to fix, so make it loud visually.
        row.peak.style.background = peakDB > 0 ? '#e44' : peakDB > -6 ? '#ec4' : '#4c9';
        row.rms.style.left = `${pct(rmsDB)}%`;
        row.readout.textContent = `${peakDB.toFixed(1)}${clipCount ? ` !${clipCount}` : ''}`;
        row.readout.style.color = clipCount ? '#e44' : '#999';
      });
    },
    remove: () => panel.remove(),
  };
}

export function installAudioDebug(player: SamplePlayer) {
  let monitors: LevelMonitors | null = null;
  let panel: ReturnType<typeof createMeterPanel> | null = null;
  let frame = 0;
  let logTimer: number | undefined;
  // Bumped by every start/stop so a monitorLevels() that resolves after a newer
  // start() -- or after stop() -- throws its taps away instead of installing them.
  let generation = 0;

  const start = async (log = true) => {
    stop();
    const mine = generation;
    const stages = player.getGainStages(); // or player.getGainStages({ includeVoices: false })
    const started = await monitorLevels(stages);
    if (mine !== generation) {
      started.stop();
      return 'metering: superseded by a newer start()/stop()';
    }
    monitors = started;
    panel = createMeterPanel(Object.keys(stages));

    const tick = () => {
      if (!monitors || !panel) return;
      panel.update(monitors.readLevels());
      frame = requestAnimationFrame(tick);
    };
    tick();
    if (log) logTimer = window.setInterval(() => console.table(monitors?.readLevels()), 1000);
    return 'metering: audioDebug.stop() to end, audioDebug.read() to log numbers';
  };

  const stop = () => {
    generation++;
    cancelAnimationFrame(frame);
    clearInterval(logTimer);
    logTimer = undefined;
    panel?.remove();
    panel = null;
    monitors?.stop();
    monitors = null;
  };

  (window as any).audioDebug = {
    start,
    stop,
    read: () => monitors?.readLevels(),
  };

  /** Tears down any active metering and removes the console handle. */
  return () => {
    stop();
    delete (window as any).audioDebug;
  };
}
