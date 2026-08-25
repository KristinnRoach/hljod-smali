import { createSignal, onCleanup, type Component } from 'solid-js';

interface SolidKnobProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  onChangeEnd?: (value: number) => void;
}

export const SolidKnob: Component<SolidKnobProps> = (props) => {
  const [isDragging, setIsDragging] = createSignal(false);

  let startY = 0;
  let startValue = props.value;
  let currentValue = props.value;

  const step = () => props.step ?? 0.01;
  const progress = () => (props.value - props.min) / (props.max - props.min);
  const rotation = () => progress() * 270 - 135;

  const handleMouseMove = (event: MouseEvent) => {
    const range = props.max - props.min;
    const delta = startY - event.clientY;
    const nextValue = startValue + delta * (range / 150);
    const clampedValue = Math.max(props.min, Math.min(props.max, nextValue));
    const steppedValue = Math.round(clampedValue / step()) * step();

    currentValue = Math.max(props.min, Math.min(props.max, steppedValue));
    props.onChange(currentValue);
  };

  const stopDragging = () => {
    if (!isDragging()) return;

    setIsDragging(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', stopDragging);
    props.onChangeEnd?.(currentValue);
  };

  const startDragging = (event: MouseEvent) => {
    event.preventDefault();
    setIsDragging(true);
    startY = event.clientY;
    startValue = props.value;
    currentValue = props.value;

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopDragging);
  };

  onCleanup(() => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', stopDragging);
  });

  return (
    <div
      style={{
        display: 'flex',
        'flex-direction': 'column',
        'align-items': 'center',
        gap: '4px',
        'user-select': 'none',
        width: '64px',
      }}
    >
      <span
        style={{
          'font-size': '10px',
          color: '#888',
          'text-transform': 'uppercase',
          'letter-spacing': '0.5px',
          'white-space': 'nowrap',
        }}
      >
        {props.label}
      </span>

      <div
        role="slider"
        aria-label={props.label}
        aria-valuemin={props.min}
        aria-valuemax={props.max}
        aria-valuenow={props.value}
        onMouseDown={startDragging}
        style={{
          width: '44px',
          height: '44px',
          'border-radius': '50%',
          background: `conic-gradient(from -135deg, #00d9ff ${progress() * 270}deg, #333 0deg)`,
          display: 'flex',
          'align-items': 'center',
          'justify-content': 'center',
          cursor: isDragging() ? 'grabbing' : 'grab',
          'box-shadow': isDragging() ? '0 0 16px #00d9ff55' : '0 2px 8px #0005',
          transition: 'box-shadow 0.2s',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            'border-radius': '50%',
            background: '#1a1a2e',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              width: '2px',
              height: '10px',
              background: '#00d9ff',
              'border-radius': '2px',
              top: '4px',
              left: '17px',
              'transform-origin': 'center 14px',
              transform: `rotate(${rotation()}deg)`,
            }}
          />
        </div>
      </div>

      <span style={{ 'font-size': '12px', 'font-weight': 600, color: '#fff' }}>
        {props.value.toFixed(step() < 0.01 ? 3 : step() < 1 ? 2 : 0)}
        {props.unit ?? ''}
      </span>
    </div>
  );
};

export default SolidKnob;


/* Usage example: 

  <SolidKnob
    label={samplerParams.volume.label}
    value={samplerParamValues().volume}
    min={samplerParams.volume.min}
    max={samplerParams.volume.max}
    step={samplerParams.volume.step ?? 0.01}
    onChange={(value) => setSamplerParamValue('volume', value)}
  />

*/