import type { SupportedWaveform } from '@kidlib/web-audio';

import sineIcon from '../audio-elements/shared/assets/icons/svg/waveworm/sine.svg?url';
import sawtoothIcon from '../audio-elements/shared/assets/icons/svg/waveworm/sawtooth.svg?url';
import triangleIcon from '../audio-elements/shared/assets/icons/svg/waveworm/triangle.svg?url';
import squareIcon from '../audio-elements/shared/assets/icons/svg/waveworm/square.svg?url';
import blSawIcon from '../audio-elements/shared/assets/icons/svg/waveworm/bl-saw.svg?url';
import brownNoiseIcon from '../audio-elements/shared/assets/icons/svg/waveworm/brown-noise.svg?url';
import coloredNoiseIcon from '../audio-elements/shared/assets/icons/svg/waveworm/colored-noise.svg?url';
import customFunctionIcon from '../audio-elements/shared/assets/icons/svg/waveworm/custom-function.svg?url';
import formantIcon from '../audio-elements/shared/assets/icons/svg/waveworm/formant.svg?url';
import metallicIcon from '../audio-elements/shared/assets/icons/svg/waveworm/metallic.svg?url';
import pinkNoiseIcon from '../audio-elements/shared/assets/icons/svg/waveworm/pink-noise.svg?url';
import pulseIcon from '../audio-elements/shared/assets/icons/svg/waveworm/pulse.svg?url';
import randomHarmonicIcon from '../audio-elements/shared/assets/icons/svg/waveworm/random-harmonic.svg?url';
import supersawIcon from '../audio-elements/shared/assets/icons/svg/waveworm/supersaw.svg?url';
import warmPadIcon from '../audio-elements/shared/assets/icons/svg/waveworm/warmpad.svg?url';
import whiteNoiseIcon from '../audio-elements/shared/assets/icons/svg/waveworm/white.svg?url';

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
