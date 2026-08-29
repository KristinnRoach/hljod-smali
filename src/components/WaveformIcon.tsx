import type { SupportedWaveform } from '@kidlib/web-audio';

import sineIcon from '../assets/waveforms/sine.svg';
import sawtoothIcon from '../assets/waveforms/sawtooth.svg';
import triangleIcon from '../assets/waveforms/triangle.svg';
import squareIcon from '../assets/waveforms/square.svg';
import blSawIcon from '../assets/waveforms/bl-saw.svg';
import brownNoiseIcon from '../assets/waveforms/brown-noise.svg';
import coloredNoiseIcon from '../assets/waveforms/colored-noise.svg';
import customFunctionIcon from '../assets/waveforms/custom-function.svg';
import formantIcon from '../assets/waveforms/formant.svg';
import metallicIcon from '../assets/waveforms/metallic.svg';
import pinkNoiseIcon from '../assets/waveforms/pink-noise.svg';
import pulseIcon from '../assets/waveforms/pulse.svg';
import randomHarmonicIcon from '../assets/waveforms/random-harmonic.svg';
import supersawIcon from '../assets/waveforms/supersaw.svg';
import warmPadIcon from '../assets/waveforms/warmpad.svg';
import whiteNoiseIcon from '../assets/waveforms/white.svg';

const ICONS: Record<SupportedWaveform, string> = {
  sine: sineIcon,
  sawtooth: sawtoothIcon,
  triangle: triangleIcon,
  square: squareIcon,
  'bandlimited-sawtooth': blSawIcon,
  'brown-noise': brownNoiseIcon,
  'colored-noise': coloredNoiseIcon,
  'custom-function': customFunctionIcon,
  formant: formantIcon,
  metallic: metallicIcon,
  'pink-noise': pinkNoiseIcon,
  pulse: pulseIcon,
  'random-harmonic': randomHarmonicIcon,
  supersaw: supersawIcon,
  'warm-pad': warmPadIcon,
  'white-noise': whiteNoiseIcon,
};

type WaveformIconProps = {
  waveform: SupportedWaveform;
};

/** Reusable visual for native-select triggers and future custom option rows. */
const WaveformIcon = (props: WaveformIconProps) => (
  <span
    aria-hidden="true"
    class="waveform-icon"
    data-waveform={props.waveform}
    style={`--waveform-icon: url("${ICONS[props.waveform]}")`}
  />
);

export default WaveformIcon;
