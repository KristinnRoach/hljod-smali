import type { SupportedWaveform } from '@kidlib/web-audio';

// These URLs are nested inside a CSS mask. Keep even the small SVGs as files:
// production data-URL inlining makes some mask values invalid.
import sineIcon from '../audio-elements/shared/assets/icons/svg/waveworm/sine.svg?no-inline';
import sawtoothIcon from '../audio-elements/shared/assets/icons/svg/waveworm/sawtooth.svg?no-inline';
import triangleIcon from '../audio-elements/shared/assets/icons/svg/waveworm/triangle.svg?no-inline';
import squareIcon from '../audio-elements/shared/assets/icons/svg/waveworm/square.svg?no-inline';
import blSawIcon from '../audio-elements/shared/assets/icons/svg/waveworm/bl-saw.svg?no-inline';
import brownNoiseIcon from '../audio-elements/shared/assets/icons/svg/waveworm/brown-noise.svg?no-inline';
import coloredNoiseIcon from '../audio-elements/shared/assets/icons/svg/waveworm/colored-noise.svg?no-inline';
import customFunctionIcon from '../audio-elements/shared/assets/icons/svg/waveworm/custom-function.svg?no-inline';
import formantIcon from '../audio-elements/shared/assets/icons/svg/waveworm/formant.svg?no-inline';
import metallicIcon from '../audio-elements/shared/assets/icons/svg/waveworm/metallic.svg?no-inline';
import pinkNoiseIcon from '../audio-elements/shared/assets/icons/svg/waveworm/pink-noise.svg?no-inline';
import pulseIcon from '../audio-elements/shared/assets/icons/svg/waveworm/pulse.svg?no-inline';
import randomHarmonicIcon from '../audio-elements/shared/assets/icons/svg/waveworm/random-harmonic.svg?no-inline';
import supersawIcon from '../audio-elements/shared/assets/icons/svg/waveworm/supersaw.svg?no-inline';
import warmPadIcon from '../audio-elements/shared/assets/icons/svg/waveworm/warmpad.svg?no-inline';
import whiteNoiseIcon from '../audio-elements/shared/assets/icons/svg/waveworm/white.svg?no-inline';

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
