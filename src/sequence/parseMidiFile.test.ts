import { expect, test } from 'vite-plus/test';

import { parseMidiFile } from './parseMidiFile';

const hex = (bytes: string) => bytes.split(/\s+/).map((b) => parseInt(b, 16));
const chunk = (tag: string, body: number[]) => {
  const n = body.length;
  const tagBytes = tag.split('').map((c) => c.charCodeAt(0));
  return [...tagBytes, n >>> 24, (n >> 16) & 255, (n >> 8) & 255, n & 255, ...body];
};

test('parseMidiFile merges tracks, handling running status, meta and note-on velocity 0', () => {
  const file = [
    // Format 1, 2 tracks, 96 ticks per quarter.
    ...chunk('MThd', hex('00 01 00 02 00 60')),
    // Text meta, note-on, a running-status note-on with velocity 0 48 ticks
    // later, then end of track after a two-byte delta of 128 ticks.
    ...chunk('MTrk', hex('00 ff 01 02 68 69  00 90 3c 64  30 3c 00  81 00 ff 2f 00')),
    // Program change, then a note on channel 2 from tick 96 to 192.
    ...chunk('MTrk', hex('00 c1 05  60 91 40 5a  60 81 40 00  00 ff 2f 00')),
  ];

  expect(parseMidiFile(new Uint8Array(file).buffer)).toEqual({
    length: 1, // longest track ends at tick 192 = two quarters at the default 120bpm
    events: [
      { time: 0, note: 60, velocity: 100 },
      { time: 0.25, note: 60, velocity: 0 },
      { time: 0.5, note: 64, velocity: 90 },
      { time: 1, note: 64, velocity: 0 },
    ],
  });
});

test('parseMidiFile follows tempo changes from another track', () => {
  const file = [
    ...chunk('MThd', hex('00 01 00 02 00 60')),
    // 120bpm, then 240bpm from tick 96.
    ...chunk('MTrk', hex('00 ff 51 03 07 a1 20  60 ff 51 03 03 d0 90  00 ff 2f 00')),
    // A note from tick 0 to 192.
    ...chunk('MTrk', hex('00 90 3c 64  81 40 80 3c 00  00 ff 2f 00')),
  ];

  expect(parseMidiFile(new Uint8Array(file).buffer)).toEqual({
    length: 0.75, // a quarter at 120bpm plus a quarter at 240bpm
    events: [
      { time: 0, note: 60, velocity: 100 },
      { time: 0.75, note: 60, velocity: 0 },
    ],
  });
});

test('parseMidiFile rejects non-MIDI data', () => {
  expect(() => parseMidiFile(new Uint8Array(20).buffer)).toThrow('Not a MIDI file');
});

test('parseMidiFile rejects a data byte before the first status byte', () => {
  const file = [...chunk('MThd', hex('00 00 00 01 00 60')), ...chunk('MTrk', hex('00 3c 64'))];
  expect(() => parseMidiFile(new Uint8Array(file).buffer)).toThrow('Missing MIDI status byte');
});

test.each([
  ['declared chunk beyond the file', hex('00 90 3c 64'), 10],
  ['unfinished delta time', hex('81'), undefined],
  ['unfinished note event', hex('00 90 3c'), undefined],
  ['meta payload beyond the track', hex('00 ff 01 02 68'), undefined],
  ['sysex payload beyond the track', hex('00 f0 02 68'), undefined],
])('parseMidiFile rejects a truncated track: %s', (_case, body, declaredLength) => {
  const track = chunk('MTrk', body);
  if (declaredLength !== undefined) track[7] = declaredLength;
  const file = [...chunk('MThd', hex('00 00 00 01 00 60')), ...track];
  expect(() => parseMidiFile(new Uint8Array(file).buffer)).toThrow('Truncated MIDI track');
});
