// WebMCP tools: let an agent drive the app through the same paths as the UI.
// Chrome needs chrome://flags/#enable-webmcp-testing.
//
// To add a tool, add one `registerTool` call below. Keep the schema inline so
// `execute`'s input is typed from it. Return a short string saying what happened.
import { samplerParams, type SamplerParamKey } from '@kidlib/web-audio';

import { getSamplePlayer } from '@/sampler/samplePlayer';
import { samplerParamValues, setSamplerParamValue } from '@/sampler/samplerParamState';

// No knob applies these to audio (see applyParams in App.tsx), so setting them would be a no-op.
const storeOnly = new Set<string>(['drive', 'clipping']);
const settableParams = Object.entries(samplerParams).filter(([key]) => !storeOnly.has(key));

// Same limits as the loop/trim knobs' minAllowed/maxAllowed in App.tsx.
type Values = ReturnType<typeof samplerParamValues>;
const dependentBounds: Partial<
  Record<SamplerParamKey, (v: Values) => { min?: number; max?: number }>
> = {
  loopStart: (v) => ({ min: v.trimStart, max: v.loopEnd }),
  loopEnd: (v) => ({ min: v.loopStart, max: v.trimEnd }),
  trimStart: (v) => ({ max: v.trimEnd }),
  trimEnd: (v) => ({ min: v.trimStart }),
};

/** Registers every tool. Returns a function that unregisters them. */
export function registerWebmcpTools(inspectSampler: () => object): () => void {
  const controller = new AbortController();
  const modelContext = document.modelContext;
  if (!modelContext) return () => {};
  const options = { signal: controller.signal };
  // Aborting on cleanup rejects a pending registration; only report real failures.
  const onError = (error: unknown) => {
    if (!controller.signal.aborted) console.error('WebMCP registerTool failed', error);
  };

  modelContext
    .registerTool(
      {
        name: 'inspect_sampler',
        description: 'Read the current sampler readiness, sample, instrument, and parameter state.',
        inputSchema: { type: 'object', properties: {} },
        annotations: { readOnlyHint: true },
        execute: () => JSON.stringify(inspectSampler()),
      },
      options,
    )
    .catch(onError);

  modelContext
    .registerTool(
      {
        name: 'play_note',
        description:
          'Play a MIDI note on the current sampler. Starts the note only; it is not released.',
        inputSchema: {
          type: 'object',
          properties: {
            midiNote: { type: 'number', description: 'MIDI note number to play.' },
            velocity: { type: 'number', description: 'Optional MIDI velocity.' },
            glideTime: { type: 'number', description: 'Optional glide time in seconds.' },
          },
          required: ['midiNote'],
        },
        execute: ({ midiNote, velocity, glideTime }) => {
          const player = getSamplePlayer();
          if (!player) throw new Error('Sampler is not ready.');
          player.play(midiNote, velocity, glideTime);
          return `Playing ${midiNote}.`;
        },
      },
      options,
    )
    .catch(onError);

  modelContext
    .registerTool(
      {
        name: 'set_sampler_param',
        description:
          'Set a sampler parameter, same as turning its knob. Returns the value in effect.',
        inputSchema: {
          type: 'object',
          properties: {
            param: {
              type: 'string',
              enum: settableParams.map(([key]) => key),
              description: settableParams
                .map(([key, desc]) => `${key} (${desc.min}..${desc.max})`)
                .join(', '),
            },
            value: { type: 'number' },
          },
          required: ['param', 'value'],
        },
        execute: ({ param, value }) => {
          if (!settableParams.some(([key]) => key === param)) {
            throw new Error(`Unknown param "${param}".`);
          }
          const key = param as SamplerParamKey;
          const { min, max, allowedValues } = samplerParams[key];
          const dependent = dependentBounds[key]?.(samplerParamValues());
          const lo = Math.max(min, dependent?.min ?? min);
          const hi = Math.min(max, dependent?.max ?? max);
          if (!(value >= lo && value <= hi)) throw new Error(`${key} must be in ${lo}..${hi}.`);
          if (allowedValues && !allowedValues.includes(value)) {
            throw new Error(`${key} must be one of ${allowedValues.join(', ')}.`);
          }
          setSamplerParamValue(key, value);
          return `${key} = ${samplerParamValues()[key]}`;
        },
      },
      options,
    )
    .catch(onError);

  return () => controller.abort();
}
