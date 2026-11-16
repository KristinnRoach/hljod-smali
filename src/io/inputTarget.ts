import type { NoteTarget } from '@kidlib/web-audio/io';

export type InputTarget = NoteTarget & {
  releaseAll: () => void;
  setLoopEnabled: (enabled: boolean) => void;
  setHoldEnabled: (enabled: boolean) => void;
  setSustainPedal: (enabled: boolean) => void;
};

/** One input event fans out here, so the sequence recorder still hears it once. */
export function createLayeredInput(getPlayers: () => readonly InputTarget[]): InputTarget {
  const held = new Map<number, InputTarget[][]>();
  let loop = false;
  let hold = false;
  let sustain = false;
  const initialized = new WeakSet<InputTarget>();
  const players = () => {
    const current = getPlayers();
    for (const player of current) {
      if (initialized.has(player)) continue;
      player.setLoopEnabled(loop);
      player.setHoldEnabled(hold);
      player.setSustainPedal(sustain);
      initialized.add(player);
    }
    return current;
  };
  return {
    play(note, velocity = 100) {
      if (!velocity) return this.release(note);
      const targets = [...players()];
      const pending = held.get(note) ?? [];
      pending.push(targets);
      held.set(note, pending);
      targets.forEach((player) => player.play(note, velocity));
    },
    release(note) {
      const pending = held.get(note);
      pending?.shift()?.forEach((player) => player.release(note));
      if (!pending?.length) held.delete(note);
    },
    releaseAll() {
      const targets = new Set([...getPlayers(), ...[...held.values()].flat(2)]);
      targets.forEach((player) => player.releaseAll());
      held.clear();
    },
    setLoopEnabled(enabled) {
      const current = players();
      loop = enabled;
      current.forEach((player) => player.setLoopEnabled(enabled));
    },
    setHoldEnabled(enabled) {
      const current = players();
      hold = enabled;
      current.forEach((player) => player.setHoldEnabled(enabled));
    },
    setSustainPedal(enabled) {
      const current = players();
      sustain = enabled;
      current.forEach((player) => player.setSustainPedal(enabled));
    },
  };
}
