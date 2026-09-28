import { toSequence, type Sequence, type SequenceEvent } from './sequence';

// The SMF default until the file sets a tempo.
const DEFAULT_US_PER_QUARTER = 500_000; // 120bpm

/**
 * Reads a Standard MIDI File's notes into a Sequence, all tracks and channels
 * merged, timed by the file's tempo changes. The loop length is where the
 * longest track ends. Returns null if the file has no notes.
 */
export function parseMidiFile(buffer: ArrayBuffer): Sequence | null {
  const data = new DataView(buffer);
  const tag = (at: number) => String.fromCharCode(...new Uint8Array(buffer, at, 4));
  if (data.byteLength < 14 || tag(0) !== 'MThd') throw new Error('Not a MIDI file');
  if (data.getUint16(8) === 2) throw new Error('Format-2 MIDI files are not supported');
  const declaredTracks = data.getUint16(10);
  const division = data.getUint16(12);
  if (division & 0x8000) throw new Error('SMPTE-timed MIDI files are not supported');

  // Times are in ticks until the tempo map is known, since tempo changes can
  // sit in another track.
  const events: SequenceEvent[] = [];
  const tempos: { tick: number; usPerQuarter: number }[] = [];
  let lastTick = 0;
  let p = 8 + data.getUint32(4);
  let trackEnd = 0;
  let parsedTracks = 0;
  const byte = () => {
    if (p >= trackEnd) throw new Error('Truncated MIDI track');
    return data.getUint8(p++);
  };
  const varLength = () => {
    let value = 0;
    let b;
    do {
      b = byte();
      value = (value << 7) | (b & 0x7f);
    } while (b & 0x80);
    return value;
  };

  while (p + 8 <= data.byteLength) {
    const isTrack = tag(p) === 'MTrk';
    const end = p + 8 + data.getUint32(p + 4);
    if (end > data.byteLength) throw new Error('Truncated MIDI track');
    if (isTrack) parsedTracks++;
    p += 8;
    trackEnd = end;
    let tick = 0;
    let status = 0;
    while (isTrack && p < end) {
      tick += varLength();
      const first = byte();
      if (first === 0xff) {
        const type = byte();
        const length = varLength();
        if (p + length > end) throw new Error('Truncated MIDI track');
        if (type === 0x51 && length === 3) {
          tempos.push({ tick, usPerQuarter: (data.getUint8(p) << 16) | data.getUint16(p + 1) });
        }
        p += length;
        continue;
      }
      if (first === 0xf0 || first === 0xf7) {
        const length = varLength();
        if (p + length > end) throw new Error('Truncated MIDI track');
        p += length;
        continue;
      }
      // Without a status byte, the event reuses the previous one (running status).
      if (first & 0x80) status = first;
      else {
        if (status === 0) throw new Error('Missing MIDI status byte');
        p--;
      }
      const kind = status & 0xf0;
      const note = byte();
      if (kind === 0xc0 || kind === 0xd0) continue; // one data byte
      const velocity = byte();
      if (kind === 0x90 || kind === 0x80) {
        events.push({ time: tick, note, velocity: kind === 0x90 ? velocity : 0 });
      }
    }
    lastTick = Math.max(lastTick, tick);
    p = end;
  }

  if (parsedTracks !== declaredTracks) throw new Error('MIDI track count does not match header');
  if (!events.length) return null;
  const seconds = tickToSeconds(tempos, division);
  return toSequence(
    events.map((event) => ({ ...event, time: seconds(event.time) })),
    seconds(lastTick),
  );
}

// ponytail: walks the tempo map for every event, O(events × tempo changes).
// Fine for files with a handful of tempo changes.
function tickToSeconds(tempos: { tick: number; usPerQuarter: number }[], division: number) {
  const sorted = tempos.toSorted((a, b) => a.tick - b.tick);
  return (tick: number) => {
    let seconds = 0;
    let from = 0;
    let usPerQuarter = DEFAULT_US_PER_QUARTER;
    for (const tempo of sorted) {
      if (tempo.tick >= tick) break;
      seconds += ((tempo.tick - from) * usPerQuarter) / division / 1e6;
      from = tempo.tick;
      usPerQuarter = tempo.usPerQuarter;
    }
    return seconds + ((tick - from) * usPerQuarter) / division / 1e6;
  };
}
